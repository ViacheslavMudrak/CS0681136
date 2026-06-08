"use client";

import {
  CheckIcon,
  ChevronDownIcon,
  LogoutIcon,
  OrganizationIcon,
  ProfileIcon,
} from "@/components/shared/icons";
import Button from "@/components/ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { useIsIcreonUser } from "@/hooks/useIsIcreonUser";
import { sendLogoutEvent } from "@/lib/CDPEvents";
import { clearAllStorage } from "@/lib/okta-auth-client";
import { cn } from "@/lib/utils";
import { OktaAuth } from "@okta/okta-auth-js";
import { useOktaAuth } from "@okta/okta-react";
import { logGTMLogout } from "lib/gtm";
import { getOktaAuthConfig, isOktaConfigured } from "lib/okta-config";
import ImageComponent from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface Organization {
  id: string;
  name: string;
  role: string;
}

interface UserMenuProps {
  userId: string;
  name: string;
  role: string;
  initials: string;
  email: string;
  avatarUrl?: string;
  organizations?: Organization[];
}

const defaultOrganizations: Organization[] = [
  {
    id: "1",
    name: "Tyson Foods",
    role: "Admin",
  },
  {
    id: "2",
    name: "Springfield Manufacturing",
    role: "Purchasing Coordinator",
  },
];

export default function UserMenu({
  userId,
  name,
  role,
  initials,
  email,
  avatarUrl,
  organizations = defaultOrganizations,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(organizations[0]?.id || "");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isIcreonUser = useIsIcreonUser();

  const authContext = useOktaAuth();
  const contextOktaAuth = authContext?.oktaAuth || null;

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

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleOrganizationSwitch = (orgId: string) => {
    setSelectedOrgId(orgId);
    setIsOpen(false);
  };

  const handleProfileSettings = () => {
    setIsOpen(false);
    router.push("/dashboard/profile");
  };

  const handleSignOut = async () => {
    setIsOpen(false);

    try {
      const userInfo = { email, name, userId };
      logGTMLogout(userInfo);
      sendLogoutEvent({
        type: "customerportal:LOGOUT",
        ...userInfo,
      });

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.warn("Failed to clear server-side cookies:", error);
      }

      if (oktaAuth) {
        try {
          await oktaAuth.closeSession();
        } catch (error) {
          console.warn("Failed to close Okta browser session:", error);
        }
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      clearAllStorage();
      router.push("/login");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="transparent"
        onPress={() => setIsOpen(!isOpen)}
        className={cn(
          "w-20 p-2.5 flex justify-start items-center gap-2.5",
          "transition-colors duration-150",
          "hover:bg-gray-50"
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User menu"
      >
        <div
          className={cn(
            "relative size-9 rounded-full flex justify-center items-center overflow-hidden shrink-0"
          )}
        >
          {avatarUrl ? (
            <ImageComponent
              src={avatarUrl}
              alt={name}
              className="size-8 rounded-full object-cover shrink-0"
              width={32 as number}
              height={32 as number}
            />
          ) : (
            <span
              className={cn(
                "absolute inset-0 flex flex-row justify-center items-center p-0",
                "w-9 h-9 rounded-full",
                "bg-[linear-gradient(155.8deg,#053971_0.22%,#001E3E_112.95%)]",
                "text-white text-xs font-medium leading-4"
              )}
            >
              {initials}
            </span>
          )}
        </div>
        <ChevronDownIcon
          width={16}
          height={16}
          className={cn(
            "shrink-0 transition-transform duration-150 size-4 text-gray-800",
            isOpen && "rotate-180"
          )}
          decorative={true}
        />
      </Button>

      {isOpen && (
        <div className="box-border absolute top-full mt-2 end-0 flex flex-col items-start p-px pb-2 w-[280px] min-w-[280px] bg-white border border-[#e8eaeb] shadow-[0px_0px_12px_rgba(0,0,0,0.13)] rounded-[6px] overflow-hidden z-50 max-md:start-0 max-md:end-auto">
          {!isIcreonUser && (
            <>
              <div className="flex flex-col w-full">
                <div className="h-[32px] px-[12px] py-[8px]">
                  <p className="text-[#0f172b] text-[12px] font-semibold leading-[16px]">
                    Company Locations
                  </p>
                </div>
                <div className="flex flex-col gap-[2px] px-[8px] py-0 w-full">
                  {organizations.map((org) => {
                    const isSelected = org.id === selectedOrgId;
                    return (
                      <Button
                        key={org.id}
                        variant="muted"
                        onPress={() => handleOrganizationSwitch(org.id)}
                        className={cn(
                          "flex items-center gap-[12px] h-[52px] px-[12px] rounded-[8px] w-full text-start transition-colors duration-150 hover:bg-gray-50",
                          isSelected &&
                            "bg-[#eff6ff] border border-[rgba(219,234,254,0.5)] border-solid"
                        )}
                      >
                        <div className="w-[16px] h-[16px] shrink-0 [&_img]:block [&_img]:max-w-none [&_img]:w-full [&_img]:h-full">
                          <OrganizationIcon />
                        </div>
                        <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                          <div className="text-[#0f172b] text-[13px] font-medium leading-[16.25px] tracking-[-0.0762px]">
                            {org.name}
                          </div>
                          <div
                            className={cn(
                              "text-[#62748e] text-[11px] font-normal leading-[13.75px] tracking-[0.0645px]",
                              isSelected && "text-[rgba(21,93,252,0.8)]"
                            )}
                          >
                            {org.role}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-[16px] h-[16px] shrink-0 [&_img]:block [&_img]:max-w-none [&_img]:w-full [&_img]:h-full">
                            <CheckIcon aria-description="Selected" decorative={false} />
                          </div>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-[#f1f5f9] w-full" />
            </>
          )}

          <div className="flex flex-col w-full">
            <div className="h-[32px] px-[12px] py-[8px]">
              <p className="text-[#0f172b] text-[12px] font-semibold leading-[16px]">Account</p>
            </div>
            <div className="flex flex-col gap-[4px] px-[8px] py-0 w-full">
              {!isIcreonUser && (
                <Button
                  variant="muted"
                  onPress={handleProfileSettings}
                  className="flex items-center gap-[12px] h-[35px] px-[10px] rounded-[8px] w-full text-start transition-colors duration-150 bg-transparent border-none cursor-pointer hover:bg-gray-50"
                >
                  <div className="w-[16px] h-[16px] shrink-0 [&_img]:block [&_img]:max-w-none [&_img]:w-full [&_img]:h-full">
                    <ProfileIcon />
                  </div>
                  <span
                    className="flex-1 text-[#45556c] text-[12.25px] font-normal leading-[15.31px]"
                    style={{ textAlign: "start" }}
                  >
                    Profile Settings
                  </span>
                </Button>
              )}

              <Button
                variant="muted"
                onPress={handleSignOut}
                className="flex items-center gap-[12px] h-[35px] px-[10px] rounded-[8px] w-full text-start transition-colors duration-150 bg-transparent border-none cursor-pointer hover:bg-gray-50"
              >
                <div className="w-[16px] h-[16px] shrink-0 [&_img]:block [&_img]:max-w-none [&_img]:w-full [&_img]:h-full">
                  <LogoutIcon />
                </div>
                <span
                  className="flex-1 text-[#45556c] text-[12.25px] font-normal leading-[15.31px]"
                  style={{ textAlign: "start" }}
                >
                  Sign Out
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
