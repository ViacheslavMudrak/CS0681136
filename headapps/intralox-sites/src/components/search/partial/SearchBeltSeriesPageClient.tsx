"use client";

import { JSX } from "react";
import { useParams } from "next/navigation";

import type { ISearchComponentFields, ISearchPageFields } from "../SearchComponent.type";
import SearchResultsWidget from "../widgets/SearchResults";
import { resolveSearchLocaleContext } from "../../shared/searchLocaleContext";
import { SearchCardType } from "src/utils/enum";

interface ISearchBeltSeriesPageClientProps {
  rfkId: string;
  fields?: ISearchComponentFields;
  pageFields?: ISearchPageFields;
}

const SearchBeltSeriesPageClientBase = ({
  rfkId,
  fields,
  pageFields,
}: ISearchBeltSeriesPageClientProps): JSX.Element => {
  const params = useParams();
  const routeLocale =
    typeof params?.locale === "string" ? params.locale : undefined;
  const localeContext = resolveSearchLocaleContext(routeLocale);

  return (
    <SearchResultsWidget
      key={rfkId}
      rfkId={rfkId}
      defaultKeyphrase=""
      defaultPage={1}
      defaultItemsPerPage={16}
      localeContext={localeContext}
      fields={fields}
      pageFields={pageFields}
      cardType={SearchCardType.BELT_SERIES_PAGE}
    />
  );
};

export const SearchBeltSeriesPageClient = SearchBeltSeriesPageClientBase;
