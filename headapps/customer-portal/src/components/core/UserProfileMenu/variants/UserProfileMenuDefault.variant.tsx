"use client";

import { ChevronUpIcon, CloseIcon } from "@/components/shared/icons";
import ChevronDownIcon from "@/components/shared/icons/ChevronDownIcon";
import Button from "@/components/ui/Button";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useDeviceType } from "@/hooks/use-device-type";
import useClickOutside from "@/hooks/useClickOutside";
import { completeAccountSwitchAfterPreferenceSave } from "@/lib/account-switch-navigation";
import {
  sendLogoutEvent,
  sendProfileMenuOpenedEvent,
  sendProfileSettingsAccessedEvent,
  sendUserSignedOutEvent,
} from "@/lib/CDPEvents";
import {
  logGTMLogout,
  logGTMProfileMenuOpened,
  logGTMProfileSettingsAccessed,
  logGTMUserSignedOut,
} from "@/lib/gtm";
import { logout } from "@/lib/client-auth-sign-out";
import { getOktaAuthConfig, isOktaConfigured } from "@/lib/okta-config";
import { useProfileContext, type ProfileAccount } from "@/lib/profile-context";
import { ensureSessionStart, getSessionDurationSeconds } from "@/lib/session-duration";
import { useUserProfile } from "@/lib/user-profile-context";
import { saveUserPreferences } from "@/lib/apis/user-preference-api";
import { cn, sortCompanyAccountsByActiveThenName } from "@/lib/utils";
import OktaAuth from "@okta/okta-auth-js";
import { useOktaAuth } from "@okta/okta-react";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ComponentProps } from "@/lib/component-props";
import type { IUserProfileMenuFields, IUserProfileMenuParams } from "../UserProfileMenu.type";
import UserProfileMenuContent from "./UserProfileMenuContent";

interface IUserProfileMenuVariantProps {
  testId: string;
  fields: IUserProfileMenuFields;
  params: ComponentProps["params"] & IUserProfileMenuParams;
  page: ComponentProps["page"];
}

function getInitials(name: string | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

const UserProfileMenuDefaultVariantBase = ({
  testId,
  fields,
  params,
  page,
}: IUserProfileMenuVariantProps): React.ReactElement => {
  const { HideCTA } = params;
  const isEditing = page.mode.isEditing;
  const showEmptyStateCTA = isEditing || !Boolean(Number(HideCTA));
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const { isMobile } = useDeviceType();
  useBodyScrollLock(isOpen && isMobile);
  const { selectedAccount, currentLanguage } = useProfileContext();
  const { accounts, loading: profileLoading } = useUserProfile();
  const pathname = usePathname();

  const sortedAccounts = useMemo(
    () => sortCompanyAccountsByActiveThenName([...accounts]),
    [accounts]
  );

  const closeMenu = useCallback(() => setIsOpen(false), []);

  const oktaAuthContext = useOktaAuth();
  const authState = oktaAuthContext?.authState || null;
  const oktaEmail = oktaAuthContext?.authState?.idToken?.claims?.email as string | undefined;

  const contextOktaAuth = oktaAuthContext?.oktaAuth || null;
  // Extract user info from Okta authState. Initials are null until auth is ready to avoid flashing "U" on refresh.
  const userInfo = useMemo(() => {
    if (!authState?.isAuthenticated || !authState.idToken?.claims) {
      return {
        name: "",
        email: "",
        userId: "",
        role: "",
        initials: null as string | null,
      };
    }

    const claims = authState.idToken.claims;
    const userId = claims.sub as string;
    const name =
      (claims.name as string) ||
      `${claims.given_name || ""} ${claims.family_name || ""}`.trim() ||
      claims.email?.split("@")[0] ||
      "User";
    const email = (claims.email as string) || "";

    return {
      name,
      email,
      userId,
      role: selectedAccount?.role || "",
      initials: getInitials(name),
    };
  }, [authState, selectedAccount]);

  const oktaAuth = useMemo(() => {
    if (contextOktaAuth) {
      return contextOktaAuth;
    }

    if (typeof window !== "undefined" && isOktaConfigured()) {
      try {
        const config = getOktaAuthConfig();
        return new OktaAuth(config);
      } catch {
        return null;
      }
    }

    return null;
  }, [contextOktaAuth]);

  useClickOutside(dropdownRef, closeMenu, isOpen);

  useEffect(() => {
    ensureSessionStart();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeMenu]);

  // Early return if fields are missing
  if (!fields) {
    return <div data-testid={testId} />;
  }

  const handleAccountSelect = async (account: ProfileAccount) => {
    const previousAccountId = selectedAccount?.id;
    closeMenu();

    const result = await saveUserPreferences({
      userEmail: oktaEmail ?? "",
      defaultLanguage: currentLanguage || "",
      defaultAccount: account.id,
      userPreference: 0,
    });
    if (result !== null) {
      completeAccountSwitchAfterPreferenceSave({
        account,
        previousAccountId,
        source: "profile_menu",
        currentLanguage: currentLanguage || "",
        pathname,
      });
    }
  };

  const handleTriggerPress = () => {
    setIsOpen((wasOpen) => {
      const nextOpen = !wasOpen;
      if (nextOpen) {
        const eventData = {
          interaction_type: "profile_menu_opened" as const,
          user_id: userInfo.userId,
          account_id: selectedAccount?.id,
        };

        logGTMProfileMenuOpened(eventData);
        sendProfileMenuOpenedEvent(eventData);
      }
      return nextOpen;
    });
  };

  const handleProfileItemActivate = () => {
    const eventData = {
      interaction_type: "profile_settings_accessed" as const,
      user_id: userInfo.userId,
      account_id: selectedAccount?.id,
    };

    logGTMProfileSettingsAccessed(eventData);
    sendProfileSettingsAccessedEvent(eventData);
  };

  const handleSignOut = async () => {
    closeMenu();

    try {
      const signOutEventData = {
        interaction_type: "user_signed_out" as const,
        user_id: userInfo.userId,
        account_id: selectedAccount?.id,
        session_duration: getSessionDurationSeconds(),
      };

      logGTMUserSignedOut(signOutEventData);
      sendUserSignedOutEvent(signOutEventData);
      logGTMLogout(userInfo);
      sendLogoutEvent({
        type: "customerportal:LOGOUT",
        userId: userInfo.userId,
        email: userInfo.email,
        name: userInfo.name,
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }

    await logout(oktaAuth);
  };

  return (
    <div className={"relative me-[20px] max-md:me-0"} ref={dropdownRef} data-testid={testId}>
      {/* Trigger button - use provided trigger or default button */}
      <Button
        variant="ghost"
        className={
          "flex items-center gap-[8px] h-[48px] px-[8px] rounded-[10px] transition-colors duration-150 max-md:bg-[transparent]"
        }
        onPress={handleTriggerPress}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={isOpen ? menuId : undefined}
        aria-label="User menu"
      >
        <div
          className={
            "w-[36px] h-[36px] rounded-full border-2 border-transparent border-solid flex items-center justify-center overflow-hidden p-[2px] bg-[linear-gradient(155.8deg,_#053971_0.22%,_#001e3e_112.95%)] max-md:w-[32px] max-md:h-[32px]"
          }
        >
          <span className={"text-white text-[12px] font-medium leading-[16px]"}>
            {userInfo.initials}
          </span>
        </div>
        {isOpen ? (
          <ChevronUpIcon width={16} height={16} stroke="#000000" />
        ) : (
          <ChevronDownIcon width={16} height={16} stroke="#000000" />
        )}
      </Button>

      {isOpen && isMobile && (
        <>
          <div
            className={"fixed inset-0 z-40 bg-black/50 overscroll-y-contain"}
            role="menu"
            aria-label="User profile menu"
            onMouseDown={closeMenu}
          />
          <div
            className={
              "fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex flex-col bg-white rounded-t-[12px] max-h-[85vh] overflow-hidden border border-b-0 w-full max-w-[343px] border-[var(--color-border-default)] shadow-[var(--color-shadow-dropdown)]"
            }
            role="menu"
            aria-label="User profile menu"
          >
            <div className={"flex flex-col flex-1 min-h-0 overflow-hidden"}>
              <UserProfileMenuContent
                accounts={sortedAccounts}
                fields={fields}
                selectedAccount={selectedAccount}
                onAccountSelect={handleAccountSelect}
                onCloseMenu={closeMenu}
                onProfileItemActivate={handleProfileItemActivate}
                onSignOut={handleSignOut}
                profileLoading={profileLoading}
                showEmptyStateCTA={showEmptyStateCTA}
                headerAction={
                  <Button
                    variant="ghost"
                    btnVariant="iconBtn"
                    className={
                      "flex items-center justify-center w-[32px] h-[32px] rounded-full border-0 bg-transparent cursor-pointer transition-colors duration-150 hover:bg-gray-100 shrink-0"
                    }
                    onPress={closeMenu}
                    aria-label="Close menu"
                  >
                    <CloseIcon width={16} height={16} decorative />
                  </Button>
                }
              />
            </div>
          </div>
        </>
      )}
      {isOpen && !isMobile && (
        <div
          className={cn(
            "absolute top-full mt-2 inset-e-0 flex flex-col items-start overflow-hidden box-border w-[280px] bg-white rounded-[6px] z-50 p-[1px_1px_8px_1px]",
            "max-w-[calc(100vw_-_16px)] border border-[var(--color-border-default)] shadow-[var(--color-shadow-dropdown)]",
            sortedAccounts.length === 1 && "w-[280px] min-w-[280px]"
          )}
          role="menu"
          aria-label="User profile menu"
          id={menuId}
        >
          <UserProfileMenuContent
            accounts={sortedAccounts}
            fields={fields}
            selectedAccount={selectedAccount}
            onAccountSelect={handleAccountSelect}
            onCloseMenu={closeMenu}
            onProfileItemActivate={handleProfileItemActivate}
            onSignOut={handleSignOut}
            profileLoading={profileLoading}
            showEmptyStateCTA={showEmptyStateCTA}
          />
        </div>
      )}
    </div>
  );
};

export const UserProfileMenuDefaultVariant = React.memo(UserProfileMenuDefaultVariantBase);
