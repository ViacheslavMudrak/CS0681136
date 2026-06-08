"use client";

import {
  CollapsedDashboardIcon,
  CollapsedDocumentsIcon,
  CollapsedOrderIcon,
  CollapsedResourcesIcon,
  CollapsedRolesIcon,
  CollapsedSupportIcon,
  CollapsedUsersIcon,
  ExpandedLogoIcon,
} from "@/components/shared/icons";
import Button from "@/components/ui/Button";
import { useIsIcreonUser } from "@/hooks/useIsIcreonUser";
import { cn } from "@/lib/utils";
import { useOktaAuth } from "@okta/okta-react";
import Link from "next/link";
import { useMemo } from "react";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const sidebarBaseClass =
  "fixed top-0 h-screen left-0 bg-[#1e293b] flex flex-col z-40 transition-all duration-300 ease-in-out rtl:[direction:rtl] lg:translate-x-0";

const navItemClass =
  "flex items-center gap-[10.5px] h-[35px] px-[10.5px] rounded-[7px] text-[#99a1af] text-[12.25px] font-normal transition-colors duration-150 w-full relative bg-transparent border-none cursor-pointer text-start hover:bg-[rgba(51,65,85,0.5)] [&_svg]:shrink-0 [&_svg]:text-current";

const navItemActiveClass = "bg-[rgba(51,65,85,0.5)] text-white";

const collapsedNavItemClass =
  "bg-transparent border-none cursor-pointer w-full h-[35px] rounded-[7px] flex items-center justify-center transition-colors duration-150 hover:bg-[rgba(51,65,85,0.5)] [&_img]:block [&_img]:max-w-none [&_img]:w-[17.5px] [&_img]:h-[17.5px]";

const collapsedNavItemActiveClass = "bg-[rgba(51,65,85,0.5)]";

function getInitials(name: string | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const oktaAuthContext = useOktaAuth();
  const authState = oktaAuthContext?.authState || null;
  const isIcreonUser = useIsIcreonUser();

  const userInfo = useMemo(() => {
    if (!authState?.isAuthenticated || !authState.idToken?.claims) {
      return {
        name: "User",
        company: "",
        initials: "U",
      };
    }

    const claims: Record<string, unknown> = authState.idToken.claims as Record<string, unknown>;
    const name =
      (claims.name as string) ||
      `${claims.given_name || ""} ${claims.family_name || ""}`.trim() ||
      (typeof claims.email === "string" ? claims.email.split("@")[0] : undefined) ||
      "User";
    const company =
      (claims.organization as string) ||
      (Array.isArray(claims.groups) ? (claims.groups[0] as string) : "") ||
      "";

    return {
      name,
      company,
      initials: getInitials(name),
    };
  }, [authState]);

  if (isCollapsed) {
    return (
      <aside className={cn(sidebarBaseClass, "w-[56px]", "max-lg:-translate-x-full")}>
        <Button
          variant="inverse"
          onPress={onToggleCollapse}
          className="bg-[#ea1c24] h-[63px] w-[56px] flex items-center justify-center transition-colors duration-150 hover:bg-[#d01a20]"
        >
          <div className="w-[21px] h-[21px] relative [&_img]:block [&_img]:max-w-none [&_img]:w-full [&_img]:h-full">
            <ExpandedLogoIcon alt="Intralox" decorative={false} height={50} width={50} />
          </div>
        </Button>

        <div className="flex-1 overflow-y-auto flex flex-col gap-[21px] items-start pt-[21px] px-[7px] pb-0">
          <div className="flex flex-col gap-[3.5px] items-start w-full">
            <Button
              type="button"
              btnVariant="iconBtn"
              variant="transparent"
              className={cn(collapsedNavItemClass, collapsedNavItemActiveClass)}
              onPress={() => undefined}
            >
              <CollapsedDashboardIcon aria-description="Dashboard" decorative={false} />
            </Button>
            {!isIcreonUser && (
              <>
                <Button
                  type="button"
                  btnVariant="iconBtn"
                  variant="transparent"
                  className={collapsedNavItemClass}
                  onPress={() => undefined}
                >
                  <CollapsedOrderIcon aria-description="Order Management" decorative={false} />
                </Button>
                <Button
                  type="button"
                  btnVariant="iconBtn"
                  variant="transparent"
                  className={collapsedNavItemClass}
                  onPress={() => undefined}
                >
                  <CollapsedResourcesIcon aria-description="Resources & Tools" decorative={false} />
                </Button>
                <Button
                  type="button"
                  btnVariant="iconBtn"
                  variant="transparent"
                  className={collapsedNavItemClass}
                  onPress={() => undefined}
                >
                  <CollapsedDocumentsIcon
                    aria-description="Technical Documents"
                    decorative={false}
                  />
                </Button>
                <Button
                  type="button"
                  btnVariant="iconBtn"
                  variant="transparent"
                  className={collapsedNavItemClass}
                  onPress={() => undefined}
                >
                  <CollapsedSupportIcon aria-description="Support Cases" decorative={false} />
                </Button>
              </>
            )}
          </div>

          {!isIcreonUser && (
            <div className="flex flex-col gap-[3.5px] items-start w-full">
              <Button
                type="button"
                btnVariant="iconBtn"
                variant="transparent"
                className={collapsedNavItemClass}
                onPress={() => undefined}
              >
                <CollapsedRolesIcon aria-description="Roles & Permissions" decorative={false} />
              </Button>
              <Button
                type="button"
                btnVariant="iconBtn"
                variant="transparent"
                className={collapsedNavItemClass}
                onPress={() => undefined}
              >
                <CollapsedUsersIcon aria-description="User Management" decorative={false} />
              </Button>
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className={cn(sidebarBaseClass, "w-[233px] max-lg:translate-x-0")}>
      <div className="bg-[#ea1c24] h-[68px] w-full flex items-center gap-[10.5px] px-[21px] relative">
        <Button
          type="button"
          btnVariant="iconBtn"
          variant="transparent"
          onPress={() => onToggleCollapse?.()}
          className="absolute top-[50%] translate-y-[-50%] end-3 w-[32px] h-[32px] flex items-center justify-center rounded-[4px] transition-colors duration-150 hover:bg-white/10 cursor-pointer"
          aria-label="Collapse sidebar"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>

        <div className="h-[32px] w-[56px] relative shrink-0">
          <div className="h-[32px] w-[56px] relative overflow-hidden">
            <ExpandedLogoIcon
              alt="Intralox"
              className="absolute inset-0 max-w-none object-contain w-full h-full"
              decorative={false}
            />
          </div>
        </div>
        <div className="flex flex-col gap-0">
          <div className="text-white text-[15.75px] font-bold leading-[19.688px]">IntraOne</div>
          <div className="text-white text-[10.5px] font-normal leading-[13.125px] opacity-90">
            Customer Portal
          </div>
        </div>
      </div>

      <div className="px-[14px] pt-[21px] pb-0">
        <div className="bg-[rgba(51,65,85,0.5)] h-[52.5px] rounded-[7px] w-full flex items-center px-[10.5px] gap-[10.5px]">
          <div className="size-[31.5px] rounded-full bg-white flex items-center justify-center shrink-0">
            <span className="font-['Helvetica_Neue:Regular',sans-serif] text-[12.25px] text-[#1d293d] text-center">
              {userInfo.initials}
            </span>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="font-['Helvetica_Neue:Regular',sans-serif] text-[12.25px] text-white leading-[17.5px]">
              {userInfo.name}
            </div>
            <div className="font-['Helvetica_Neue:Regular',sans-serif] text-[10.5px] text-[#99a1af] leading-[14px]">
              {userInfo.company || "User"}
            </div>
          </div>
          <div className="size-[14px] flex items-center justify-center shrink-0 text-[#99a1af]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.5 5.25L7 8.75L10.5 5.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-[14px] pt-[14px] flex flex-col gap-[20px]">
        <div className="flex flex-col gap-[10.5px]">
          <p className="text-[#6a7282] text-[10px] uppercase tracking-[0.5px] mb-[10.5px] ms-[7px]">
            General
          </p>
          <div className="flex flex-col gap-[2px]">
            <Link href={"/dashboard"} className={cn(navItemClass, navItemActiveClass)}>
              <svg
                width="17.5"
                height="17.5"
                viewBox="0 0 17.5 17.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.1875 8.75L8.75 2.1875L15.3125 8.75M8.75 15.3125V2.1875"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Dashboard</span>
            </Link>
            {!isIcreonUser && (
              <>
                <Button
                  type="button"
                  variant="transparent"
                  className={navItemClass}
                  onPress={() => undefined}
                >
                  <svg
                    width="17.5"
                    height="17.5"
                    viewBox="0 0 17.5 17.5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.1875 4.375H15.3125M2.1875 8.75H15.3125M2.1875 13.125H15.3125"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4.375 2.1875V6.5625M8.75 2.1875V6.5625M13.125 2.1875V6.5625"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Order Management</span>
                </Button>
                <Button
                  type="button"
                  variant="transparent"
                  className={navItemClass}
                  onPress={() => undefined}
                >
                  <svg
                    width="17.5"
                    height="17.5"
                    viewBox="0 0 17.5 17.5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.75 2.1875L2.1875 6.5625V15.3125H15.3125V6.5625L8.75 2.1875Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.75 8.75V13.125"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Resources & Tools</span>
                </Button>
                <Link href="/dashboard/technical-documents" className={navItemClass}>
                  <svg
                    width="17.5"
                    height="17.5"
                    viewBox="0 0 17.5 17.5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.375 2.1875H11.375L15.3125 6.125V15.3125H4.375V2.1875Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.375 2.1875V6.5625H15.3125"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Technical Documents</span>
                </Link>
                <Link href="/dashboard/support" className={navItemClass}>
                  <svg
                    width="17.5"
                    height="17.5"
                    viewBox="0 0 17.5 17.5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.75 15.3125C12.4062 15.3125 15.3125 12.4062 15.3125 8.75C15.3125 5.09375 12.4062 2.1875 8.75 2.1875C5.09375 2.1875 2.1875 5.09375 2.1875 8.75C2.1875 12.4062 5.09375 15.3125 8.75 15.3125Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.75 11.375V8.75M8.75 6.5625H8.7575"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Support Cases</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {!isIcreonUser && (
          <div className="flex flex-col gap-[10.5px]">
            <p className="text-[#6a7282] text-[10px] uppercase tracking-[0.5px] mb-[10.5px] ms-[7px]">
              Admin
            </p>
            <div className="flex flex-col gap-[2px]">
              <Link href="/dashboard/roles" className={navItemClass}>
                <svg
                  width="17.5"
                  height="17.5"
                  viewBox="0 0 17.5 17.5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="6.5625"
                    cy="6.5625"
                    r="2.1875"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="10.9375"
                    cy="6.5625"
                    r="2.1875"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M2.1875 13.125C2.1875 11.5 4.375 10.5 6.5625 10.5C8.75 10.5 10.9375 11.5 10.9375 13.125"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.5625 13.125C6.5625 11.5 8.75 10.5 10.9375 10.5C12.5625 10.5 14.0625 11.5 14.0625 13.125"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Roles & Permissions</span>
              </Link>
              <Link href="/dashboard/users" className={navItemClass}>
                <svg
                  width="17.5"
                  height="17.5"
                  viewBox="0 0 17.5 17.5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="8.75"
                    cy="6.5625"
                    r="2.1875"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M2.1875 13.125C2.1875 11.5 5.25 10.5 8.75 10.5C12.25 10.5 15.3125 11.5 15.3125 13.125"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>User Management</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-[#364153] border-solid h-[43px] px-[21px] py-[15px]">
        <div className="flex items-center justify-between h-[14px]">
          <div className="text-[#6a7282] text-[10.5px] font-normal leading-[14px]">
            © 2025 Intralox
          </div>
          <a
            href="https://www.intralox.com"
            className="text-[#6a7282] text-[10.5px] font-medium leading-[14px] hover:text-white transition-colors duration-150"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Intralox.com opens in a new tab"
          >
            Intralox.com
          </a>
        </div>
      </div>
    </aside>
  );
}
