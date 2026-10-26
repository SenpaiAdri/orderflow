// The demo business operates in Metro Manila (UTC+8, without daylight saving).
export function deliveryInput(iso: string): string {
  const time = Date.parse(iso);
  return Number.isFinite(time) ? new Date(time + 8 * 60 * 60 * 1000).toISOString().slice(0, 16) : "";
}

export function deliveryISO(input: string): string {
  return new Date(`${input}:00+08:00`).toISOString();
}

export function migrateDeliveryDue(due: string, anchor = Date.now()): string {
  if (Number.isFinite(Date.parse(due))) return new Date(due).toISOString();
  const day = deliveryInput(new Date(anchor).toISOString()).slice(0, 10);
  const offset = due === "Tomorrow" ? 1 : due === "In 3 days" ? 3 : due === "Overdue" ? -1 : 0;
  const clock = due.match(/Today, (\d+):(\d+) (AM|PM)/);
  const hour = clock ? Number(clock[1]) % 12 + (clock[3] === "PM" ? 12 : 0) : 17;
  const base = deliveryISO(`${day}T${String(hour).padStart(2, "0")}:${clock?.[2] ?? "00"}`);
  return new Date(Date.parse(base) + offset * 86400000).toISOString();
}

export function isOverdue(order: { stage: number; due: string }, now = Date.now()): boolean {
  return order.stage < 5 && Date.parse(order.due) < now;
}

export function deliveryLabel(due: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(due));
}
