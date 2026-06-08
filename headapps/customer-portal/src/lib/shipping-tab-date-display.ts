import { formatOrderDateDisplay } from "@/lib/orderManagementUtils";

const API_CALENDAR_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const API_CALENDAR_UTC_MIDNIGHT_Z = /^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.\d+)?Z$/;

function parseShippingCalendarDate(iso: string): Date | null {
  const value = iso.trim();
  let match = value.match(API_CALENDAR_DATE_ONLY);
  if (!match) match = value.match(API_CALENDAR_UTC_MIDNIGHT_Z);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const localDate = new Date(year, month - 1, day);
  if (
    localDate.getFullYear() !== year ||
    localDate.getMonth() !== month - 1 ||
    localDate.getDate() !== day
  ) {
    return null;
  }

  return localDate;
}

export function formatShippingTabDateDisplay(iso: string, locale: string): string {
  const calendarDate = parseShippingCalendarDate(iso);
  if (!calendarDate) return formatOrderDateDisplay(iso, locale);
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(calendarDate);
  } catch {
    return iso.slice(0, 10);
  }
}
