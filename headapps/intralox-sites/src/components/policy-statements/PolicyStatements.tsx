import { JSX } from 'react';
import { cn } from 'lib/utils';
import {
  normalizeCountries,
  normalizeRouteDocuments,
  resolveInitialCountryCode,
} from 'components/country-language-dropdown/countryLanguageDropdownUtils';
import { CountryLanguageDropdown } from 'components/country-language-dropdown/CountryLanguageDropdown';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import type { PolicyStatementsProps } from './PolicyStatements.type';
import {
  POLICY_STATEMENTS_EMPTY_HINT,
  extractPolicyStatementsData,
  extractRouteData,
  readCountryLabel,
  readLanguageLabel,
  readRouteCountryCode,
  readLayoutRouteCountryCode,
  normalizeLayoutRouteDocuments,
} from './policyStatementsUtils';

/** Policy Statements — country/language selector; listing vs country page flows differ by route data. */
export function Default({
  fields,
  params,
  page,
}: PolicyStatementsProps): JSX.Element {
  const { isEditing, isPreview } = page.mode;
  const { styles, RenderingIdentifier: id } = params;
  const anchor = renderingAnchorIdProps(id);

  if (!fields) {
    return (
      <section
        className={cn('component policy-statements box-border w-full min-w-0 p-0! px-0!', styles)}
        {...anchor}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
          <div className="policy-statements-outer box-border mx-auto w-full min-w-0 max-w-full px-4 pb-12 min-[600px]:max-w-[600px] min-[768px]:max-w-[768px] min-[768px]:pb-20 min-[992px]:max-w-[782px]">
            <span className="is-empty-hint">{POLICY_STATEMENTS_EMPTY_HINT}</span>
          </div>
        </div>
      </section>
    );
  }

  const rawData = extractPolicyStatementsData(fields);

  const countries = normalizeCountries(rawData);
  const countryLabel = readCountryLabel(rawData);
  const languageLabel = readLanguageLabel(rawData);

  const layoutRouteFields = page.layout?.sitecore?.route?.fields as
    | Record<string, unknown>
    | undefined;

  const routeData = extractRouteData(fields);
  const graphqlRouteDocuments = normalizeRouteDocuments(routeData?.Documents?.data);
  const routeDocuments =
    graphqlRouteDocuments.length > 0
      ? graphqlRouteDocuments
      : normalizeLayoutRouteDocuments(layoutRouteFields);

  const routeCountryCode =
    readRouteCountryCode(routeData) || readLayoutRouteCountryCode(layoutRouteFields);

  const initialCountryCode = resolveInitialCountryCode(countries, routeCountryCode);

  const showEmptyHint = isEditing && countries.length === 0;

  return (
    <section
      className={cn('component policy-statements box-border w-full min-w-0 p-0! px-0!', styles)}
      aria-label={countryLabel || POLICY_STATEMENTS_EMPTY_HINT}
      {...anchor}
    >
      <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
        <div className="policy-statements-outer box-border mx-auto w-full min-w-0 max-w-full px-4 pb-12 min-[600px]:max-w-[600px] min-[768px]:max-w-[768px] min-[768px]:pb-20 min-[992px]:max-w-[782px]">
          {showEmptyHint && (
            <span className="is-empty-hint">{POLICY_STATEMENTS_EMPTY_HINT}</span>
          )}
          <CountryLanguageDropdown
            countryLabel={countryLabel || undefined}
            languageLabel={languageLabel || undefined}
            countries={countries}
            initialCountryCode={initialCountryCode}
            isEditing={isEditing}
            isPreview={Boolean(isPreview)}
            routeDocuments={routeCountryCode ? routeDocuments : undefined}
          />
        </div>
      </div>
    </section>
  );
}
