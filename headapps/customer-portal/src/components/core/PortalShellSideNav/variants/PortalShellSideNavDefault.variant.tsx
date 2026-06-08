"use client";

import { NextImage as ContentSdkImage, Text as ContentSdkText } from "@sitecore-content-sdk/nextjs";
import type { ImageField, LinkField } from "@sitecore-content-sdk/nextjs";
import { useOktaAuth } from "@okta/okta-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/shared/icons";
import { LinkRender } from "@/components/shared/link-render/LinkRender";
import Button from "@/components/ui/Button";
import { useActiveLocale } from "@/hooks/use-active-locale";
import { completeAccountSwitchAfterPreferenceSave } from "@/lib/account-switch-navigation";
import { sendAccountMenuOpenedEvent, sendNavigationMenuClickEvent } from "@/lib/CDPEvents";
import { logGTMAccountMenuOpened, logGTMNavigationMenuClick } from "@/lib/gtm";
import { getPathWithoutLocale } from "@/lib/locale-cookie";
import { localizeHref } from "@/lib/locale-path";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { usePermissionContext } from "@/lib/permission-context";
import {
  isAuxiliaryNavigationClick,
  usePortalRouteTransitionOptional,
} from "@/lib/portal-route-transition-context";
import { extractPermissionCodesFromSelection } from "@/lib/permissions";
import { useProfileContext } from "@/lib/profile-context";
import { useUserProfile } from "@/lib/user-profile-context";
import { saveUserPreferences } from "@/lib/apis/user-preference-api";
import { cn, sortCompanyAccountsByActiveThenName } from "@/lib/utils";
import type {
  PortalShellSideNavFields,
  PortalShellNavSection,
  PortalShellNavItem,
  PortalShellAccount,
} from "../PortalShellSideNav.type";
import { SwitchCompanyModal } from "../components/SwitchCompanyModal";
import {
  collectDefaultExpandedNavItemIds,
  collectPinnedExpandedNavItemIds,
  readShowExpandMenu,
} from "../portalShellSideNavUtils";


interface PortalShellSideNavDefaultProps {
  fields: PortalShellSideNavFields | null;
  testId: string;
}

function getLinkHref(item: PortalShellNavItem): string {
  const raw = item.fields?.URL?.value?.href ?? item.fields?.URL?.value?.url;
  const href = typeof raw === "string" ? raw : "";
  return href.trim() !== "" ? href : "#";
}

function isInternalAppPath(href: string): boolean {
  if (!href || href === "#") return false;
  if (/^https?:\/\//i.test(href)) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  return true;
}

/** Strip trailing slash for stable prefix matching (except root stays `/`). */
function stripTrailingSlash(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

/**
 * Resolves a nav link to a locale-stripped pathname for active-state checks.
 * Handles absolute CMS URLs by using their pathname segment.
 */
function hrefToComparablePath(href: string): string {
  const trimmed = href.trim();
  if (!trimmed || trimmed === "#") return "";
  let path = trimmed;
  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname;
    } catch {
      return "";
    }
  }
  return getPathWithoutLocale(path);
}

function isQuotesOrderManagementPath(href: string): boolean {
  const normalized = stripTrailingSlash(hrefToComparablePath(href)).toLowerCase();
  return /\/orders-management\/quotes(\/|$)/.test(normalized);
}

function getCopyrightWithYear(text: string | undefined): string {
  if (!text) return "";
  const year = new Date().getFullYear();
  return text.replace(/\{current_year\}/gi, String(year));
}

function normalizeAnalyticsLabel(value: string): string {
  return value.trim().replace(/\s+/g, "_");
}

function getNavItemAnalyticsLabel(item: PortalShellNavItem): string {
  const fieldTitle = item.fields?.Title?.value;
  return normalizeAnalyticsLabel(String(fieldTitle || item.displayName || item.name || ""));
}

function getSectionAnalyticsLabel(section: PortalShellNavSection): string {
  const label = String(section.fields?.SectionTitle?.value || section.displayName || section.name || "");
  return label.toLowerCase().includes("admin") ? "ADMIN" : "GENERAL";
}

export default function PortalShellSideNavDefault({
  fields,
  testId,
}: PortalShellSideNavDefaultProps): React.ReactElement {
  const pathname = usePathname();
  const activeLocale = useActiveLocale();
  const router = useRouter();
  const { accounts, defaultAccountId, loading: profileLoading } = useUserProfile();
  const { currentLanguage } = useProfileContext();
  const {
    canAny,
    isLoading: permissionLoading,
    sitecoreEditingPermissionBypass,
  } = usePermissionContext();
  const routeTransition = usePortalRouteTransitionOptional();
  const oktaAuth = useOktaAuth();
  const oktaEmail = oktaAuth?.authState?.idToken?.claims?.email as string | undefined;
  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const accountSwitcherTriggerRef = useRef<HTMLDivElement>(null);
  const isPathActive = useCallback(
    (href: string) => {
      if (!href || href === "#") return false;
      const current = stripTrailingSlash(getPathWithoutLocale(pathname));
      const target = stripTrailingSlash(hrefToComparablePath(href));
      if (!target) return false;
      if (current === target) return true;
      // Home: only exact match, not every path under the site root
      if (target === "/") return false;
      // e.g. nav `/Orders` active for `/Orders/3513458`; also covers `/Orders/layout/...`
      return current.startsWith(target + "/");
    },
    [pathname]
  );
  const sections = useMemo(() => fields?.NavigationSection ?? [], [fields?.NavigationSection]);
  const isSelectionAllowed = useCallback(
    (selection: unknown): boolean => {
      if (sitecoreEditingPermissionBypass) return true;
      const requiredCodes = extractPermissionCodesFromSelection(selection);
      if (!requiredCodes.length) return true;
      if (permissionLoading) return false;
      return canAny(requiredCodes);
    },
    [canAny, permissionLoading, sitecoreEditingPermissionBypass]
  );
  const canAccessQuotesLink = useMemo(() => {
    if (sitecoreEditingPermissionBypass) return true;
    if (permissionLoading) return false;
    return canAny([PERMISSION_CODES.INITIATE_RFQ]);
  }, [canAny, permissionLoading, sitecoreEditingPermissionBypass]);

  const visibleSections = useMemo(() => {
    const filterNavItemsByPermission = (items: PortalShellNavItem[]): PortalShellNavItem[] => {
      const nextItems: PortalShellNavItem[] = [];
      for (const item of items) {
        if (!isSelectionAllowed(item.fields?.PermissionSelection)) {
          continue;
        }
        if (isQuotesOrderManagementPath(getLinkHref(item)) && !canAccessQuotesLink) {
          continue;
        }
        const subItems = item.fields?.SubNavigationItems ?? [];
        const filteredSubItems = filterNavItemsByPermission(subItems);
        nextItems.push({
          ...item,
          fields: {
            ...item.fields,
            SubNavigationItems: filteredSubItems,
          },
        });
      }
      return nextItems;
    };

    const nextSections: PortalShellNavSection[] = [];
    for (const section of sections) {
      if (!isSelectionAllowed(section.fields?.PermissionSelection)) {
        continue;
      }
      const sectionItems = section.fields?.SubNavigationItems ?? [];
      nextSections.push({
        ...section,
        fields: {
          ...section.fields,
          SubNavigationItems: filterNavItemsByPermission(sectionItems),
        },
      });
    }
    return nextSections;
  }, [canAccessQuotesLink, sections, isSelectionAllowed]);

  const pinnedExpandedIds = useMemo(
    () => collectPinnedExpandedNavItemIds(visibleSections),
    [visibleSections]
  );

  const defaultExpandedIds = useMemo(
    () => collectDefaultExpandedNavItemIds(visibleSections, isPathActive, getLinkHref),
    [visibleSections, isPathActive]
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(defaultExpandedIds);
  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      for (const id of defaultExpandedIds) {
        next.add(id);
      }
      return next;
    });
  }, [defaultExpandedIds]);
  const displayAccounts: PortalShellAccount[] = useMemo(
    () => (profileLoading ? [] : sortCompanyAccountsByActiveThenName([...accounts])),
    [profileLoading, accounts]
  );
  const hasAccounts = displayAccounts.length > 0;
  const showAccountBlock = hasAccounts;
  const showNoAccountBlock = !profileLoading && !hasAccounts;
  const [currentAccountId, setCurrentAccountId] = useState<string>("");
  useEffect(() => {
    const nextDefault = defaultAccountId ?? displayAccounts[0]?.id ?? "";
    if (nextDefault && !currentAccountId) {
      setCurrentAccountId(nextDefault);
    }
  }, [defaultAccountId, displayAccounts, currentAccountId]);
  const effectiveAccountId = currentAccountId || (defaultAccountId ?? displayAccounts[0]?.id ?? "");
  const currentAccount = useMemo(
    () => displayAccounts.find((a) => a.id === effectiveAccountId) ?? displayAccounts[0],
    [displayAccounts, effectiveAccountId]
  );

  const trackNavigationMenuClick = useCallback(
    (params: {
      item: PortalShellNavItem;
      section: PortalShellNavSection;
      destinationUrl: string;
      parentItem?: PortalShellNavItem;
    }) => {
      const eventData = {
        interaction_type: "menu_clicked" as const,
        menu_item: getNavItemAnalyticsLabel(params.item),
        ...(params.parentItem ? { parent_item: getNavItemAnalyticsLabel(params.parentItem) } : {}),
        menu_section: getSectionAnalyticsLabel(params.section),
        destination_url: params.destinationUrl,
      };

      logGTMNavigationMenuClick(eventData);
      sendNavigationMenuClickEvent(eventData);
    },
    []
  );

  const handleAccountMenuOpen = useCallback(() => {
    setSwitchModalOpen(true);

    const eventData = {
      interaction_type: "account_menu_opened" as const,
      source: "left_nav" as const,
      account_count: displayAccounts.length,
    };

    logGTMAccountMenuOpened(eventData);
    sendAccountMenuOpenedEvent(eventData);
  }, [displayAccounts.length]);

  const toggleExpanded = useCallback(
    (id: string) => {
      if (pinnedExpandedIds.has(id)) return;
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [pinnedExpandedIds]
  );

  const handleSelectAccount = useCallback(
    async (accountId: string) => {
      const account = accounts.find((a) => a.id === accountId);
      const previousAccountId = effectiveAccountId;
      if (!account) {
        setSwitchModalOpen(false);
        router.refresh();
        return;
      }

      const result = await saveUserPreferences({
        userEmail: oktaEmail ?? "",
        defaultLanguage: currentLanguage || "",
        defaultAccount: account.id,
        userPreference: 0,
      });

      if (result !== null) {
        setSwitchModalOpen(false);
        completeAccountSwitchAfterPreferenceSave({
          account,
          previousAccountId,
          source: "left_nav",
          currentLanguage: currentLanguage || "",
          pathname,
        });
        return;
      }

      setSwitchModalOpen(false);
    },
    [accounts, effectiveAccountId, currentLanguage, router, oktaEmail, pathname]
  );

  if (!fields) {
    return (
      <aside
        data-testid={testId}
        className="grid h-full max-h-full min-h-0 w-full overflow-hidden box-border grid-rows-[auto_minmax(0,1fr)_auto] grid-cols-[minmax(0,1fr)] [dir=rtl]:rtl"
        aria-label="Portal navigation"
      />
    );
  }

  const companyIcon = fields.CompanyIcon;
  const noCompanyIcon = fields.NoCompanyIcon;
  const noCompanyUrl = fields.NoCompanyUrl;
  const copyrightText = getCopyrightWithYear(fields.CopyrightText?.value);
  const websiteUrlField = fields.WebsiteURL;

  const renderNavItem = (
    item: PortalShellNavItem,
    section: PortalShellNavSection,
    isSub = false,
    parentItem?: PortalShellNavItem
  ) => {
    const href = getLinkHref(item);
    const title = item.displayName ?? item.name;
    const iconVal = item.fields?.Icon?.value;
    const subItems = item.fields?.SubNavigationItems ?? [];
    const hasSub = subItems.length > 0;
    const isExpandable = hasSub && (!href || href === "#");
    const isPinnedExpanded = readShowExpandMenu(item);
    const itemId = item.id;
    const isExpanded = expandedIds.has(itemId);
    const active = isPathActive(href);
    const anyChildActive = hasSub && subItems.some((s) => isPathActive(getLinkHref(s)));

    if (isSub) {
      const subHref = getLinkHref(item);
      if (!subHref || subHref === "#") return null;
      const subNavHref = localizeHref(subHref, activeLocale);
      return (
        <Link
          key={item.id}
          href={subNavHref}
          className={cn(
            "flex items-center gap-3 w-full h-[30px] text-[12px] leading-[1.29] font-normal no-underline transition-colors duration-150 ms-5 ps-[25px] border-s border-portal-sub-nav-item text-[var(--color-portal-switch-modal-title)] hover:bg-portal-nav-hover",
            active &&
              "font-medium border-s-portal-nav-active-border bg-portal-nav-hover text-portal-nav-text"
          )}
          onClick={(event) => {
            if (active) return;
            trackNavigationMenuClick({
              item,
              section,
              parentItem,
              destinationUrl: subNavHref,
            });
            if (
              isInternalAppPath(subNavHref) &&
              !isAuxiliaryNavigationClick(event) &&
              !event.defaultPrevented
            ) {
              routeTransition?.beginContentTransition();
            }
          }}
        >
          {item.fields?.Title ? <ContentSdkText field={item.fields.Title} tag="span" /> : title}
        </Link>
      );
    }

    if (isExpandable) {
      return (
        <div key={item.id}>
          <Button
            type="button"
            variant="transparent"
            className={cn(
              "flex items-center justify-start gap-3 w-full py-2.5 px-4 text-[14px] leading-[1.29] font-normal cursor-pointer transition-colors duration-150 text-start border-s-2 border-s-transparent border-0 bg-transparent rounded-none text-[var(--color-portal-switch-modal-title)] hover:!bg-portal-nav-hover active:!bg-portal-nav-hover",
              anyChildActive &&
                "font-medium border-s-portal-nav-active-border bg-portal-nav-hover text-portal-nav-text",
            )}
            onPress={() => {
              trackNavigationMenuClick({
                item,
                section,
                destinationUrl: href || "#",
              });
              if (!isPinnedExpanded) {
                toggleExpanded(itemId);
              }
            }}
            aria-expanded={isExpanded}
          >
            {iconVal?.src && item.fields?.Icon && (
              <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                <ContentSdkImage
                  field={item.fields.Icon as ImageField}
                  width={20}
                  height={20}
                  alt={(iconVal.alt ?? "") as string}
                  className="w-[18px] h-[18px] object-contain"
                />
              </span>
            )}
            {item.fields?.Title ? (
              <ContentSdkText field={item.fields.Title} tag="span" />
            ) : (
              <span>{title}</span>
            )}
          </Button>
          {isExpanded && (
            <div className="flex flex-col gap-0 overflow-hidden py-[6px]">
              {subItems.map((sub) => renderNavItem(sub, section, true, item))}
            </div>
          )}
        </div>
      );
    }

    const itemHref = getLinkHref(item);
    const isClickable = itemHref && itemHref !== "#";
    const navItemHref = isClickable ? localizeHref(itemHref, activeLocale) : "#";
    return (
      <Link
        key={item.id}
        href={navItemHref}
        className={cn(
          "flex items-center gap-3 w-full py-2.5 px-4 text-[14px] leading-[1.29] font-normal no-underline transition-colors duration-150 text-start border-s-2 border-s-transparent text-[var(--color-portal-switch-modal-title)] hover:bg-portal-nav-hover",
          active &&
            "font-medium border-s-portal-nav-active-border bg-portal-nav-hover text-portal-nav-text"
        )}
        aria-current={active ? "page" : undefined}
        onClick={(event) => {
          if (active) return;
          trackNavigationMenuClick({
            item,
            section,
            destinationUrl: navItemHref,
          });
          if (
            isInternalAppPath(navItemHref) &&
            !isAuxiliaryNavigationClick(event) &&
            !event.defaultPrevented
          ) {
            routeTransition?.beginContentTransition();
          }
        }}
      >
        {iconVal?.src && item.fields?.Icon && (
          <span className="shrink-0 w-5 h-5 flex items-center justify-center">
            <ContentSdkImage
              field={item.fields.Icon as ImageField}
              width={20}
              height={20}
              alt={(iconVal.alt ?? "") as string}
              className="w-[18px] h-[18px] object-contain"
            />
          </span>
        )}
        {item.fields?.Title ? (
          <ContentSdkText field={item.fields.Title} tag="span" />
        ) : (
          <span>{title}</span>
        )}
      </Link>
    );
  };

  return (
    <aside
      data-testid={testId}
      className="grid h-full max-h-full min-h-0 w-full overflow-hidden box-border grid-rows-[auto_minmax(0,1fr)_auto] grid-cols-[minmax(0,1fr)] [dir=rtl]:rtl"
      aria-label="Portal navigation"
    >
      <div className="min-h-0 min-w-0">
        {profileLoading ? null : showAccountBlock && currentAccount ? (
          <div className="flex flex-col shrink-0 p-4 border-b border-white/10">
            <div ref={accountSwitcherTriggerRef} className="w-full">
              <Button
                type="button"
                variant="muted"
                className="flex justify-center items-center gap-3 w-full rounded-lg transition-colors duration-150 cursor-pointer border-0 p-3 text-start bg-transparent hover:bg-portal-nav-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/50"
                onPress={handleAccountMenuOpen}
                aria-expanded={switchModalOpen}
                aria-haspopup="dialog"
              >
                <div className="shrink-0 w-[38px] h-[38px] flex items-center justify-center rounded-full bg-portal-nav-hover">
                  {companyIcon?.value?.src ? (
                    <ContentSdkImage
                      field={companyIcon as ImageField}
                      width={24}
                      height={24}
                      alt={(companyIcon.value.alt ?? "Company") as string}
                      loading="lazy"
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <span className="w-6 h-6 object-contain" aria-hidden />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5 justify-center">
                  <span
                    className="min-w-0 text-[12px] leading-[1.25] font-medium text-portal-nav-text line-clamp-2"
                    title={currentAccount.companyName}
                  >
                    {currentAccount.companyName}
                  </span>
                  <span
                    className="text-[12px] leading-[1.33] font-normal text-portal-nav-text-muted line-clamp-2"
                    title={currentAccount.address}
                  >
                    {currentAccount.address}
                  </span>
                </div>
                {displayAccounts.length > 1 && (
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center text-portal-nav-text" aria-hidden>
                    <ChevronDownIcon width={20} height={20} decorative />
                  </span>
                )}
              </Button>
            </div>

            <SwitchCompanyModal
              isOpen={switchModalOpen}
              onClose={() => setSwitchModalOpen(false)}
              accounts={displayAccounts}
              currentAccountId={effectiveAccountId}
              companyIcon={companyIcon as ImageField | undefined}
              anchorRef={accountSwitcherTriggerRef}
              onSelectAccount={handleSelectAccount}
            />
          </div>
        ) : showNoAccountBlock ? (
          <div className="flex flex-col items-center gap-4 p-4 border-b border-white/10 text-center">
            {noCompanyIcon?.value?.src && (
              <div className="flex items-center justify-center w-10 h-10 shrink-0">
                <ContentSdkImage
                  field={noCompanyIcon as ImageField}
                  width={32}
                  height={32}
                  alt={(noCompanyIcon.value.alt ?? "No Support") as string}
                  loading="lazy"
                  className="w-8 h-8 object-contain"
                />
              </div>
            )}
            {fields.NoCompanyTitle && (
              <ContentSdkText
                field={fields.NoCompanyTitle}
                tag="p"
                className="text-[14px] leading-[1.25] font-normal text-portal-nav-text"
              />
            )}
            {noCompanyUrl?.value?.href && noCompanyUrl?.value?.text && (
              <LinkRender
                field={noCompanyUrl as LinkField}
                className="text-[12px] leading-[1.5] font-normal rounded-full px-4 py-2 no-underline border transition-colors duration-150 border-[var(--color-portal-account-current-dot)] text-[var(--color-portal-account-current-dot)] bg-bg-basic"
              >
                {noCompanyUrl.value.text}
              </LinkRender>
            )}
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden overscroll-y-contain px-[14px] py-[19px]">
        {visibleSections.map((section) => {
          const items = section.fields?.SubNavigationItems ?? [];
          return (
            <div key={section.id} className="flex flex-col gap-1 mb-6 last:mb-0">
              {section.fields?.SectionTitle ? (
                <ContentSdkText
                  field={section.fields.SectionTitle}
                  tag="p"
                  className="text-[10px] leading-[1.27] font-semibold uppercase tracking-wide px-4 mb-2 text-start text-portal-nav-section-title"
                />
              ) : (
                <p className="text-[10px] leading-[1.27] font-semibold uppercase tracking-wide px-4 mb-2 text-start text-portal-nav-section-title">
                  {section.displayName ?? section.name}
                </p>
              )}
              {items.map((item) => renderNavItem(item, section))}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="shrink-0 flex flex-col gap-3 p-4 border-t border-white/10">
        <div className="flex items-center justify-between gap-1">
          {copyrightText && (
            <p className="text-[11px] leading-[1.33] font-normal text-portal-footer-text">{copyrightText}</p>
          )}
          {Boolean(websiteUrlField?.value?.href ?? websiteUrlField?.value?.url) && (
            <LinkRender
              field={websiteUrlField as LinkField}
              className="text-[11px] leading-[1.33] no-underline font-normal text-portal-footer-link"
            >
              {websiteUrlField?.value?.text ?? "intralox.com"}
            </LinkRender>
          )}
        </div>
      </footer>
    </aside>
  );
}
