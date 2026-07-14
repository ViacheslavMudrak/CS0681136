import { log } from 'src/util/helpers/log-helper';

const DEFAULT_EMPTY_DATE = '0001-01-01T00:00:00Z';

export const formatDate = (dateString: string | undefined): string | null => {
  if (!dateString) return null;

  // Check if it's the default empty date value
  if (dateString === DEFAULT_EMPTY_DATE || dateString.startsWith('0001-01-01')) {
    return null;
  }

  // Normalize compact Sitecore format YYYYMMDDTHHmmss[Z] → YYYY-MM-DDTHH:mm:ss
  let normalized = dateString.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/,
    '$1-$2-$3T$4:$5:$6$7'
  );

  if (normalized === DEFAULT_EMPTY_DATE || normalized.startsWith('0001-01-01')) {
    return null;
  }

  // If no timezone indicator present, assume UTC to prevent local-time shift
  const hasTimezone = normalized.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(normalized);
  if (!hasTimezone) {
    normalized += 'Z';
  }

  const date = new Date(normalized);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    log('WARNING', 'date-helper', 'Invalid date format', { dateString });
    return null;
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

/**
 * Convert a Date object to Sitecore date format (YYYYMMDDTHHMMSSZ)
 * @param date - JavaScript Date object (will use UTC methods)
 * @returns Formatted date string in Sitecore format, e.g., "20251222T000000Z"
 */
export const toSitecoreDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
};
