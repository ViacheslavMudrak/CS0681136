import { LangCountry } from "src/utils/enum";

export interface SearchLocaleContext {
  language: string;
  country: string;
}

const DEFAULT_SEARCH_COUNTRY = (
  process.env.NEXT_PUBLIC_SEARCH_DEFAULT_COUNTRY || "us"
).toLowerCase();

const SEARCH_COUNTRY_BY_LANGUAGE: Record<string, string> = {
  en: LangCountry.EN_US.split("_")[1],
  de: LangCountry.DE_DE.split("_")[1],
  es: LangCountry.ES_ES.split("_")[1],
  fr: LangCountry.FR_FR.split("_")[1],
  it: LangCountry.IT_IT.split("_")[1],
  ja: LangCountry.JA_JP.split("_")[1],
  pl: LangCountry.PL_PL.split("_")[1],
  pt: LangCountry.PT_BR.split("_")[1],
  zh: LangCountry.ZH_CN.split("_")[1],
};

const SEARCH_LANGUAGE_BY_COUNTRY: Record<string, string> = Object.entries(
  SEARCH_COUNTRY_BY_LANGUAGE
).reduce<Record<string, string>>((acc, [language, country]) => {
  acc[country] = language;
  return acc;
}, {});

/**
 * Resolves the language-country context used by search widgets.
 *
 * @param locale - Route locale from Next.js params.
 * @returns Parsed search locale context with safe defaults.
 */
export function resolveSearchLocaleContext(
  locale?: string
): SearchLocaleContext {
  const normalizedLocale = (locale || "").trim().toLowerCase().replace("_", "-");

  if (!normalizedLocale) {
    return {
      language: "en",
      country: SEARCH_COUNTRY_BY_LANGUAGE.en || DEFAULT_SEARCH_COUNTRY,
    };
  }

  const [firstPart, countryPart] = normalizedLocale.split("-");

  if (!countryPart && SEARCH_LANGUAGE_BY_COUNTRY[firstPart]) {
    return {
      language: SEARCH_LANGUAGE_BY_COUNTRY[firstPart],
      country: firstPart,
    };
  }

  const languagePart = firstPart || "en";
  const mappedCountry = SEARCH_COUNTRY_BY_LANGUAGE[languagePart];

  return {
    language: languagePart || "en",
    country: countryPart || mappedCountry || DEFAULT_SEARCH_COUNTRY,
  };
}
