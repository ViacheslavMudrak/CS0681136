"use client";

import { useOktaAuth } from "@okta/okta-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import type {
  ILanguageSelection,
  ILanguageSwitcherFields,
} from "@/components/core/LanguageSwitcher/LanguageSwitcher.type";
import { sendLanguageSwitchedEvent, sendProfileContextSwitchedEvent } from "@/lib/CDPEvents";
import { logGTMLanguageSwitched, logGTMProfileContextSwitched } from "src/lib/gtm";
import { useProfileContext } from "@/lib/profile-context";
import { saveUserPreferences } from "@/lib/apis/user-preference-api";

export interface UseLanguageSwitcherHandlersOptions {
  onAfterNavigate?: () => void;
}

export function useLanguageSwitcherHandlers(
  fields: ILanguageSwitcherFields | null | undefined,
  options?: UseLanguageSwitcherHandlersOptions
) {
  const { onAfterNavigate } = options ?? {};
  const pathname = usePathname();
  const router = useRouter();
  const { selectedAccount, setCurrentLanguage } = useProfileContext();
  const oktaAuth = useOktaAuth();
  const oktaEmail = oktaAuth?.authState?.idToken?.claims?.email as string | undefined;

  const pathSegments = pathname.split("/").filter(Boolean);
  const currentLocale = pathSegments[0] ?? "en";

  const isLocaleInRoute = useMemo(() => {
    if (!fields?.LanguageSelection?.length) return false;
    return fields.LanguageSelection.some((lang) => {
      const name = lang.fields?.LanguageSource?.name || lang.fields?.LanguageSource?.displayName;
      return name && pathSegments[0] && pathSegments[0].toLowerCase() === name.toLowerCase();
    });
  }, [pathSegments, fields?.LanguageSelection]);

  const getCurrentLanguage = useCallback((): ILanguageSelection | null => {
    if (!fields?.LanguageSelection || fields.LanguageSelection.length === 0) {
      return null;
    }

    const matchedLanguage = fields.LanguageSelection.find((lang) => {
      const name = lang.fields?.LanguageSource?.name || lang.fields?.LanguageSource?.displayName;
      if (name && currentLocale.toLowerCase() === name.toLowerCase()) {
        return true;
      }
      return false;
    });

    if (matchedLanguage) {
      return matchedLanguage;
    }

    const defaultEn = fields.LanguageSelection.find((lang) => {
      const name = lang.fields?.LanguageSource?.name || lang.fields?.LanguageSource?.displayName;
      const iso = lang.fields?.LanguageSource?.fields?.Iso?.value;
      return (name && name.toLowerCase() === "en") || (iso && iso.toLowerCase() === "en");
    });

    return defaultEn ?? null;
  }, [fields?.LanguageSelection, currentLocale]);

  const currentLanguage = getCurrentLanguage();

  useEffect(() => {
    if (fields && currentLanguage?.fields?.LanguageSource?.fields) {
      const iso = currentLanguage.fields.LanguageSource.fields.Iso?.value;
      const locale = iso || "en";
      setCurrentLanguage(locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentLanguage, setCurrentLanguage]);

  const getAvailableLocales = useCallback((): string[] => {
    if (!fields?.LanguageSelection || fields.LanguageSelection.length === 0) {
      return [];
    }

    return fields.LanguageSelection.map((lang) => lang.fields?.LanguageSource?.fields?.Iso?.value)
      .filter((locale): locale is string => !!locale)
      .map((locale) => locale.toLowerCase());
  }, [fields?.LanguageSelection]);

  const buildNewPath = useCallback(
    (newLocale: string): string => {
      const segments = pathname.split("/").filter(Boolean);
      const availableLocales = getAvailableLocales();

      if (segments.length > 0 && availableLocales.includes(segments[0].toLowerCase())) {
        segments[0] = newLocale;
        return `/${segments.join("/")}`;
      }

      return `/${newLocale}${pathname === "/" ? "" : pathname}`;
    },
    [pathname, getAvailableLocales]
  );

  const handleLanguageSelect = useCallback(
    (language: ILanguageSelection) => {
      if (!language.fields?.LanguageSource?.fields) {
        return;
      }

      const iso = language.fields.LanguageSource.fields.Iso?.value;
      const newLocale = iso || "en";
      const previousLocale =
        currentLanguage?.fields?.LanguageSource?.fields?.Iso?.value || currentLocale || "";

      setCurrentLanguage(newLocale);

      logGTMProfileContextSwitched({
        contextType: "language",
        active_language: newLocale,
        active_organization: selectedAccount?.organization || "",
        active_job_role: selectedAccount?.role || "",
        active_account: selectedAccount?.companyName || "",
      });

      sendProfileContextSwitchedEvent({
        type: "customerportal:PROFILE_CONTEXT_SWITCHED",
        contextType: "language",
        active_language: newLocale,
        active_organization: selectedAccount?.organization || "",
        active_job_role: selectedAccount?.role || "",
        active_account: selectedAccount?.companyName || "",
      });

      const languageSwitchedEventData = {
        interaction_type: "Language_Switched" as const,
        previous_language: previousLocale,
        new_language: newLocale,
      };

      logGTMLanguageSwitched(languageSwitchedEventData);
      sendLanguageSwitchedEvent(languageSwitchedEventData);

      saveUserPreferences({
        userEmail: oktaEmail ?? "",
        defaultLanguage: newLocale,
        defaultAccount: selectedAccount?.id ?? "0",
        userPreference: 1,
      }).catch(() => {});

      const newPath = buildNewPath(newLocale);
      router.push(newPath);
      onAfterNavigate?.();
      router.refresh();
    },
    [
      buildNewPath,
      currentLanguage?.fields?.LanguageSource?.fields?.Iso?.value,
      currentLocale,
      oktaEmail,
      onAfterNavigate,
      router,
      selectedAccount?.companyName,
      selectedAccount?.id,
      selectedAccount?.organization,
      selectedAccount?.role,
      setCurrentLanguage,
    ]
  );

  return {
    currentLanguage,
    isLocaleInRoute,
    handleLanguageSelect,
  };
}
