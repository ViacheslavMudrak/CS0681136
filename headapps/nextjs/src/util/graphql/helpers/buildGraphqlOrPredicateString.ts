import type { Item } from '@sitecore-content-sdk/nextjs';

function normalizeGuid(sitecoreId: string): string {
  return sitecoreId
    .replace(/[{}]/g, '')
    .replace(
      /^([a-f0-9]{8})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{12})$/i,
      '$1-$2-$3-$4-$5'
    )
    .toLowerCase();
}

/**
 * Build an OR predicate for a GraphQL search filter. Used to search for all results where the field contains one of a number of items
 */
export function buildOrPredicateString(items: Item[], fieldName: string): string;
export function buildOrPredicateString(itemIds: string[], fieldName: string): string;
export function buildOrPredicateString(
  itemsOrIds: Item[] | string[] = [],
  fieldName: string
): string {
  if (!itemsOrIds.length) return '';

  const predicates = itemsOrIds
    .map((itemOrId) => {
      const id = normalizeGuid(typeof itemOrId === 'string' ? itemOrId : (itemOrId.id ?? ''));
      return `{
        name: "${fieldName}"
        value: "${id}"
        operator: CONTAINS
      }`;
    })
    .join(',');

  return `{ OR: [${predicates}] }`;
}
