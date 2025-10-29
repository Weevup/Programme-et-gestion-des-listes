import express from "express";
import { arrivalsToCsv } from "./csv.js";
import { InMemoryStore } from "./store.js";
import {
  groupSchema,
  importPeopleSchema,
  membershipSchema,
  recomputeAssignmentsSchema,
  ruleSchema,
  sessionSchema,
  updatePersonSchema,
} from "./validators.js";

export function createServer(store: InMemoryStore) {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.get("/events/:eventId/summary", (req, res) => {
    const { eventId } = req.params;
    const event = store.getEvent(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const sessions = store.sessions.filter((session) => session.eventId === eventId);
    const groups = store.groups.filter((group) => group.eventId === eventId);
    const people = store.getEventPeople(eventId);

    res.json({
      event,
      counts: {
        sessions: sessions.length,
        groups: groups.length,
        participants: people.length,
      },
      tracks: store.tracks.filter((track) => track.eventId === eventId),
    });
  });

  app.get("/events/:eventId/sessions", (req, res) => {
    const { eventId } = req.params;
    const { day, track, type } = req.query;
    const event = store.getEvent(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    let sessions = store.sessions.filter((session) => session.eventId === eventId);
    if (day) sessions = sessions.filter((session) => session.day === day);
    if (track) sessions = sessions.filter((session) => session.trackId === track);
    if (type) sessions = sessions.filter((session) => session.type === type);

    res.json({
      event,
      sessions,
    });
  });

  app.post("/events/:eventId/sessions", (req, res) => {
    const { eventId } = req.params;
    const event = store.getEvent(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    const parseResult = sessionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid session", details: parseResult.error.flatten() });
    }

    const newSession = store.upsertSessionForEvent(eventId, {
      ...parseResult.data,
      eventId,
    });
    if (!newSession) return res.status(404).json({ error: "Session not found" });

    res.status(201).json(newSession);
  });

  app.patch("/sessions/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const session = store.getSession(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    const parseResult = sessionSchema.partial().safeParse({ ...session, ...req.body, id: sessionId });
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid session", details: parseResult.error.flatten() });
    }
    const updated = { ...session, ...req.body };
    store.upsertSession(updated);
    res.json(updated);
  });

  app.get("/events/:eventId/groups", (req, res) => {
    const { eventId } = req.params;
    const event = store.getEvent(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    const groups = store.groups.filter((group) => group.eventId === eventId);
    res.json(groups);
  });

  app.post("/events/:eventId/groups", (req, res) => {
    const { eventId } = req.params;
    const event = store.getEvent(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    const parsed = groupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid group", details: parsed.error.flatten() });
    }
    const newGroup = store.createGroup({ ...parsed.data, eventId });
    res.status(201).json(newGroup);
  });

  app.post("/groups/:groupId/rules", (req, res) => {
    const { groupId } = req.params;
    const group = store.groups.find((g) => g.id === groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    const parsed = ruleSchema.safeParse({ ...req.body, groupId });
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid rule", details: parsed.error.flatten() });
    }
    const newRule = store.createRule(parsed.data);
    res.status(201).json(newRule);
  });

  app.get("/events/:eventId/people", (req, res) => {
    const { eventId } = req.params;
    const event = store.getEvent(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const { group, missing } = req.query;
    const people = store.getEventPeople(eventId).filter((person) => {
      if (group) {
        const membership = store.memberships.some((membership) => membership.personId === person.id && membership.groupId === group);
        if (!membership) return false;
      }
      if (missing === "allergens") {
        const allergens = person.diet?.allergens ?? [];
        return allergens.length === 0;
      }
      if (missing === "transport") {
        return !person.transport?.arrival;
      }
      return true;
    });

    res.json({
      people,
    });
  });

  app.post("/events/:eventId/people/import", (req, res) => {
    const { eventId } = req.params;
    const event = store.getEvent(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    const parsed = importPeopleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const diagnostics = store.importPeople(eventId, parsed.data.people, "import");
    res.status(202).json({ diagnostics });
  });

  app.get("/people/:personId", (req, res) => {
    const { personId } = req.params;
    const person = store.getPerson(personId);
    if (!person) return res.status(404).json({ error: "Person not found" });
    const memberships = store.memberships.filter((membership) => membership.personId === personId);
    const enrollments = store.enrollments.filter((enrollment) => enrollment.personId === personId);
    res.json({ person, memberships, enrollments });
  });

  app.patch("/people/:personId", (req, res) => {
    const { personId } = req.params;
    const person = store.getPerson(personId);
    if (!person) return res.status(404).json({ error: "Person not found" });
    const parsed = updatePersonSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid person", details: parsed.error.flatten() });
    }
    const updated = store.updatePerson(personId, parsed.data, req.headers["x-actor-id"]?.toString() ?? "api");
    res.json(updated);
  });

  app.post("/people/:personId/memberships", (req, res) => {
    const { personId } = req.params;
    const person = store.getPerson(personId);
    if (!person) return res.status(404).json({ error: "Person not found" });
    const parsed = membershipSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid memberships", details: parsed.error.flatten() });
    }
    store.setPersonMemberships(personId, parsed.data.groupIds, req.headers["x-actor-id"]?.toString() ?? "api");
    res.status(204).send();
  });

  app.post("/assignments/recompute", (req, res) => {
    const { event_id: eventId } = req.query;
    if (typeof eventId !== "string") {
      return res.status(400).json({ error: "event_id query parameter is required" });
    }
    const event = store.getEvent(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    const parsed = recomputeAssignmentsSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }
    const diagnostics = store.recomputeAssignments(eventId);
    res.json({
      eventId,
      diagnostics,
    });
  });

  app.get("/people/:personId/itinerary.pdf", (_req, res) => {
    res.status(501).json({ error: "PDF generation not yet implemented" });
  });

  app.get("/events/:eventId/exports/arrivals.csv", (req, res) => {
    const { eventId } = req.params;
    const event = store.getEvent(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    const csv = arrivalsToCsv(store.getEventPeople(eventId));
    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", `attachment; filename=arrivals-${eventId}.csv`);
    res.send(csv);
  });

  return app;
}
