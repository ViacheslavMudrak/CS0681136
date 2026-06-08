"use client";

import { useEffect, useRef, type JSX, type MouseEvent } from "react";
import { Link as SitecoreLink, Text } from "@sitecore-content-sdk/nextjs";
import { Popover } from "@laitram-l-l-c/intralox-ui-components";
import { cn } from "lib/utils";

import type { MainNavItem } from "../Navigation.type";
import {
  EMPTY_LINK,
  getLinkFieldHref,
  getLinkRel,
  getNavItemTitle,
  resolveChildLinksForHeaderDisplay,
  NAV_SAME_TAB_TARGET,
  resolveNavFieldsLinkField,
} from "../navigationUtils";
import { MegaMenuPanel } from "./NavigationDesktopPartials";

interface NavMainNavItemProps {
  item: MainNavItem;
  isEditing: boolean;
  pathname: string;
  sitecoreItemPath?: string;
  routeItemGuid?: string;
  hasComplexLayout: boolean;
  hasDropdown: boolean;
  isMenuOpen: boolean;
  fullMainNavSelection: boolean;
  routeSoftHighlight: boolean;
  isRouteActive: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

/** Desktop primary nav row with optional mega-menu flyout via design-system Popover. */
export const NavMainNavItem = ({
  item,
  isEditing,
  pathname,
  sitecoreItemPath,
  routeItemGuid,
  hasComplexLayout,
  hasDropdown,
  isMenuOpen,
  fullMainNavSelection,
  routeSoftHighlight,
  isRouteActive,
  onMenuOpenChange,
}: NavMainNavItemProps): JSX.Element => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const title = getNavItemTitle(item);
  const hasFeatured = !!(
    (item.fields?.Heading?.value && String(item.fields.Heading.value).trim()) ||
    (item.fields?.Description?.value &&
      String(item.fields.Description.value).trim()) ||
    item.fields?.Image?.value?.src
  );
  const handleTriggerClick = (event?: MouseEvent) => {
    if (!hasDropdown) return;
    event?.preventDefault();
    onMenuOpenChange(!isMenuOpen);
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDownOutside = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onMenuOpenChange(false);
    };

    document.addEventListener("pointerdown", handlePointerDownOutside, true);
    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDownOutside,
        true,
      );
    };
  }, [isMenuOpen, onMenuOpenChange]);

  return (
    <li
      data-nav-main-item-id={item.id}
      className={cn(
        "relative m-0! list-none! flex min-w-0 flex-col self-stretch",
        "h-12 min-[768px]:h-[72px]",
        fullMainNavSelection &&
          "bg-surface-subtle focus-within:bg-surface-subtle",
        routeSoftHighlight &&
          "bg-surface-selected focus-within:bg-surface-selected",
        !fullMainNavSelection &&
          !routeSoftHighlight &&
          "hover:bg-surface-selected focus-within:bg-surface-selected",
      )}
      role="none"
    >
      <div
        ref={triggerRef}
        className="nav-main-trigger-shell relative z-[1] flex min-h-0 min-w-0 w-full flex-1 flex-col self-stretch [&>*]:flex [&>*]:min-h-0 [&>*]:min-w-0 [&>*]:flex-1 [&>*]:flex-col [&_a]:box-border [&_a]:m-0 [&_a]:flex [&_a]:min-h-0 [&_a]:flex-1 [&_a]:items-center [&_a]:justify-center [&_a]:bg-transparent [&_a]:py-0 [&_button]:box-border [&_button]:m-0 [&_button]:flex [&_button]:min-h-0 [&_button]:flex-1 [&_button]:items-center [&_button]:justify-center [&_button]:bg-transparent [&_button]:py-0"
      >
        {getLinkFieldHref(resolveNavFieldsLinkField(item.fields)) ? (
          <SitecoreLink
            field={resolveNavFieldsLinkField(item.fields) ?? EMPTY_LINK}
            editable={isEditing}
            target={NAV_SAME_TAB_TARGET}
            rel={getLinkRel(NAV_SAME_TAB_TARGET)}
            className={cn(
              "font-bold uppercase tracking-wide text-base text-ink-primary no-underline cursor-pointer min-h-0 h-full w-full min-w-0 flex items-center justify-center px-4 py-0 m-0 box-border bg-transparent border-y-0 border-x border-transparent whitespace-nowrap transition-[color,box-shadow,border-color] motion-reduce:transition-none focus:outline-none [&_*]:cursor-pointer",
              fullMainNavSelection &&
                "shadow-[inset_3px_0_0_0_var(--color-accent-nav),inset_-3px_0_0_0_var(--color-accent-nav)] border-stroke-default",
              !fullMainNavSelection &&
                "focus-visible:ring-2 focus-visible:ring-[var(--color-accent-nav)] focus-visible:ring-offset-0",
            )}
            role="menuitem"
            aria-haspopup={hasDropdown ? "true" : undefined}
            aria-expanded={hasDropdown ? isMenuOpen : undefined}
            aria-current={isRouteActive ? "page" : undefined}
            onClick={handleTriggerClick}
          >
            {title}
          </SitecoreLink>
        ) : (
          <button
            type="button"
            className={cn(
              "font-bold uppercase tracking-wide text-base text-ink-primary no-underline cursor-pointer min-h-0 h-full w-full min-w-0 flex items-center justify-center px-4 py-0 m-0 box-border bg-transparent border-y-0 border-x border-transparent whitespace-nowrap transition-[color,box-shadow,border-color] motion-reduce:transition-none focus:outline-none [&_*]:cursor-pointer",
              fullMainNavSelection &&
                "shadow-[inset_3px_0_0_0_var(--color-accent-nav),inset_-3px_0_0_0_var(--color-accent-nav)] border-stroke-default",
              !fullMainNavSelection &&
                "focus-visible:ring-2 focus-visible:ring-[var(--color-accent-nav)] focus-visible:ring-offset-0",
            )}
            role="menuitem"
            aria-haspopup={hasDropdown ? "true" : undefined}
            aria-expanded={hasDropdown ? isMenuOpen : undefined}
            aria-current={isRouteActive ? "page" : undefined}
            onClick={() => handleTriggerClick()}
          >
            {item.fields?.Title?.value || isEditing ? (
              <Text field={item.fields?.Title} />
            ) : (
              title
            )}
          </button>
        )}
      </div>
      {hasDropdown && (
        <Popover
          triggerRef={triggerRef}
          isOpen={isMenuOpen}
          onOpenChange={onMenuOpenChange}
          placement="bottom"
          offset={0}
          isNonModal
          className={cn(
            "z-[999] mt-0 box-border bg-surface rounded-lg overflow-hidden border border-stroke-default shadow-md outline-none",
            hasComplexLayout
              ? "w-[768px]"
              : hasFeatured
                ? "w-[448px]"
                : "w-[224px]",
          )}
        >
          <div ref={panelRef}>
            <MegaMenuPanel
              item={item}
              isEditing={isEditing}
              hasComplexLayout={hasComplexLayout}
              pathname={pathname}
              sitecoreItemPath={sitecoreItemPath}
              routeItemGuid={routeItemGuid}
            />
          </div>
        </Popover>
      )}
    </li>
  );
};
