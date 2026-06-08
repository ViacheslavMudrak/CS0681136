"use client";

import { HamburgerMenuIcon } from "@/components/shared/icons";
import Button from "@/components/ui/Button";
import { useIsIcreonUser } from "@/hooks/useIsIcreonUser";
import { cn } from "@/lib/utils";
import { useOktaAuth } from "@okta/okta-react";
import { useMemo } from "react";
import Help from "../Help";
import LanguageSwitcher from "../Language";
import SearchBar from "../SearchBar";
import UserMenu from "../UserMenu";

interface HeaderClientProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

function getInitials(name: string | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function HeaderClient({
  onToggleSidebar,
  isSidebarCollapsed = false,
}: HeaderClientProps) {
  const oktaAuthContext = useOktaAuth();
  const authState = oktaAuthContext?.authState || null;
  const isIcreonUser = useIsIcreonUser();

  const userInfo = useMemo(() => {
    if (!authState?.isAuthenticated || !authState.idToken?.claims) {
      return {
        name: "User",
        email: "",
        userId: "",
        role: "",
        initials: "U",
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
      role: isIcreonUser ? "User" : "Tyson Foods | Admin",
      initials: getInitials(name),
    };
  }, [authState, isIcreonUser]);

  return (
    <>
      <div className="flex-1 flex items-center gap-4 max-lg:flex-1 max-lg:min-w-0">
        <Button
          variant="muted"
          onPress={onToggleSidebar}
          className={cn(
            "w-[36px] h-[36px] flex items-center justify-center",
            "rounded-[8px] transition-colors duration-150",
            "hover:bg-gray-100 lg:hidden"
          )}
          aria-label="Toggle sidebar"
          aria-expanded={!isSidebarCollapsed}
        >
          <HamburgerMenuIcon
            width={24}
            height={24}
            className="text-gray-600"
            decorative={false}
            aria-label="Toggle sidebar"
          />
        </Button>
        <SearchBar />
      </div>
      <div className="w-px h-8 bg-gray-200 mx-2" />
      <div className="flex justify-end items-center gap-3 max-lg:gap-1 max-md:gap-1">
        <LanguageSwitcher />
        <Help />
        <UserMenu
          name={userInfo.name}
          role={userInfo.role}
          initials={userInfo.initials}
          email={userInfo.email}
          userId={userInfo.userId}
        />
      </div>
    </>
  );
}
