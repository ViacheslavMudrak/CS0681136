import { getRequestConfig, GetRequestConfigParams } from "next-intl/server";
import { hasLocale, IntlErrorCode } from "next-intl";
import { I18N } from "lib/dictionary-keys";
import { routing } from "./routing";
import client from "src/lib/sitecore-client";
import scConfig from "sitecore.config";
import { toSitecoreLocale } from "src/lib/locale-map";

/** Keys not yet in Sitecore dictionary — overridden when CMS defines the same key. */
const DICTIONARY_FALLBACKS: Record<string, string> = {
  [I18N.READMORE]: "Read More",
  [I18N.CASESTUDY]: "Case Study",
};

export default getRequestConfig(
  async ({ requestLocale }: GetRequestConfigParams) => {
    // Provide a static locale, fetch a user setting,
    // read from `cookies()`, `headers()`, etc.
    // Since this function is executed during the Server Components render pass, you can call functions like cookies() and headers() to return configuration that is request-specific. https://next-intl.dev/docs/usage/configuration

    // set by the catch-all route setRequestLocale
    // to support SSG and multisite here we expect both site and locale in the format {site}_{locale}
    const requested = await requestLocale;
    const [parsedSite, parsedLocale] = requested?.split("_") || [];
    const locale = hasLocale(routing.locales, parsedLocale)
      ? parsedLocale
      : routing.defaultLocale;

    const siteForDictionary = parsedSite || scConfig.defaultSite || "";

    let sitecoreDictionary: Record<string, string> = {};
    if (siteForDictionary.length > 0) {
      try {
        const sitecoreDict = await client.getDictionary({
          locale: toSitecoreLocale(locale),
          site: siteForDictionary,
        });
        if (sitecoreDict && typeof sitecoreDict === "object") {
          sitecoreDictionary = sitecoreDict as Record<string, string>;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[i18n] Failed to fetch Sitecore dictionary:", error);
        }
        sitecoreDictionary = {};
      }
    }

    // getTranslations() / useTranslations() read keys from the root of `messages`; nesting under the site name breaks lookups.
    const messages = { ...DICTIONARY_FALLBACKS, ...sitecoreDictionary };

    return {
      locale,
      messages,
      onError(error) {
        if (error.code === IntlErrorCode.MISSING_MESSAGE) {
          return;
        }
        console.error(error);
      },
      getMessageFallback({ namespace, key, error }) {
        const path = [namespace, key].filter((part) => part != null).join(".");
        if (error.code === IntlErrorCode.MISSING_MESSAGE) {
          return path;
        }
        return `Dear developer, please fix this message: ${path}`;
      },
    };
  },
);
