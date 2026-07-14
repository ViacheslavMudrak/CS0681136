import {
  FilterAnd,
  FilterAnyOf,
  FilterLessThan,
  FilterNot,
  FilterOr,
} from '@sitecore-search/react';

import { getEmbargoCutoffValue } from 'src/util/helpers/embargo-helper';

/**
 * Sitecore Search publish-date embargo.
 *
 * News and Reflection results with `published_date` on or after the embargo
 * cutoff (start of tomorrow UTC) are hidden. Other result types are unaffected
 * — the filter is type-scoped so it doesn't accidentally drop regular pages,
 * directory entries, or anything else that doesn't carry a publish date.
 *
 * Combine with any other server-side filters (e.g. gated visibility) via
 * `FilterAnd` before passing to `setSearchFilter()`.
 */
const EMBARGO_RESULT_TYPES = ['News Article', 'Reflection'];

export function buildEmbargoFilter() {
  const cutoff = getEmbargoCutoffValue();
  return new FilterOr([
    new FilterNot(new FilterAnyOf('result_type', EMBARGO_RESULT_TYPES)),
    new FilterAnd([
      new FilterAnyOf('result_type', EMBARGO_RESULT_TYPES),
      new FilterLessThan('published_date', cutoff),
    ]),
  ]);
}
