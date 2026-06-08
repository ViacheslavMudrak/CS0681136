/**
 * Shared logic for firing GTM and CDP events when the user switches account/location.
 * Use from UserProfileMenu, PortalShellSideNav, and ViewMyProfile so behavior is consistent.
 */

import { sendAccountSwitchedEvent, sendProfileContextSwitchedEvent } from "@/lib/CDPEvents";
import { logGTMAccountSwitched, logGTMProfileContextSwitched } from "@/lib/gtm";
import type { AccountSwitchSource } from "@/lib/types/EventTypes";
import type { ProfileAccount } from "@/lib/profile-context";

const CONTEXT_TYPE_ACCOUNT = "account" as const;

interface FireAccountSwitchEventsOptions {
  previousAccountId?: string;
  source?: AccountSwitchSource;
  emitEnhancedEvent?: boolean;
}

export function fireEnhancedAccountSwitchEvent(options: {
  previousAccountId?: string;
  newAccountId: string;
  source?: AccountSwitchSource;
}): void {
  if (
    !options.source ||
    !options.previousAccountId ||
    options.previousAccountId === options.newAccountId
  ) {
    return;
  }

  const eventData = {
    interaction_type: "Account_Switched" as const,
    previous_account_id: options.previousAccountId,
    new_account_id: options.newAccountId,
    source: options.source,
  };

  logGTMAccountSwitched(eventData);
  sendAccountSwitchedEvent(eventData);
}

/**
 * Fires GTM and CDP "profile context switched" events for an account switch.
 * Call this whenever the selected account changes (e.g. from dropdown, side nav, or View My Profile).
 *
 * @param account - The newly selected account
 * @param currentLanguage - Current language code (e.g. from ProfileContext)
 */
export function fireAccountSwitchEvents(
  account: ProfileAccount,
  currentLanguage: string,
  options?: FireAccountSwitchEventsOptions
): void {
  const language = currentLanguage || "";

  logGTMProfileContextSwitched({
    contextType: CONTEXT_TYPE_ACCOUNT,
    active_language: language,
    active_organization: account.organization,
    active_job_role: account.role,
    active_account: account.companyName,
  });

  sendProfileContextSwitchedEvent({
    type: "customerportal:PROFILE_CONTEXT_SWITCHED",
    contextType: CONTEXT_TYPE_ACCOUNT,
    active_language: language,
    active_organization: account.organization,
    active_job_role: account.role,
    active_account: account.companyName,
  });

  if (
    options?.emitEnhancedEvent !== false &&
    options?.source &&
    options.previousAccountId &&
    options.previousAccountId !== account.id
  ) {
    fireEnhancedAccountSwitchEvent({
      previousAccountId: options.previousAccountId,
      newAccountId: account.id,
      source: options.source,
    });
  }
}
