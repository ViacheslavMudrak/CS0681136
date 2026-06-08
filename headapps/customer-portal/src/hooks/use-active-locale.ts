"use client";

import { hasLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { routing } from "@/i18n/routing";
import { getLocaleFromPathname } from "@/lib/locale-path";
import { useProfileContextOptional } from "@/lib/profile-context";

export function useActiveLocale(): string {
  const pathname = usePathname();
  const profile = useProfileContextOptional();
  const currentLanguage = profile?.currentLanguage ?? "";

  return useMemo(() => {
    const fromProfile = currentLanguage?.trim().toLowerCase() ?? "";
    if (fromProfile && hasLocale(routing.locales, fromProfile)) {
      return fromProfile;
    }
    return getLocaleFromPathname(pathname);
  }, [currentLanguage, pathname]);
}
