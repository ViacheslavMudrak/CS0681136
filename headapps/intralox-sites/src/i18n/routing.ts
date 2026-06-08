import { defineRouting } from "next-intl/routing";
import sitecoreConfig from "sitecore.config";

const supportedLocales = [ 
  sitecoreConfig.defaultLanguage,
  "fr",
  "de",
  "ar",
  "es",
  "it",
  "ja",
  "pl",
  "pt",
  "zh"
] as const;

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: supportedLocales,

  // Used when no locale matches
  defaultLocale: (supportedLocales.includes(
    sitecoreConfig.defaultLanguage as (typeof supportedLocales)[number]
  )
    ? sitecoreConfig.defaultLanguage
    : "en") as (typeof supportedLocales)[number],

  // No prefix is added for the default locale ("as-needed").
  // For other configuration options, refer to the next-intl documentation:
  // https://next-intl.dev/docs/routing/configuration
  localePrefix: "as-needed",
});
