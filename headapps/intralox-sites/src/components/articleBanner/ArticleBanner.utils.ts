/**
 * Formats an ISO-8601 date string for display as "April 6, 2026" using the UTC calendar date.
 */
export function formatPostDateLongUtc(
  value: string | undefined,
): string | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
