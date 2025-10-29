import { z } from "zod";

export const transportDetailsSchema = z
  .object({
    mode: z.string(),
    number: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .partial({ mode: false });

export const transportSchema = z.object({
  arrival: transportDetailsSchema.optional(),
  departure: transportDetailsSchema.optional(),
});

export const accommodationSchema = z.object({
  hotel: z.string().optional(),
  checkin: z.string().optional(),
  checkout: z.string().optional(),
  room: z.string().optional(),
  comments: z.string().optional(),
});

export const dietSchema = z.object({
  allergens: z.array(z.string()).optional(),
  preferences: z.array(z.string()).optional(),
});

export const preferencesSchema = z.object({
  workshops: z.array(z.string()).optional(),
  team_building: z.array(z.string()).optional(),
  comments: z.string().optional(),
});

export const sessionSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["plenary", "workshop", "team_building", "transport", "logistics"]),
  description: z.string().optional(),
  day: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  locationId: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  trackId: z.string().optional(),
  speakers: z.array(z.string()).default([]),
  documents: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export const groupSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  color: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const ruleSchema = z.object({
  groupId: z.string().min(1),
  type: z.enum(["include", "exclude", "optional"]),
  sessionIds: z.array(z.string()).nonempty(),
  priority: z.number().int().min(0).max(100),
  quota: z.number().int().positive().nullable().optional(),
});

export const membershipSchema = z.object({
  groupIds: z.array(z.string()).default([]),
});

export const personSchema = z.object({
  externalId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  notes: z.string().optional(),
  diet: dietSchema.optional(),
  accessibility: z.string().optional(),
  transport: transportSchema.optional(),
  accommodation: accommodationSchema.optional(),
  preferences: preferencesSchema.optional(),
  memberships: z.array(z.string()).optional(),
});

export const importPeopleSchema = z.object({
  people: z.array(personSchema),
});

export const updatePersonSchema = personSchema.partial();

export const recomputeAssignmentsSchema = z.object({
  actor: z.string().optional(),
});
