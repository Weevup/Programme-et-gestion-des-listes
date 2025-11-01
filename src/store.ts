import { nanoid } from "nanoid";
import {
  Accommodation,
  AssignmentDiagnostics,
  AuditLog,
  Enrollment,
  Event,
  Group,
  Membership,
  Person,
  Preferences,
  Rule,
  Session,
  Track,
  Transport,
} from "./models.js";

export type ImportPersonPayload = Omit<Person, "id" | "eventId"> & {
  memberships?: string[];
};

export class InMemoryStore {
  events: Event[] = [];
  tracks: Track[] = [];
  sessions: Session[] = [];
  locations: { id: string; name: string }[] = [];
  groups: Group[] = [];
  rules: Rule[] = [];
  people: Person[] = [];
  memberships: Membership[] = [];
  enrollments: Enrollment[] = [];
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    const eventId = nanoid();
    const plenaryTrack: Track = {
      id: nanoid(),
      eventId,
      name: "Plénières",
      color: "#0033FF",
      order: 0,
    };
    const workshopTrack: Track = {
      id: nanoid(),
      eventId,
      name: "Workshops",
      color: "#FF3366",
      order: 1,
    };

    const event: Event = {
      id: eventId,
      name: "Weevup Kickoff 2025",
      timezone: "Europe/Paris",
      startDate: "2025-09-16",
      endDate: "2025-09-19",
      branding: "https://cdn.example.com/branding.svg",
    };

    const groups: Group[] = [
      {
        id: nanoid(),
        eventId,
        code: "VIP",
        name: "Groupe VIP",
        color: "#FFD700",
        description: "Clients premium",
        tags: ["priority"],
      },
      {
        id: nanoid(),
        eventId,
        code: "FR",
        name: "Participants Francophones",
        color: "#0055FF",
        description: "Sessions en français",
        tags: ["lang=fr"],
      },
      {
        id: nanoid(),
        eventId,
        code: "EN",
        name: "Participants Anglophones",
        color: "#00AA88",
        description: "Sessions en anglais",
        tags: ["lang=en"],
      },
    ];

    const sessions: Session[] = [
      {
        id: nanoid(),
        eventId,
        code: "PLE-OPEN",
        title: "Plénière d'ouverture",
        type: "plenary",
        day: "2025-09-17",
        start: "2025-09-17T09:00:00+02:00",
        end: "2025-09-17T10:30:00+02:00",
        locationId: "main-hall",
        capacity: 400,
        trackId: plenaryTrack.id,
        description: "Présentation de la vision et des objectifs.",
        speakers: ["CEO", "Head of Events"],
        documents: ["agenda.pdf"],
        tags: ["keynote"],
      },
      {
        id: nanoid(),
        eventId,
        code: "WS-A",
        title: "Atelier produit A",
        type: "workshop",
        day: "2025-09-17",
        start: "2025-09-17T11:00:00+02:00",
        end: "2025-09-17T12:30:00+02:00",
        locationId: "studio-1",
        capacity: 40,
        trackId: workshopTrack.id,
        description: "Immersion produit.",
        speakers: ["PM Produit A"],
        documents: ["brief-a.pdf"],
        tags: ["product"],
      },
      {
        id: nanoid(),
        eventId,
        code: "WS-B",
        title: "Atelier produit B",
        type: "workshop",
        day: "2025-09-17",
        start: "2025-09-17T11:00:00+02:00",
        end: "2025-09-17T12:30:00+02:00",
        locationId: "studio-2",
        capacity: 40,
        trackId: workshopTrack.id,
        description: "Nouveautés produit B.",
        speakers: ["PM Produit B"],
        documents: ["brief-b.pdf"],
        tags: ["product"],
      },
      {
        id: nanoid(),
        eventId,
        code: "DIN-GALA",
        title: "Dîner de gala",
        type: "logistics",
        day: "2025-09-18",
        start: "2025-09-18T20:00:00+02:00",
        end: "2025-09-18T23:00:00+02:00",
        locationId: "ballroom",
        capacity: 200,
        trackId: plenaryTrack.id,
        description: "Soirée de gala et networking.",
        speakers: [],
        documents: [],
        tags: ["evening"],
      },
    ];

    const rules: Rule[] = [
      {
        id: nanoid(),
        groupId: groups[0]!.id,
        type: "include",
        sessionIds: [sessions[0]!.id, sessions[3]!.id],
        priority: 90,
        quota: null,
      },
      {
        id: nanoid(),
        groupId: groups[1]!.id,
        type: "optional",
        sessionIds: [sessions[1]!.id],
        priority: 70,
        quota: null,
      },
      {
        id: nanoid(),
        groupId: groups[2]!.id,
        type: "optional",
        sessionIds: [sessions[2]!.id],
        priority: 70,
        quota: null,
      },
    ];

    const alice: Person = {
      id: nanoid(),
      eventId,
      externalId: "CUST-001",
      firstName: "Alice",
      lastName: "Martin",
      email: "alice@example.com",
      phone: "+33600000000",
      company: "ACME",
      role: "Marketing",
      notes: "Arrivée anticipée",
      diet: { allergens: ["arachide", "gluten"], preferences: ["végétarien"] },
      accessibility: "PMR",
      transport: {
        arrival: {
          mode: "flight",
          number: "AF1234",
          date: "2025-09-17",
          time: "10:25",
          from: "NCE",
        },
        departure: {
          mode: "train",
          number: "TGV8421",
          date: "2025-09-19",
          time: "18:02",
          to: "LYS",
        },
      },
      accommodation: {
        hotel: "Hotel Parsifal",
        checkin: "2025-09-17",
        checkout: "2025-09-19",
        room: "204",
      },
      preferences: {
        workshops: ["WS-A", "WS-C"],
        team_building: ["TB-1"],
        comments: "Préférence pour les sessions interactives",
      },
    };

    const bob: Person = {
      id: nanoid(),
      eventId,
      externalId: "CUST-002",
      firstName: "Bob",
      lastName: "Dupont",
      email: "bob@example.com",
      phone: "+33600000001",
      company: "Globex",
      role: "CTO",
      notes: "Arrive avec le vol VIP",
      diet: { allergens: [], preferences: [] },
    };

    const memberships: Membership[] = [
      { personId: alice.id, groupId: groups[0]!.id },
      { personId: alice.id, groupId: groups[1]!.id },
      { personId: bob.id, groupId: groups[0]!.id },
      { personId: bob.id, groupId: groups[2]!.id },
    ];

    const enrollments: Enrollment[] = [
      {
        personId: alice.id,
        sessionId: sessions[0]!.id,
        status: "assigned",
        priority: 100,
        source: "rule",
      },
      {
        personId: alice.id,
        sessionId: sessions[1]!.id,
        status: "optional",
        priority: 70,
        source: "rule",
      },
      {
        personId: bob.id,
        sessionId: sessions[0]!.id,
        status: "assigned",
        priority: 100,
        source: "rule",
      },
    ];

    this.events = [event];
    this.tracks = [plenaryTrack, workshopTrack];
    this.sessions = sessions;
    this.groups = groups;
    this.rules = rules;
    this.people = [alice, bob];
    this.memberships = memberships;
    this.enrollments = enrollments;
  }

  getEvent(eventId: string) {
    return this.events.find((event) => event.id === eventId) ?? null;
  }

  getEventPeople(eventId: string) {
    return this.people.filter((person) => person.eventId === eventId);
  }

  getPerson(personId: string) {
    return this.people.find((person) => person.id === personId) ?? null;
  }

  getSession(sessionId: string) {
    return this.sessions.find((session) => session.id === sessionId) ?? null;
  }

  upsertSession(session: Session) {
    const index = this.sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      this.sessions[index] = session;
    } else {
      this.sessions.push(session);
    }
  }

  addAuditLog(log: Omit<AuditLog, "id" | "timestamp">) {
    this.auditLogs.push({
      id: nanoid(),
      timestamp: new Date().toISOString(),
      ...log,
    });
  }

  importPeople(eventId: string, payload: ImportPersonPayload[], actor = "system") {
    const diagnostics: { created: number; updated: number; skipped: number } = {
      created: 0,
      updated: 0,
      skipped: 0,
    };

    for (const personPayload of payload) {
      const existing = this.people.find(
        (p) =>
          p.eventId === eventId &&
          ((personPayload.email && p.email === personPayload.email) ||
            (personPayload.phone && p.phone === personPayload.phone) ||
            (personPayload.externalId && p.externalId === personPayload.externalId))
      );

      if (existing) {
        const before = { ...existing };
        const merged = {
          ...existing,
          ...personPayload,
          diet: mergeNested(existing.diet, personPayload.diet),
          transport: mergeNested(existing.transport, personPayload.transport),
          accommodation: mergeNested(existing.accommodation, personPayload.accommodation),
          preferences: mergeNested(existing.preferences, personPayload.preferences),
        } satisfies Person;
        const index = this.people.findIndex((p) => p.id === existing.id);
        this.people[index] = merged;
        diagnostics.updated += 1;
        this.addAuditLog({
          actor,
          action: "people.update",
          entity: "person",
          entityId: existing.id,
          before,
          after: merged,
        });
        if (personPayload.memberships?.length) {
          this.setPersonMemberships(existing.id, personPayload.memberships, actor);
        }
      } else {
        const id = nanoid();
        const newPerson: Person = {
          id,
          ...personPayload,
          eventId,
        };
        this.people.push(newPerson);
        diagnostics.created += 1;
        this.addAuditLog({
          actor,
          action: "people.create",
          entity: "person",
          entityId: id,
          after: newPerson,
        });
        if (personPayload.memberships?.length) {
          this.setPersonMemberships(id, personPayload.memberships, actor);
        }
      }
    }

    return diagnostics;
  }

  setPersonMemberships(personId: string, groupIds: string[], actor = "system") {
    this.memberships = this.memberships.filter((m) => m.personId !== personId);
    for (const groupId of groupIds) {
      this.memberships.push({ personId, groupId });
    }
    this.addAuditLog({
      actor,
      action: "memberships.sync",
      entity: "person",
      entityId: personId,
      after: groupIds,
    });
  }

  recomputeAssignments(eventId: string) {
    const people = this.getEventPeople(eventId);
    const groups = this.groups.filter((group) => group.eventId === eventId);
    const sessions = this.sessions.filter((session) => session.eventId === eventId);
    const diagnostics: AssignmentDiagnostics[] = [];

    for (const person of people) {
      const personMemberships = this.memberships.filter((m) => m.personId === person.id);
      const personGroupRules = this.rules.filter((rule) =>
        personMemberships.some((membership) => membership.groupId === rule.groupId)
      );

      const mandatory = new Set<string>();
      const optional = new Set<string>();
      const exclusions = new Set<string>();

      for (const rule of personGroupRules) {
        for (const sessionId of rule.sessionIds) {
          if (!sessions.some((session) => session.id === sessionId)) continue;
          if (rule.type === "include") {
            mandatory.add(sessionId);
          } else if (rule.type === "optional") {
            optional.add(sessionId);
          } else if (rule.type === "exclude") {
            exclusions.add(sessionId);
          }
        }
      }

      const personEnrollments = this.enrollments.filter((enrollment) => enrollment.personId === person.id);
      const existingAssigned = new Set(personEnrollments.map((enrollment) => enrollment.sessionId));
      const added: string[] = [];
      const waitlisted: string[] = [];
      const conflicts: string[] = [];

      const sortedMandatory = [...mandatory].sort((a, b) => {
        const priorityA = personGroupRules
          .filter((rule) => rule.sessionIds.includes(a) && rule.type === "include")
          .reduce((max, rule) => Math.max(max, rule.priority), 0);
        const priorityB = personGroupRules
          .filter((rule) => rule.sessionIds.includes(b) && rule.type === "include")
          .reduce((max, rule) => Math.max(max, rule.priority), 0);
        return priorityB - priorityA;
      });

      for (const sessionId of sortedMandatory) {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session || exclusions.has(sessionId)) continue;
        if (existingAssigned.has(sessionId)) continue;

        const overlapping = this.findPersonConflicts(person.id, sessionId, sessions);
        if (overlapping.length > 0) {
          conflicts.push(sessionId);
          continue;
        }

        const assignedCount = this.enrollments.filter((enrollment) => enrollment.sessionId === sessionId && enrollment.status === "assigned").length;
        if (session.capacity && assignedCount >= session.capacity) {
          this.enrollments.push({
            personId: person.id,
            sessionId,
            status: "waitlist",
            priority: 50,
            source: "rule",
          });
          waitlisted.push(sessionId);
        } else {
          this.enrollments.push({
            personId: person.id,
            sessionId,
            status: "assigned",
            priority: 80,
            source: "rule",
          });
          added.push(sessionId);
        }
      }

      for (const sessionId of optional) {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session || exclusions.has(sessionId) || existingAssigned.has(sessionId)) continue;
        if (this.enrollments.some((enrollment) => enrollment.personId === person.id && enrollment.sessionId === sessionId)) {
          continue;
        }
        this.enrollments.push({
          personId: person.id,
          sessionId,
          status: "optional",
          priority: 40,
          source: "rule",
        });
        added.push(sessionId);
      }

      diagnostics.push({
        personId: person.id,
        addedSessions: added,
        waitlistedSessions: waitlisted,
        conflicts,
      });
    }

    return diagnostics;
  }

  findPersonConflicts(personId: string, sessionId: string, sessions: Session[]) {
    const targetSession = sessions.find((session) => session.id === sessionId);
    if (!targetSession) return [] as string[];

    const personSessions = this.enrollments
      .filter((enrollment) => enrollment.personId === personId && enrollment.status !== "declined")
      .map((enrollment) => this.sessions.find((session) => session.id === enrollment.sessionId))
      .filter((session): session is Session => Boolean(session));

    const conflicts = personSessions
      .filter((session) =>
        session.day === targetSession.day &&
        !(
          new Date(session.end).getTime() <= new Date(targetSession.start).getTime() ||
          new Date(session.start).getTime() >= new Date(targetSession.end).getTime()
        )
      )
      .map((session) => session.id);

    return conflicts;
  }

  updatePerson(personId: string, payload: Partial<Person>, actor = "system") {
    const existing = this.getPerson(personId);
    if (!existing) return null;
    const before = { ...existing };
    const merged: Person = {
      ...existing,
      ...payload,
      diet: mergeNested(existing.diet, payload.diet),
      transport: mergeNested(existing.transport, payload.transport),
      accommodation: mergeNested(existing.accommodation, payload.accommodation),
      preferences: mergeNested(existing.preferences, payload.preferences),
    };
    const index = this.people.findIndex((person) => person.id === personId);
    this.people[index] = merged;
    this.addAuditLog({
      actor,
      action: "people.update",
      entity: "person",
      entityId: personId,
      before,
      after: merged,
    });
    return merged;
  }

  createGroup(group: Omit<Group, "id">) {
    const newGroup: Group = { ...group, id: nanoid() };
    this.groups.push(newGroup);
    return newGroup;
  }

  createRule(rule: Omit<Rule, "id">) {
    const newRule: Rule = { ...rule, id: nanoid() };
    this.rules.push(newRule);
    return newRule;
  }

  upsertSessionForEvent(eventId: string, payload: Omit<Session, "id"> & { id?: string }) {
    if (payload.id) {
      const existing = this.getSession(payload.id);
      if (!existing) return null;
      const session: Session = { ...existing, ...payload, id: existing.id };
      this.upsertSession(session);
      return session;
    }
    const newSession: Session = { ...payload, id: nanoid(), eventId };
    this.sessions.push(newSession);
    return newSession;
  }
}

function mergeNested<T>(existing: T | undefined, incoming: T | undefined): T | undefined {
  if (!incoming) return existing;
  if (!existing) return incoming;
  if (typeof existing !== "object" || typeof incoming !== "object") return incoming;
  return { ...existing, ...incoming } as T;
}