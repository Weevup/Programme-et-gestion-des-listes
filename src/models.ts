export type TransportDetails = {
  mode: string;
  number?: string;
  date?: string;
  time?: string;
  from?: string;
  to?: string;
};

export type Transport = {
  arrival?: TransportDetails;
  departure?: TransportDetails;
};

export type Accommodation = {
  hotel?: string;
  checkin?: string;
  checkout?: string;
  room?: string;
  comments?: string;
};

export type Diet = {
  allergens?: string[];
  preferences?: string[];
};

export type Preferences = {
  workshops?: string[];
  team_building?: string[];
  comments?: string;
};

export type Event = {
  id: string;
  name: string;
  timezone: string;
  startDate: string;
  endDate: string;
  branding?: string;
};

export type Track = {
  id: string;
  eventId: string;
  name: string;
  color?: string;
  order: number;
};

export type Session = {
  id: string;
  eventId: string;
  code: string;
  title: string;
  type: "plenary" | "workshop" | "team_building" | "transport" | "logistics";
  description?: string;
  day: string;
  start: string;
  end: string;
  locationId?: string;
  capacity?: number;
  trackId?: string;
  speakers: string[];
  documents: string[];
  tags: string[];
};

export type Location = {
  id: string;
  name: string;
  address?: string;
  zone?: string;
};

export type Group = {
  id: string;
  eventId: string;
  code: string;
  name: string;
  color?: string;
  description?: string;
  tags: string[];
};

export type RuleType = "include" | "exclude" | "optional";

export type Rule = {
  id: string;
  groupId: string;
  type: RuleType;
  sessionIds: string[];
  priority: number;
  quota?: number | null;
};

export type Person = {
  id: string;
  eventId: string;
  externalId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  notes?: string;
  diet?: Diet;
  accessibility?: string;
  transport?: Transport;
  accommodation?: Accommodation;
  preferences?: Preferences;
};

export type Membership = {
  personId: string;
  groupId: string;
};

export type EnrollmentSource = "rule" | "manual" | "import";

export type EnrollmentStatus = "assigned" | "optional" | "waitlist" | "declined";

export type Enrollment = {
  personId: string;
  sessionId: string;
  status: EnrollmentStatus;
  priority: number;
  source: EnrollmentSource;
};

export type AuditLog = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  timestamp: string;
};

export type AssignmentDiagnostics = {
  personId: string;
  addedSessions: string[];
  waitlistedSessions: string[];
  conflicts: string[];
};
