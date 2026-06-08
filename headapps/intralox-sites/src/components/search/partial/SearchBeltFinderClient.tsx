"use client";

import { RichText } from "@sitecore-content-sdk/nextjs";
import { JSX } from "react";
import SearchBox from "components/shared/SearchBox";
import {
  ISearchComponentFields,
  ISearchPageFields,
} from "../SearchComponent.type";
import SearchResultsWidget from "../widgets/SearchResults";
import { useParams, useSearchParams } from "next/navigation";
import { resolveSearchLocaleContext } from "../../shared/searchLocaleContext";

interface ISearchBeltFinderClientProps {
  rfkId: string;
  fields: ISearchComponentFields;
  pageFields?: ISearchPageFields;
}

const SearchBeltFinderClientBase = ({
  rfkId,
  fields,
  pageFields,
}: ISearchBeltFinderClientProps): JSX.Element => {
  const params = useParams();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const routeLocale =
    typeof params?.locale === "string" ? params.locale : undefined;
  const localeContext = resolveSearchLocaleContext(routeLocale);
  return (
    <div className={`${rfkId ? "mt-0" : "mt-6"}`}>
      {!rfkId && (
        <RichText
          className="font-bold text-2xl pb-3 text-ink-primary"
          field={{ value: "Search the Belt Finder" }}
          tag="h3"
        />
      )}
      <SearchBox
        isSearchPageSearchBox={false}
        placeholder={fields?.PlaceholderText?.value}
      />
      <SearchResultsWidget
        key={query}
        rfkId={rfkId}
        defaultKeyphrase={query}
        defaultPage={1}
        defaultItemsPerPage={18}
        localeContext={localeContext}
        fields={fields}
        pageFields={pageFields}
        entityType="product"
        gridType="list"
      />
    </div>
  );
};

export const SearchBeltFinderClient = SearchBeltFinderClientBase;
