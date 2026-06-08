"use client";

import { JSX } from "react";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import SearchResultsWidget from "../widgets/SearchResults";
import { ISearchComponentFields, ISearchPageFields } from "../SearchComponent.type";
import { resolveSearchLocaleContext } from "../../shared/searchLocaleContext";
import SearchBox from "components/shared/SearchBox";
interface ISearchComponentClientProps {
  rfkId: string;
  fields?: ISearchComponentFields;
  pageFields?: ISearchPageFields;
  cardType?: string;
  isScollPagination?: boolean;
  isDropdownFacets?: boolean;
}

const SearchComponentClientBase = ({
  rfkId,
  fields,
  pageFields,
  cardType,
  isScollPagination,
  isDropdownFacets,
}: ISearchComponentClientProps): JSX.Element => {
  const params = useParams();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const routeLocale =
    typeof params?.locale === "string" ? params.locale : undefined;
  const localeContext = resolveSearchLocaleContext(routeLocale);
  return (
    <>
      {!isDropdownFacets && (
        <SearchBox placeholder={fields?.PlaceholderText?.value} />
      )}
      <SearchResultsWidget
        key={query}
        rfkId={rfkId}
        defaultKeyphrase={query}
        defaultPage={1}
        defaultItemsPerPage={18}
        localeContext={localeContext}
        fields={fields}
        pageFields={pageFields}
        cardType={cardType}
        isScollPagination={isScollPagination}
        isDropdownFacets={isDropdownFacets}
      />
    </>
  );
};

export const SearchComponentClient = SearchComponentClientBase;
