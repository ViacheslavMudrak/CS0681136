import type { ContactSupportServiceSelectionItem } from "@/components/core/ContactSupport/ContactSupport.type";

import type {
  UserProfileAccount,
  UserProfileAccountManager,
  UserProfileAccountRep,
  UserProfileServiceTech,
} from "./types/user-profile";

type AccountContactPerson =
  | UserProfileAccountManager
  | UserProfileAccountRep
  | UserProfileServiceTech;

function normalizeServiceKey(key: string): string {
  return key.trim().toLowerCase();
}

function resolveAccountContactPerson(
  account: UserProfileAccount,
  serviceKey: string
): AccountContactPerson | undefined {
  switch (normalizeServiceKey(serviceKey)) {
    case "account manager":
      return account.accountManager;
    case "account representative":
      return account.accountRep;
    case "service tech":
      return account.serviceTech;
    default:
      return undefined;
  }
}

/**
 * Builds account contacts for the contact panel from CMS ServicesSelection and profile API data.
 * Only includes roles listed in Sitecore with a ServiceKey and matching API contact data.
 */
export function buildAccountContactsFromSelection(
  account: UserProfileAccount,
  servicesSelection?: ContactSupportServiceSelectionItem[]
): AccountContactDisplay[] {
  if (!servicesSelection?.length) {
    return [];
  }

  const contacts: AccountContactDisplay[] = [];

  for (const item of servicesSelection) {
    const serviceKey = item.fields?.ServiceKey?.value?.trim();
    if (!serviceKey) {
      continue;
    }

    const person = resolveAccountContactPerson(account, serviceKey);
    if (!person?.name?.trim()) {
      continue;
    }

    const jobTitle = item.displayName?.trim() || item.name?.trim() || serviceKey;
    const display = toDisplayContact(person, jobTitle);
    contacts.push({
      ...display,
      id: item.id?.trim() || display.id,
    });
  }

  return contacts;
}

/** Prefer account hotline when present; otherwise use CMS SupportLink label text. */
export function resolveContactSupportLinkText(
  hotlineNumber: string | null | undefined,
  sitecoreLinkText: string | null | undefined
): string {
  const hotline = hotlineNumber?.trim();
  if (hotline) return hotline;
  return String(sitecoreLinkText ?? "").trim();
}

/** Display shape for a single account contact (account manager or service tech) */
export interface AccountContactDisplay {
  id: string;
  fullName: string;
  initials: string;
  jobTitle: string;
  email?: string;
  phone?: string;
}

/**
 * Gets 2-letter initials from a display name.
 * Handles "LastName, FirstName ..." (e.g. "Burriss, Elizabeth Anne (Eli)" -> "BE")
 * and "FirstName LastName" (e.g. "Elizabeth Burriss" -> "EB").
 * Skips parenthetical parts like "(Eli)" when taking the last initial.
 */
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  if (trimmed.includes(",")) {
    const [lastPart, ...rest] = trimmed.split(",").map((s) => s.trim());
    const firstPart = rest.join(" ").trim();
    const lastInitial = lastPart?.charAt(0) ?? "";
    const firstWord = firstPart.split(/\s+/).find((w) => /^[a-zA-Z]/.test(w));
    const firstInitial = firstWord?.charAt(0) ?? "";
    return (lastInitial + firstInitial).toUpperCase().slice(0, 2) || "?";
  }

  const parts = trimmed.split(/\s+/).filter((w) => /^[a-zA-Z]/.test(w));
  if (parts.length >= 2) {
    const first = parts[0]?.charAt(0) ?? "";
    const last = parts[parts.length - 1]?.charAt(0) ?? "";
    return (first + last).toUpperCase().slice(0, 2);
  }
  return trimmed.slice(0, 2).toUpperCase();
}

/**
 * Maps a profile account manager or service tech to the display shape used in the contact panel.
 */
export function toDisplayContact(
  person: UserProfileAccountManager | UserProfileServiceTech,
  jobTitle: string
): AccountContactDisplay {
  const fullName = person.name?.trim() || "Unknown";
  return {
    id: person.id,
    fullName,
    initials: getInitials(fullName),
    jobTitle,
    email: person.email,
    phone: person.mobile ?? undefined,
  };
}
