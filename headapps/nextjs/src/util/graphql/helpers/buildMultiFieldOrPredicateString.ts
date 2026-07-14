import { buildOrPredicateString } from './buildGraphqlOrPredicateString';

/**
 * Build an OR predicate that searches across multiple fields
 * Returns results if ANY field contains ANY of the provided tag IDs
 *
 * @example
 * // Search for tags in tags OR siteTopic fields
 * buildMultiFieldOrPredicateString(['tag1', 'tag2'], ['tags', 'siteTopic'])
 * // Returns: { OR: [{ OR: [tags predicates] }, { OR: [siteTopic predicates] }] }
 */
export function buildMultiFieldOrPredicateString(itemIds: string[], fieldNames: string[]): string {
  if (!itemIds.length || !fieldNames.length) return '';

  // Build OR predicate for each field
  const fieldPredicates = fieldNames
    .map((fieldName) => buildOrPredicateString(itemIds, fieldName))
    .filter((predicate) => predicate !== ''); // Remove empty predicates

  if (!fieldPredicates.length) return '';

  // If only one field, return it directly (no need for outer OR)
  if (fieldPredicates.length === 1) {
    return fieldPredicates[0];
  }

  // Combine all field predicates with OR
  return `{ OR: [${fieldPredicates.join(',')}] }`;
}
