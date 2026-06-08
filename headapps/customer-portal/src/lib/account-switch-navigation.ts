import { hasLocale } from "next-intl";

import {
  fireAccountSwitchEvents,
  fireEnhancedAccountSwitchEvent,
} from "@/lib/account-switch-events";
import type { ProfileAccount } from "@/lib/profile-context";
import type { AccountSwitchSource } from "@/lib/types/EventTypes";
import { getPathWithoutLocale } from "@/lib/locale-cookie";
import { routing } from "src/i18n/routing";

/**
 * If the path is an order or quote **detail** under `orders-management`, returns the localized
 * listing URL (same locale prefix as `pathname`). Otherwise returns `null`.
 *
 * Matching ignores the leading locale segment (e.g. `/en/...`). Detail shape is exactly
 * `/orders-management/orders/{id}` or `/orders-management/quotes/{id}` (one id segment).
 *
 * @param pathname - Current pathname, e.g. `/en/orders-management/orders/22761613`
 * @returns Listing path including locale when applicable, or `null`
 */
export function getOrdersManagementListingUrlIfOnOrderOrQuoteDetail(
  pathname: string
): string | null {
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const segments = pathWithoutLocale.split("/").filter(Boolean);
  if (segments.length !== 3 || segments[0] !== "orders-management") {
    return null;
  }
  const listingPath =
    segments[1] === "orders"
      ? "/orders-management/orders"
      : segments[1] === "quotes"
        ? "/orders-management/quotes"
        : null;
  if (!listingPath) {
    return null;
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  const first = pathSegments[0]?.toLowerCase() ?? "";
  if (first && hasLocale(routing.locales, first)) {
    return `/${pathSegments[0]}${listingPath}`;
  }
  return listingPath;
}

/**
 * After saving default account preferences: hard-navigate to orders/quotes listing when on a
 * detail route; otherwise full reload of the current page.
 *
 * @param pathname - Optional; defaults to `window.location.pathname` in the browser
 */
export function reloadOrOrdersManagementListAfterAccountSwitch(pathname?: string): void {
  if (typeof window === "undefined") return;
  const p = pathname ?? window.location.pathname;
  const listingUrl = getOrdersManagementListingUrlIfOnOrderOrQuoteDetail(p);
  if (listingUrl != null) {
    window.location.assign(listingUrl);
  } else {
    window.location.reload();
  }
}

/**
 * Fires account-switch analytics, then hard-navigates so the app reloads with the saved
 * default account. Does not update React profile context (avoids duplicate API refetches
 * before navigation).
 */
export function completeAccountSwitchAfterPreferenceSave(options: {
  account: ProfileAccount;
  previousAccountId?: string;
  source?: AccountSwitchSource;
  currentLanguage: string;
  pathname?: string;
}): void {
  const { account, previousAccountId, source, currentLanguage, pathname } = options;
  fireAccountSwitchEvents(account, currentLanguage || "");
  if (source) {
    fireEnhancedAccountSwitchEvent({
      previousAccountId,
      newAccountId: account.id,
      source,
    });
  }
  reloadOrOrdersManagementListAfterAccountSwitch(pathname);
}
