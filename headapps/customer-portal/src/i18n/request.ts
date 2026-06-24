import { hasLocale } from "next-intl";
import { getRequestConfig, GetRequestConfigParams } from "next-intl/server";
import { I18N } from "@/lib/dictionary-keys";
import client from "src/lib/sitecore-client";
import { routing } from "./routing";

/** Keys not yet in Sitecore dictionary — overridden when CMS defines the same key. */
const DICTIONARY_FALLBACKS: Record<string, string> = {
  [I18N.OrderMgmtSelectDateRange]: "Select date range",
  [I18N.RegisterDuplicateInstruction]:
    "This email is already registered. Use Reset Password the link below.",
};

export default getRequestConfig(async ({ requestLocale }: GetRequestConfigParams) => {
  const requested = await requestLocale;
  const [parsedSite, parsedLocale] = requested?.split("_") || [];
  const locale = hasLocale(routing.locales, parsedLocale) ? parsedLocale : routing.defaultLocale;

  let sitecoreDictionary: Record<string, string> = {};
  try {
    console.log('[---TEST---] Sitecore client:');
    console.log(client);
	console.log('[---TEST---] locale: ' + locale);
    console.log('[---TEST---] parsedSite: ' +  parsedSite);
    const sitecoreDict = await client.getDictionary({
      locale,
      site: parsedSite,
    });

    if (sitecoreDict && typeof sitecoreDict === "object") {
      sitecoreDictionary = sitecoreDict as Record<string, string>;
    }
	console.log('[---TEST---] inside first if in getRequestConfig func!');
    console.log("[i18n] Fetched Sitecore dictionary:", sitecoreDictionary);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
	  console.log('[---TEST---] inside second if(catch block) in getRequestConfig func!');
      console.warn("[i18n] Failed to fetch Sitecore dictionary:", error);
    }
	console.log('[---TEST---] inside catch block in getRequestConfig func before assigning sitecoreDictionary={}!');
    sitecoreDictionary = {};
  }
  
  console.log('[---TEST---] before return from getRequestConfig func!');
  console.log('[---TEST---] return locale: ' + locale);
  let messages = { ...DICTIONARY_FALLBACKS, ...sitecoreDictionary };
  console.log('[---TEST---] return messages:');
  console.log(messages);
  return {
    locale,
    messages,
    onError: (error) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[i18n] Translation error:", error);
      }
	  console.log('[---TEST---] before onError return!');
      // Return the key itself as fallback
      return error.message;
    },
    getMessageFallback: ({ key }) => {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[i18n] Missing translation for key: ${key}`);
      }
	  console.log('[---TEST---] before getMessageFallback return!');
      // Return the key itself as fallback
      return key;
    },
  };
});
