"use client";
import { JSX } from "react";
import {
  IBeltIdentifyFields,
  IBeltIdentifierPageFields,
} from "../BeltIdentifier.type";
import BeltFinderSearchResultWidget from "./BeltIdentifierSearchResult";

interface IBeltIdentifierClientProps {
  fields: IBeltIdentifyFields;
  rfkId: string;
  cardType: string;
  routeLocale?: string;
  routeFields?: IBeltIdentifierPageFields;
}

interface SearchLocaleContext {
  language: string;
  country: string;
}

const DEFAULT_SEARCH_COUNTRY = (
  process.env.NEXT_PUBLIC_SEARCH_DEFAULT_COUNTRY || "us"
).toLowerCase();

function resolveSearchLocaleContext(locale?: string): SearchLocaleContext {
  const normalizedLocale = (locale || "")
    .trim()
    .toLowerCase()
    .replace("_", "-");
  if (!normalizedLocale) {
    return { language: "en", country: DEFAULT_SEARCH_COUNTRY };
  }

  const [languagePart, countryPart] = normalizedLocale.split("-");
  return {
    language: languagePart || "en",
    country: countryPart || DEFAULT_SEARCH_COUNTRY,
  };
}

const BeltIdentifierClientBase = ({
  fields,
  rfkId,
  cardType,
  routeLocale,
  routeFields,
}: IBeltIdentifierClientProps): JSX.Element => {
  const localeContext = resolveSearchLocaleContext(routeLocale);
  return (
    <BeltFinderSearchResultWidget
      rfkId={rfkId}
      defaultKeyphrase=""
      defaultPage={1}
      defaultItemsPerPage={18}
      localeContext={localeContext}
      fields={fields}
      cardType={cardType}
      routeFields={routeFields}
    />
  );
};

export const BeltIdentifierClient = BeltIdentifierClientBase;
