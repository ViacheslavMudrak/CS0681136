"use client";

import { useEffect, useState, type JSX } from "react";
import Link from "next/link";
import type { ImageField } from "@sitecore-content-sdk/nextjs";
import {
  Link as SitecoreLink,
  NextImage,
  RichText,
  Text,
} from "@sitecore-content-sdk/nextjs";
import { cn } from "lib/utils";

import {
  megaMenuChildRowIsCurrentPage,
  megaMenuSectionOverviewIsCurrentPage,
} from "components/local-navigation/localNavigationUtils";

import type { MainNavItem, NavChildItem } from "../Navigation.type";
import {
  EMPTY_LINK,
  getLinkFieldHref,
  getLinkRel,
  getNavChildItemLabel,
  getNavItemTitle,
  itemHasChildren,
  NAV_BELT_FINDER_IMAGE_HEIGHT_DESKTOP,
  NAV_BELT_FINDER_IMAGE_SIZES,
  NAV_BELT_FINDER_IMAGE_WIDTH,
  NAV_LABELS,
  NAV_SAME_TAB_TARGET,
  resolveChildLinksForHeaderDisplay,
  resolveMegaMenuPromoLink,
} from "../navigationUtils";
import type { HeaderNavLinkResolver } from "../useNavigationLinkForAppRouter";
import { useNavigationLinkForAppRouter } from "../useNavigationLinkForAppRouter";
import { UI_ICONS } from "./NavigationIcons";
import {
  NavOverviewAnchorLink,
  NavOverviewSitecoreLink,
  NavTertiaryAnchorLink,
  NavTertiarySitecoreLink,
  NavTertiaryStaticLabel,
} from "./NavigationDesktopAtoms";

interface HeaderLogoProps {
  logo?: ImageField;
  logoAriaLabel: string;
  isEditing: boolean;
  isHomePage: boolean;
  homeHref: string;
}

/** Header logo link (or editing placeholder). */
export const HeaderLogo = ({
  logo,
  logoAriaLabel,
  isEditing,
  isHomePage,
  homeHref,
}: HeaderLogoProps): JSX.Element => {
  const logoImage =
    logo?.value?.src || isEditing ? (
      <NextImage
        field={logo}
        width={150}
        height={32}
        sizes="150px"
        priority
        className="block w-full h-full object-cover"
      />
    ) : (
      <span className="text-brand-red text-xl font-bold tracking-[0.02em] uppercase">
        {NAV_LABELS.logoFallbackText}
      </span>
    );

  const inner = (
    <div className="flex items-center justify-center w-full h-full">
      {logoImage}
    </div>
  );

  if (!isEditing) {
    return (
      <Link
        href={homeHref}
        className={cn(
          "relative z-30 bg-surface flex items-stretch justify-center shrink-0 self-stretch",
          "no-underline text-inherit cursor-pointer [&_*]:cursor-pointer",
          "focus:outline-none focus:ring-[var(--color-accent-nav)] active:ring-[var(--color-accent-nav)]",
          "focus:ring-offset-1 focus:ring-offset-surface active:ring-offset-1 active:ring-offset-surface",
          isHomePage
            ? "focus:ring-[3px] active:ring-[3px]"
            : "focus:ring-2 active:ring-2",
        )}
        aria-label={logoAriaLabel}
        aria-current={isHomePage ? "page" : undefined}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      className="relative z-30 bg-surface flex items-stretch justify-center shrink-0 self-stretch"
      aria-label={logoAriaLabel}
    >
      {inner}
    </div>
  );
};

interface MegaMenuPanelProps {
  item: MainNavItem;
  isEditing: boolean;
  hasComplexLayout?: boolean;
  /** App Router pathname — used to highlight the active mega-menu row after navigation */
  pathname: string;
  /** `layout.sitecore.context.itemPath` when present — matches CMS paths even if URL differs */
  sitecoreItemPath?: string;
  /** `layout.sitecore.route.itemId` — matches General Link target id when href/path differ */
  routeItemGuid?: string;
}

const COLS_PER_ROW = 3;

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
};

const SecondaryLink = ({
  child,
  isEditing,
  pathname,
  sitecoreItemPath,
  routeItemGuid,
  navLinks,
}: {
  child: NavChildItem;
  isEditing: boolean;
  pathname: string;
  sitecoreItemPath?: string;
  routeItemGuid?: string;
  navLinks: HeaderNavLinkResolver;
}): JSX.Element => {
  const childLink = navLinks.linkFieldForAppRouter(child.fields);
  const childHref = getLinkFieldHref(childLink);
  const text = getNavChildItemLabel(child);
  const isCurrent = megaMenuChildRowIsCurrentPage(
    pathname,
    child,
    sitecoreItemPath,
    routeItemGuid,
  );
  const className = cn(
    "block p-1 rounded bg-transparent font-sans text-sm no-underline! transition-colors duration-150 hover:bg-surface-selected focus-visible:bg-surface-selected focus:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-accent-nav)] focus-visible:ring-offset-0 font-medium leading-tight text-ink-primary font-medium",
    isCurrent && "!bg-surface-selected !text-ink",
  );

  if (childHref) {
    return (
      <SitecoreLink
        field={childLink ?? EMPTY_LINK}
        editable={isEditing}
        target={NAV_SAME_TAB_TARGET}
        rel={getLinkRel(NAV_SAME_TAB_TARGET)}
        className={className}
        aria-current={isCurrent ? "page" : undefined}
      >
        {text}
        <span className="text-chrome-chevron absolute mt-[2px] inline-block ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0">
          {UI_ICONS.chevronRight}
        </span>
      </SitecoreLink>
    );
  }

  if (child.url) {
    return (
      <a
        href={child.url}
        className={className}
        aria-current={isCurrent ? "page" : undefined}
      >
        {text}
        <span className="text-chrome-chevron inline-block absolute mt-[2px] ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0">
          {UI_ICONS.chevronRight}
        </span>
      </a>
    );
  }

  return (
    <span className={className} aria-current={isCurrent ? "page" : undefined}>
      {text}
      <span className="text-chrome-chevron inline-block absolute mt-[2px] ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0">
        {UI_ICONS.chevronRight}
      </span>
    </span>
  );
};

/** Desktop mega-menu panel for a primary nav item (simple list or 3-column grid). */
export const MegaMenuPanel = ({
  item,
  isEditing,
  hasComplexLayout: hasComplexLayoutProp,
  pathname,
  sitecoreItemPath,
  routeItemGuid,
}: MegaMenuPanelProps): JSX.Element | null => {
  const navLinks = useNavigationLinkForAppRouter(isEditing);
  const childLinks = resolveChildLinksForHeaderDisplay(item.fields?.ChildLinks);
  const heading = item.fields?.Heading;
  const description = item.fields?.Description;
  const image = item.fields?.Image;
  const hasImage = !!image?.value?.src;
  const hasFeatured = !!(
    (heading?.value && String(heading.value).trim()) ||
    (description?.value && String(description.value).trim()) ||
    hasImage
  );

  const hasComplexLayout =
    hasComplexLayoutProp ?? childLinks.some((child) => itemHasChildren(child));
  /** True when any secondary has tertiary `ChildLinks` (mobile-style accordion on desktop if we show it). */
  const hasNestedChildLinks = childLinks.some((child) =>
    itemHasChildren(child),
  );
  const simpleMegaFlex = hasFeatured && childLinks.length > 0;
  /** Desktop mega with featured column: flat secondaries only (no nested accordion). */
  const useVerticalNestedLayout =
    !hasComplexLayout && hasNestedChildLinks && !simpleMegaFlex;
  const {
    field: promoLinkField,
    hasHref: promoHasHref,
    resolvedKey: promoLinkResolvedKey,
  } = resolveMegaMenuPromoLink(item);
  const wrapFeaturedPromo = promoHasHref || (isEditing && !!promoLinkField);

  const [promoAccentLocked, setPromoAccentLocked] = useState(false);
  useEffect(() => {
    setPromoAccentLocked(false);
  }, [item.id]);

  if (!childLinks.length && !hasFeatured && !isEditing) return null;

  const filteredChildren = childLinks.filter(
    (child) => child?.fields || child?.displayName || child?.url,
  );
  const overviewIsCurrent = megaMenuSectionOverviewIsCurrentPage(
    pathname,
    item,
    sitecoreItemPath,
    routeItemGuid,
  );

  return (
    <div role="menu">
      <div className="box-border p-4">
        {hasComplexLayout ? (
          <ComplexLayout
            filteredChildren={filteredChildren}
            isEditing={isEditing}
            pathname={pathname}
            sitecoreItemPath={sitecoreItemPath}
            routeItemGuid={routeItemGuid}
            navLinks={navLinks}
          />
        ) : (
          <div className={cn(simpleMegaFlex && "flex gap-4")}>
            {childLinks.length > 0 && (
              <div className={cn(simpleMegaFlex && "flex-1 min-w-0")}>
                {useVerticalNestedLayout ? (
                  <VerticalLayout
                    filteredChildren={filteredChildren}
                    isEditing={isEditing}
                    pathname={pathname}
                    sitecoreItemPath={sitecoreItemPath}
                    routeItemGuid={routeItemGuid}
                    navLinks={navLinks}
                  />
                ) : (
                  <ul className="flex flex-col box-border block m-0! p-0! list-none! w-full min-w-0 [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]">
                    {filteredChildren.map((child) => {
                      const text = getNavChildItemLabel(child);
                      const isCurrent = megaMenuChildRowIsCurrentPage(
                        pathname,
                        child,
                        sitecoreItemPath,
                        routeItemGuid,
                      );
                      const rowLink = navLinks.linkFieldForAppRouter(
                        child.fields,
                      );

                      return (
                        <li key={child.id} className="m-0! p-0! list-none!">
                          <SitecoreLink
                            field={rowLink ?? EMPTY_LINK}
                            editable={isEditing}
                            target={NAV_SAME_TAB_TARGET}
                            rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                            className={cn(
                              "box-border block w-[199px] max-w-full m-0 cursor-pointer rounded bg-transparent p-1 no-underline! font-medium text-sm leading-font-media-tile-eyebrow text-ink-primary [text-decoration-color:var(--color-ink-primary)] transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-surface-selected focus-visible:bg-surface-selected font-nav-belt-finder [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-accent-nav)] focus-visible:ring-offset-0",
                              isCurrent && "!bg-surface-selected !text-ink",
                            )}
                            aria-current={isCurrent ? "page" : undefined}
                          >
                            {text}
                            <span className="text-chrome-chevron inline-block absolute mt-[2px] ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0">
                              {UI_ICONS.chevronRight}
                            </span>
                          </SitecoreLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {(hasFeatured || isEditing) &&
              (wrapFeaturedPromo ? (
                <SitecoreLink
                  field={
                    navLinks.linkForAppRouter(promoLinkField) ?? EMPTY_LINK
                  }
                  editable={isEditing}
                  target={NAV_SAME_TAB_TARGET}
                  rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                  data-cms-promo-link-key={promoLinkResolvedKey}
                  className={cn(
                    "group box-border flex shrink-0 flex-col gap-0 w-[203px] max-w-full rounded p-1 -mt-1 -mr-1 mb-0 ml-0 font-nav-belt-finder leading-6 text-ink-primary [text-decoration-color:var(--color-ink-primary)] transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] [-webkit-tap-highlight-color:transparent] hover:bg-surface-selected",
                    "no-underline! cursor-pointer focus:outline-none focus-visible:bg-surface-selected",
                    promoAccentLocked
                      ? "ring-inset ring-[3px] ring-[var(--color-accent-nav)]"
                      : "focus-visible:ring-inset focus-visible:ring-[3px] focus-visible:ring-[var(--color-accent-nav)]",
                  )}
                  onClick={() => setPromoAccentLocked(true)}
                >
                  {(hasImage || isEditing) && (
                    <NextImage
                      field={image}
                      width={NAV_BELT_FINDER_IMAGE_WIDTH}
                      height={NAV_BELT_FINDER_IMAGE_HEIGHT_DESKTOP}
                      sizes={NAV_BELT_FINDER_IMAGE_SIZES}
                      unoptimized
                      className="w-full max-w-full h-[65px] shrink-0 object-cover block mt-0 mx-0 mb-1 p-0"
                    />
                  )}
                  {(heading?.value || isEditing) && (
                    <span className="flex items-center w-full max-w-full min-w-0 m-0 p-0">
                      <span className="text-sm font-medium leading-[21px] text-link transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] min-w-0 group-hover:text-link-strong">
                        <Text field={heading} />
                      </span>
                      <span className="text-chrome-chevron inline-block ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0">
                        {UI_ICONS.chevronRight}
                      </span>
                    </span>
                  )}
                  {(description?.value || isEditing) && (
                    <RichText
                      field={description}
                      className="box-border block w-full max-w-full min-h-[45px] m-0! p-0! cursor-pointer list-none [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] font-nav-belt-finder text-xs leading-[15px] text-ink-muted [&_a]:text-ink-muted! [&_p]:m-0! [&_p]:p-0! [&_p]:box-border [&_p]:block [&_p]:text-xs! [&_p]:leading-[15px]! [&_p]:font-nav-belt-finder [&_p]:text-ink-muted! [&_li]:list-none"
                    />
                  )}
                </SitecoreLink>
              ) : (
                <div
                  className="group box-border flex shrink-0 flex-col gap-0 w-[203px] max-w-full rounded p-1 -mt-1 -mr-1 mb-0 ml-0 font-nav-belt-finder leading-6 text-ink-primary [text-decoration-color:var(--color-ink-primary)] transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] [-webkit-tap-highlight-color:transparent] hover:bg-surface-selected focus:bg-surface-selected focus:outline-none focus:ring"
                  data-cms-promo-link-key={promoLinkResolvedKey}
                >
                  {(hasImage || isEditing) && (
                    <NextImage
                      field={image}
                      width={NAV_BELT_FINDER_IMAGE_WIDTH}
                      height={NAV_BELT_FINDER_IMAGE_HEIGHT_DESKTOP}
                      sizes={NAV_BELT_FINDER_IMAGE_SIZES}
                      unoptimized
                      className="w-full max-w-full h-[65px] shrink-0 object-cover block mt-0 mx-0 mb-1 p-0"
                    />
                  )}
                  {(heading?.value || isEditing) && (
                    <span className="flex items-center w-full max-w-full min-w-0 m-0 p-0">
                      <span className="text-sm font-medium leading-[21px] text-link transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] min-w-0 group-hover:text-link-strong">
                        <Text field={heading} />
                      </span>
                      <span className="text-chrome-chevron inline-block absolute mt-[2px] ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0">
                        {UI_ICONS.chevronRight}
                      </span>
                    </span>
                  )}
                  {(description?.value || isEditing) && (
                    <RichText
                      field={description}
                      className="box-border block w-full max-w-full min-h-[45px] m-0! p-0! cursor-pointer list-none [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] font-nav-belt-finder text-xs leading-[15px] text-ink-muted [&_a]:text-ink-muted! [&_p]:m-0! [&_p]:p-0! [&_p]:box-border [&_p]:block [&_p]:text-xs! [&_p]:leading-[15px]! [&_p]:font-nav-belt-finder [&_p]:text-ink-muted! [&_li]:list-none"
                    />
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {(getLinkFieldHref(navLinks.linkFieldForAppRouter(item.fields)) ||
        item.url) && (
        <div className="py-2 px-4 bg-surface-subtle border-t border-stroke-default">
          {hasComplexLayout ? (
            <div className="grid w-full min-w-0 grid-cols-3 gap-x-0">
              <div className="min-w-0 -ml-4 pl-4 box-border w-[249.99px] max-w-full">
                {getLinkFieldHref(
                  navLinks.linkFieldForAppRouter(item.fields),
                ) ? (
                  <NavOverviewSitecoreLink
                    field={
                      navLinks.linkFieldForAppRouter(item.fields) ?? EMPTY_LINK
                    }
                    editable={isEditing}
                    target={NAV_SAME_TAB_TARGET}
                    rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                    isCurrent={overviewIsCurrent}
                    width="full"
                    aria-current={overviewIsCurrent ? "page" : undefined}
                  >
                    {getNavItemTitle(item)} {NAV_LABELS.overview}
                    <span className="text-chrome-chevron inline-block absolute mt-[2px] ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0">
                      {UI_ICONS.chevronRight}
                    </span>
                  </NavOverviewSitecoreLink>
                ) : (
                  <NavOverviewAnchorLink
                    href={item.url ?? "#"}
                    isCurrent={overviewIsCurrent}
                    width="full"
                    aria-current={overviewIsCurrent ? "page" : undefined}
                  >
                    {getNavItemTitle(item)} {NAV_LABELS.overview}
                    <span className="text-chrome-chevron inline-block absolute mt-[2px] ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0">
                      {UI_ICONS.chevronRight}
                    </span>
                  </NavOverviewAnchorLink>
                )}
              </div>
            </div>
          ) : getLinkFieldHref(navLinks.linkFieldForAppRouter(item.fields)) ? (
            <div className="min-w-0">
              <NavOverviewSitecoreLink
                field={
                  navLinks.linkFieldForAppRouter(item.fields) ?? EMPTY_LINK
                }
                editable={isEditing}
                target={NAV_SAME_TAB_TARGET}
                rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                isCurrent={overviewIsCurrent}
                width="fixed"
                aria-current={overviewIsCurrent ? "page" : undefined}
              >
                {getNavItemTitle(item)} {NAV_LABELS.overview}
                <span className="text-chrome-chevron inline-block absolute mt-[2px] ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0">
                  {UI_ICONS.chevronRight}
                </span>
              </NavOverviewSitecoreLink>
            </div>
          ) : (
            <div className="min-w-0">
              <NavOverviewAnchorLink
                href={item.url ?? "#"}
                isCurrent={overviewIsCurrent}
                width="fixed"
                aria-current={overviewIsCurrent ? "page" : undefined}
              >
                {getNavItemTitle(item)} {NAV_LABELS.overview}
                <span className="text-chrome-chevron inline-block absolute mt-[2px] ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0">
                  {UI_ICONS.chevronRight}
                </span>
              </NavOverviewAnchorLink>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const VerticalLayout = ({
  filteredChildren,
  isEditing,
  pathname,
  sitecoreItemPath,
  routeItemGuid,
  navLinks,
}: {
  filteredChildren: NavChildItem[];
  isEditing: boolean;
  pathname: string;
  sitecoreItemPath?: string;
  routeItemGuid?: string;
  navLinks: HeaderNavLinkResolver;
}): JSX.Element => (
  <div className="flex flex-col">
    {filteredChildren.map((child, idx) => {
      const tertiaryLinks = resolveChildLinksForHeaderDisplay(
        child.fields?.ChildLinks,
      );
      const prevChild = idx > 0 ? filteredChildren[idx - 1] : null;
      const prevHadTertiary = prevChild
        ? resolveChildLinksForHeaderDisplay(prevChild.fields?.ChildLinks)
            .length > 0
        : false;

      return (
        <div key={child.id}>
          {prevHadTertiary && (
            <div className="border-t border-stroke-default my-3" />
          )}
          <SecondaryLink
            child={child}
            isEditing={isEditing}
            pathname={pathname}
            sitecoreItemPath={sitecoreItemPath}
            routeItemGuid={routeItemGuid}
            navLinks={navLinks}
          />
          {tertiaryLinks.length > 0 && (
            <ul className="mt-1 flex flex-col gap-0.5 m-0! p-0! list-none!">
              {tertiaryLinks
                .filter((t) => t?.fields || t?.displayName)
                .map((tertiary) => {
                  const tertiaryText = getNavChildItemLabel(tertiary);
                  const tertiaryCurrent = megaMenuChildRowIsCurrentPage(
                    pathname,
                    tertiary,
                    sitecoreItemPath,
                    routeItemGuid,
                  );
                  const tertiaryLink = navLinks.linkFieldForAppRouter(
                    tertiary.fields,
                  );

                  return (
                    <li key={tertiary.id} className="m-0! p-0! list-none!">
                      {getLinkFieldHref(tertiaryLink) ? (
                        <NavTertiarySitecoreLink
                          field={tertiaryLink ?? EMPTY_LINK}
                          editable={isEditing}
                          target={NAV_SAME_TAB_TARGET}
                          rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                          isCurrent={tertiaryCurrent}
                          aria-current={tertiaryCurrent ? "page" : undefined}
                        >
                          {tertiaryText}
                        </NavTertiarySitecoreLink>
                      ) : tertiary.url ? (
                        <NavTertiaryAnchorLink
                          href={tertiary.url}
                          isCurrent={tertiaryCurrent}
                          aria-current={tertiaryCurrent ? "page" : undefined}
                        >
                          {tertiaryText}
                        </NavTertiaryAnchorLink>
                      ) : (
                        <NavTertiaryStaticLabel
                          isCurrent={tertiaryCurrent}
                          aria-current={tertiaryCurrent ? "page" : undefined}
                        >
                          {tertiaryText}
                        </NavTertiaryStaticLabel>
                      )}
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      );
    })}
  </div>
);

const ComplexLayout = ({
  filteredChildren,
  isEditing,
  pathname,
  sitecoreItemPath,
  routeItemGuid,
  navLinks,
}: {
  filteredChildren: NavChildItem[];
  isEditing: boolean;
  pathname: string;
  sitecoreItemPath?: string;
  routeItemGuid?: string;
  navLinks: HeaderNavLinkResolver;
}): JSX.Element => {
  const rows = chunkArray(filteredChildren, COLS_PER_ROW);

  return (
    <div className="flex flex-col">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx}>
          {rowIdx > 0 && (
            <div className="border-t border-stroke-default my-5" />
          )}
          <div
            className={cn(
              "grid gap-x-0",
              row.length === 1 && "grid-cols-1",
              row.length === 2 && "grid-cols-2",
              row.length >= 3 && "grid-cols-3",
            )}
          >
            {row.map((child, colIdx) => {
              const tertiaryLinks = resolveChildLinksForHeaderDisplay(
                child.fields?.ChildLinks,
              );

              return (
                <div
                  key={child.id}
                  className={cn(
                    colIdx === 0 ? "-ml-4 pl-4" : "pl-4",
                    "box-border w-[249.99px] max-w-full min-w-0",
                  )}
                >
                  <SecondaryLink
                    child={child}
                    isEditing={isEditing}
                    pathname={pathname}
                    sitecoreItemPath={sitecoreItemPath}
                    routeItemGuid={routeItemGuid}
                    navLinks={navLinks}
                  />
                  {tertiaryLinks.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-0.5 m-0! p-0! list-none!">
                      {tertiaryLinks
                        .filter((t) => t?.fields || t?.displayName)
                        .map((tertiary) => {
                          const tertiaryText = getNavChildItemLabel(tertiary);
                          const tertiaryCurrent = megaMenuChildRowIsCurrentPage(
                            pathname,
                            tertiary,
                            sitecoreItemPath,
                            routeItemGuid,
                          );
                          const tertiaryLink = navLinks.linkFieldForAppRouter(
                            tertiary.fields,
                          );

                          return (
                            <li
                              key={tertiary.id}
                              className="m-0! p-0! list-none!"
                            >
                              {getLinkFieldHref(tertiaryLink) ? (
                                <NavTertiarySitecoreLink
                                  field={tertiaryLink ?? EMPTY_LINK}
                                  editable={isEditing}
                                  target={NAV_SAME_TAB_TARGET}
                                  rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                                  isCurrent={tertiaryCurrent}
                                  aria-current={
                                    tertiaryCurrent ? "page" : undefined
                                  }
                                >
                                  {tertiaryText}
                                </NavTertiarySitecoreLink>
                              ) : tertiary.url ? (
                                <NavTertiaryAnchorLink
                                  href={tertiary.url}
                                  isCurrent={tertiaryCurrent}
                                  aria-current={
                                    tertiaryCurrent ? "page" : undefined
                                  }
                                >
                                  {tertiaryText}
                                </NavTertiaryAnchorLink>
                              ) : (
                                <NavTertiaryStaticLabel
                                  isCurrent={tertiaryCurrent}
                                  aria-current={
                                    tertiaryCurrent ? "page" : undefined
                                  }
                                >
                                  {tertiaryText}
                                </NavTertiaryStaticLabel>
                              )}
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
