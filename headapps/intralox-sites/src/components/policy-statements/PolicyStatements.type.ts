import type { ComponentProps } from 'lib/component-props';
import type { RawPolicyStatementsData, RawRouteDocument } from 'components/country-language-dropdown/countryLanguageDropdownUtils';

/**
 * Route-level data fetched from the context item (`$contextItem`).
 * Present only when the component is rendered on a Country Policy Statement page.
 */
export interface RouteData {
  /** The `Country` reference field on the route item (links to a Country global-content item). */
  CurrentCountry?: {
    data?: {
      Code?: { value?: string | null } | null;
    } | null;
  } | null;
  /** The `Documents` multilist field on the route item — one entry per language variant. */
  Documents?: {
    data?: RawRouteDocument[] | null;
  } | null;
}

/**
 * GraphQL-integrated shape returned by the `GetPolicyStatements` query.
 * - `PolicyStatementsData` — from the rendering datasource (countries list + labels)
 * - `RouteData` — from the current context item (current country + language documents)
 */
interface PolicyStatementsDataWrapper {
  PolicyStatementsData?: RawPolicyStatementsData | null;
  RouteData?: RouteData | null;
}

export interface PolicyStatementsFields {
  data?: PolicyStatementsDataWrapper | null;
}

export type PolicyStatementsProps = ComponentProps & {
  fields?: PolicyStatementsFields | null;
};
