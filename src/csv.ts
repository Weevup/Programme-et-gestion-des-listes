import { Person } from "./models.js";

export function arrivalsToCsv(people: Person[]): string {
  const header = [
    "person_id",
    "first_name",
    "last_name",
    "arrival_mode",
    "arrival_number",
    "arrival_date",
    "arrival_time",
    "arrival_from",
  ];

  const rows = people.map((person) => {
    const arrival = person.transport?.arrival;
    return [
      person.id,
      person.firstName,
      person.lastName,
      arrival?.mode ?? "",
      arrival?.number ?? "",
      arrival?.date ?? "",
      arrival?.time ?? "",
      arrival?.from ?? "",
    ];
  });

  const lines = [header, ...rows]
    .map((columns) => columns.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");

  return `${lines}\n`;
}

function escapeCsvValue(value: string) {
  if (value.includes(",") || value.includes("\n") || value.includes("\"")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
