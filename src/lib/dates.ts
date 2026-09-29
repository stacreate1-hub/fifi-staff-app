/**
 * Booking event_date is stored site-wide as UK-style d/m/Y (see the "A
 * NOTE ON DATES" comment in the Fifi All Bookings snippet) — never parse
 * it with `new Date(str)` or it will silently misread as US m/d/y.
 */
export function parseSiteDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
