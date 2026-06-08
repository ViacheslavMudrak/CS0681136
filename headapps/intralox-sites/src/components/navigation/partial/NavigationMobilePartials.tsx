"use client";

import { JSX, useEffect, useState } from "react";
import { cn } from "lib/utils";
import {
  Link as SitecoreLink,
  NextImage,
  RichText,
  Text,
} from "@sitecore-content-sdk/nextjs";

import {
  megaMenuChildRowIsCurrentPage,
  megaMenuSectionOverviewIsCurrentPage,
} from "components/local-navigation/localNavigationUtils";

import type {
  MainNavItem,
  NavChildItem,
  TopNavLinkItem,
} from "../Navigation.type";
import {
  EMPTY_LINK,
  getLinkFieldHref,
  getLinkRel,
  getNavChildItemLabel,
  getNavItemTitle,
  MOBILE_SUPPRESS_SECONDARY_TERTIARY_EXPAND_PRIMARIES,
  NAV_BELT_FINDER_IMAGE_HEIGHT_MOBILE,
  NAV_BELT_FINDER_IMAGE_MOBILE_NEXT_HEIGHT,
  NAV_BELT_FINDER_IMAGE_MOBILE_NEXT_WIDTH,
  NAV_BELT_FINDER_IMAGE_SIZES_MOBILE,
  NAV_LABELS,
  NAV_SAME_TAB_TARGET,
  resolveChildLinksForHeaderDisplay,
  resolveMegaMenuPromoLink,
} from "../navigationUtils";
import type { HeaderNavLinkResolver } from "../useNavigationLinkForAppRouter";
import {
  passthroughHeaderNavLinkResolver,
  useNavigationLinkForAppRouter,
} from "../useNavigationLinkForAppRouter";
import { UI_ICONS } from "./NavigationIcons";
import {
  MobileNavExpandButton,
  MobileNavExpandCollapseGrid,
  MobileNavRowAnchorLink,
  MobileNavRowSitecoreLink,
  MobileNavRowStaticLabel,
  MobileOverlayBackdrop,
  MobileOverlayPanel,
  MobileOverlayUnderlay,
} from "./NavigationMobileAtoms";

function mobileNavChildExpandDropdownEnabled(child: NavChildItem): boolean {
  return resolveChildLinksForHeaderDisplay(child.fields?.ChildLinks).some(
    (t) => t?.fields || t?.displayName,
  );
}

interface MobileSecondaryItemProps {
  item: NavChildItem;
  isEditing: boolean;
  onLinkClick: () => void;
  pathname: string;
  sitecoreItemPath?: string;
  routeItemGuid?: string;
  /** Under Products primary: hide tertiary accordion; keep expand for Solutions, Industries, etc. */
  suppressSecondaryTertiaryExpand?: boolean;
  navLinks?: HeaderNavLinkResolver;
}

interface MobileNavItemProps {
  item: MainNavItem;
  isEditing: boolean;
  onLinkClick: () => void;
  pathname: string;
  sitecoreItemPath?: string;
  routeItemGuid?: string;
  navLinks?: HeaderNavLinkResolver;
}

function MobileTertiaryLinksList({
  tertiaryLinks,
  isEditing,
  onLinkClick,
  pathname,
  sitecoreItemPath,
  routeItemGuid,
  /** When set (secondary row with nested tertiaries), first row links to that section’s default URL — same as desktop secondary heading target. */
  sectionOverviewItem,
  navLinks = passthroughHeaderNavLinkResolver,
}: {
  tertiaryLinks: NavChildItem[];
  isEditing: boolean;
  onLinkClick: () => void;
  pathname: string;
  sitecoreItemPath?: string;
  routeItemGuid?: string;
  sectionOverviewItem?: NavChildItem;
  navLinks?: HeaderNavLinkResolver;
}): JSX.Element {
  const overviewLinkField = sectionOverviewItem
    ? navLinks.linkFieldForAppRouter(sectionOverviewItem.fields)
    : undefined;
  const overviewHref = overviewLinkField
    ? getLinkFieldHref(overviewLinkField)
    : "";
  const showSectionOverview =
    !!sectionOverviewItem && !!(overviewHref || sectionOverviewItem.url);
  const sectionOverviewIsCurrent =
    sectionOverviewItem &&
    megaMenuChildRowIsCurrentPage(
      pathname,
      sectionOverviewItem,
      sitecoreItemPath,
      routeItemGuid,
    );

  return (
    <ul className="m-0! p-0! list-none! list-outside" role="list">
      {showSectionOverview && sectionOverviewItem && (
        <li
          key={`${sectionOverviewItem.id}-section-overview`}
          className="m-0! p-0! list-none! border-t border-ink-primary"
          role="listitem"
        >
          {overviewHref ? (
            <MobileNavRowSitecoreLink
              field={overviewLinkField ?? EMPTY_LINK}
              editable={isEditing}
              target={NAV_SAME_TAB_TARGET}
              rel={getLinkRel(NAV_SAME_TAB_TARGET)}
              variant="nestedSectionOverview"
              isCurrent={!!sectionOverviewIsCurrent}
              aria-current={sectionOverviewIsCurrent ? "page" : undefined}
              onClick={onLinkClick}
            >
              {NAV_LABELS.overview}
            </MobileNavRowSitecoreLink>
          ) : (
            <MobileNavRowAnchorLink
              href={sectionOverviewItem.url ?? "#"}
              variant="nestedSectionOverview"
              isCurrent={!!sectionOverviewIsCurrent}
              aria-current={sectionOverviewIsCurrent ? "page" : undefined}
              onClick={onLinkClick}
              aria-label={NAV_LABELS.overview}
            >
              {NAV_LABELS.overview}
            </MobileNavRowAnchorLink>
          )}
        </li>
      )}
      {tertiaryLinks.map((tertiary) => {
        const tertiaryText = getNavChildItemLabel(tertiary);
        const tertiaryLink = navLinks.linkFieldForAppRouter(tertiary.fields);
        const tertiaryHref = getLinkFieldHref(tertiaryLink);
        const isCurrent = megaMenuChildRowIsCurrentPage(
          pathname,
          tertiary,
          sitecoreItemPath,
          routeItemGuid,
        );
        return (
          <li
            key={tertiary.id}
            className="m-0! p-0! list-none! border-t border-ink-primary"
            role="listitem"
          >
            {tertiaryHref ? (
              <MobileNavRowSitecoreLink
                field={tertiaryLink ?? EMPTY_LINK}
                editable={isEditing}
                target={NAV_SAME_TAB_TARGET}
                rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                variant="tertiaryRow"
                isCurrent={isCurrent}
                aria-current={isCurrent ? "page" : undefined}
                onClick={onLinkClick}
              >
                {tertiaryText}
              </MobileNavRowSitecoreLink>
            ) : tertiary.url ? (
              <MobileNavRowAnchorLink
                href={tertiary.url}
                variant="tertiaryRow"
                isCurrent={isCurrent}
                aria-current={isCurrent ? "page" : undefined}
                onClick={onLinkClick}
                aria-label={String(
                  tertiaryText || tertiary.displayName || "Link",
                )}
              >
                {tertiaryText}
              </MobileNavRowAnchorLink>
            ) : (
              <MobileNavRowStaticLabel
                variant="tertiaryRow"
                isCurrent={isCurrent}
                aria-current={isCurrent ? "page" : undefined}
              >
                {tertiaryText}
              </MobileNavRowStaticLabel>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function SecondaryRowOnly({
  item,
  text,
  isEditing,
  onLinkClick,
  pathname,
  sitecoreItemPath,
  routeItemGuid,
  navLinks = passthroughHeaderNavLinkResolver,
}: {
  item: NavChildItem;
  text: string;
  isEditing: boolean;
  onLinkClick: () => void;
  pathname: string;
  sitecoreItemPath?: string;
  routeItemGuid?: string;
  navLinks?: HeaderNavLinkResolver;
}): JSX.Element {
  const secondaryLink = navLinks.linkFieldForAppRouter(item.fields);
  const secondaryHref = getLinkFieldHref(secondaryLink);
  const isCurrent = megaMenuChildRowIsCurrentPage(
    pathname,
    item,
    sitecoreItemPath,
    routeItemGuid,
  );
  return (
    <li className="block m-0! p-0! list-none! border-t border-ink-primary">
      {secondaryHref ? (
        <MobileNavRowSitecoreLink
          field={secondaryLink ?? EMPTY_LINK}
          editable={isEditing}
          target={NAV_SAME_TAB_TARGET}
          rel={getLinkRel(NAV_SAME_TAB_TARGET)}
          variant="secondaryRow"
          isCurrent={isCurrent}
          aria-current={isCurrent ? "page" : undefined}
          onClick={onLinkClick}
        >
          {text}
        </MobileNavRowSitecoreLink>
      ) : item.url ? (
        <MobileNavRowAnchorLink
          href={item.url}
          variant="secondaryRow"
          isCurrent={isCurrent}
          aria-current={isCurrent ? "page" : undefined}
          onClick={onLinkClick}
          aria-label={String(text || item.displayName || "Link")}
        >
          {text}
        </MobileNavRowAnchorLink>
      ) : (
        <MobileNavRowStaticLabel
          variant="secondaryRow"
          isCurrent={isCurrent}
          aria-current={isCurrent ? "page" : undefined}
        >
          {text}
        </MobileNavRowStaticLabel>
      )}
    </li>
  );
}

/** Mobile secondary nav row with optional tertiary expand/collapse. */
export const MobileSecondaryItem = ({
  item,
  isEditing,
  onLinkClick,
  pathname,
  sitecoreItemPath,
  routeItemGuid,
  suppressSecondaryTertiaryExpand = false,
  navLinks = passthroughHeaderNavLinkResolver,
}: MobileSecondaryItemProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = getNavChildItemLabel(item);
  const tertiaryLinks = resolveChildLinksForHeaderDisplay(
    item.fields?.ChildLinks,
  ).filter((t) => t?.fields || t?.displayName);
  const useExpandDropdown =
    !suppressSecondaryTertiaryExpand &&
    mobileNavChildExpandDropdownEnabled(item);
  const toggleExpand = () => setIsExpanded((prev) => !prev);

  if (!useExpandDropdown) {
    return (
      <SecondaryRowOnly
        item={item}
        text={text}
        isEditing={isEditing}
        onLinkClick={onLinkClick}
        pathname={pathname}
        sitecoreItemPath={sitecoreItemPath}
        routeItemGuid={routeItemGuid}
        navLinks={navLinks}
      />
    );
  }

  return (
    <li className="block m-0! p-0! list-none! border-t border-ink-primary">
      <MobileNavExpandButton
        variant="secondaryExpand"
        onClick={toggleExpand}
        isExpanded={isExpanded}
        aria-label={`${NAV_LABELS.expandSection} ${text}`}
      >
        {text}
      </MobileNavExpandButton>

      <MobileNavExpandCollapseGrid isExpanded={isExpanded}>
        <MobileTertiaryLinksList
          tertiaryLinks={tertiaryLinks}
          isEditing={isEditing}
          onLinkClick={onLinkClick}
          pathname={pathname}
          sitecoreItemPath={sitecoreItemPath}
          routeItemGuid={routeItemGuid}
          sectionOverviewItem={item}
          navLinks={navLinks}
        />
      </MobileNavExpandCollapseGrid>
    </li>
  );
};

/** Primary mobile nav item with expandable secondaries and optional featured promo. */
export const MobileNavItem = ({
  item,
  isEditing,
  onLinkClick,
  pathname,
  sitecoreItemPath,
  routeItemGuid,
  navLinks = passthroughHeaderNavLinkResolver,
}: MobileNavItemProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false);
  const childLinks = resolveChildLinksForHeaderDisplay(item.fields?.ChildLinks);
  const hasChildren = childLinks.length > 0;
  const title = getNavItemTitle(item);
  const suppressSecondaryTertiaryExpand =
    MOBILE_SUPPRESS_SECONDARY_TERTIARY_EXPAND_PRIMARIES.has(
      title.trim().toLowerCase(),
    );

  const heading = item.fields?.Heading;
  const description = item.fields?.Description;
  const image = item.fields?.Image;
  const hasImage = !!image?.value?.src;
  const hasFeatured = !!(
    (heading?.value && String(heading.value).trim()) ||
    (description?.value && String(description.value).trim()) ||
    hasImage
  );
  const { field: promoLinkField, hasHref: promoHasHref } =
    resolveMegaMenuPromoLink(item);
  const wrapFeaturedPromo = promoHasHref || (isEditing && !!promoLinkField);

  const [promoAccentLocked, setPromoAccentLocked] = useState(false);
  useEffect(() => {
    if (!isExpanded) setPromoAccentLocked(false);
  }, [isExpanded]);

  const toggleExpand = () => setIsExpanded((prev) => !prev);
  const primaryLinkField = navLinks.linkFieldForAppRouter(item.fields);
  const primaryHref = getLinkFieldHref(primaryLinkField);
  const showSectionOverviewLink = !!(primaryHref || item.url);
  const overviewIsCurrent = megaMenuSectionOverviewIsCurrentPage(
    pathname,
    item,
    sitecoreItemPath,
    routeItemGuid,
  );

  return (
    <li className="block m-0! p-0! list-none! border-t border-ink-primary">
      {hasChildren ? (
        <MobileNavExpandButton
          variant="primaryExpand"
          onClick={toggleExpand}
          isExpanded={isExpanded}
          aria-label={`${NAV_LABELS.expandSection} ${title}`}
        >
          {title}
        </MobileNavExpandButton>
      ) : primaryHref ? (
        <MobileNavRowSitecoreLink
          field={primaryLinkField ?? EMPTY_LINK}
          editable={isEditing}
          target={NAV_SAME_TAB_TARGET}
          rel={getLinkRel(NAV_SAME_TAB_TARGET)}
          variant="primaryLink"
          isCurrent={overviewIsCurrent}
          aria-current={overviewIsCurrent ? "page" : undefined}
          onClick={onLinkClick}
        >
          {title}
        </MobileNavRowSitecoreLink>
      ) : (
        <MobileNavRowStaticLabel
          variant="primaryStatic"
          isCurrent={overviewIsCurrent}
        >
          {item.fields?.Title?.value || isEditing ? (
            <Text field={item.fields?.Title} />
          ) : (
            title
          )}
        </MobileNavRowStaticLabel>
      )}

      {hasChildren && (
        <MobileNavExpandCollapseGrid isExpanded={isExpanded}>
          <div>
            <ul className="m-0! p-0! list-none! list-outside">
              {showSectionOverviewLink && (
                <li className="block m-0! p-0! list-none! border-t border-ink-primary">
                  {primaryHref ? (
                    <MobileNavRowSitecoreLink
                      field={primaryLinkField ?? EMPTY_LINK}
                      editable={isEditing}
                      target={NAV_SAME_TAB_TARGET}
                      rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                      variant="primarySectionOverview"
                      isCurrent={overviewIsCurrent}
                      aria-current={overviewIsCurrent ? "page" : undefined}
                      onClick={onLinkClick}
                    >
                      {NAV_LABELS.overview}
                    </MobileNavRowSitecoreLink>
                  ) : (
                    <MobileNavRowAnchorLink
                      href={item.url ?? "#"}
                      variant="primarySectionOverview"
                      isCurrent={overviewIsCurrent}
                      aria-current={overviewIsCurrent ? "page" : undefined}
                      onClick={onLinkClick}
                      aria-label={NAV_LABELS.overview}
                    >
                      {NAV_LABELS.overview}
                    </MobileNavRowAnchorLink>
                  )}
                </li>
              )}
              {childLinks
                .filter((child) => child?.fields)
                .map((child) => (
                  <MobileSecondaryItem
                    key={child.id}
                    item={child}
                    isEditing={isEditing}
                    onLinkClick={onLinkClick}
                    pathname={pathname}
                    sitecoreItemPath={sitecoreItemPath}
                    routeItemGuid={routeItemGuid}
                    suppressSecondaryTertiaryExpand={
                      suppressSecondaryTertiaryExpand
                    }
                    navLinks={navLinks}
                  />
                ))}
            </ul>

            {(hasFeatured || isEditing) && (
              <li className="border-t border-ink-primary m-0! p-0! list-none!">
                <div className="space-y-3 p-1 my-[1px] mx-0 pb-3">
                  {wrapFeaturedPromo ? (
                    <SitecoreLink
                      field={
                        navLinks.linkForAppRouter(promoLinkField) ?? EMPTY_LINK
                      }
                      editable={isEditing}
                      target={NAV_SAME_TAB_TARGET}
                      rel={getLinkRel(NAV_SAME_TAB_TARGET)}
                      className={cn(
                        "group block rounded no-underline! text-inherit bg-transparent",
                        "hover:bg-black/25 focus:outline-none focus-visible:bg-black/25 transition-colors duration-150",
                        promoAccentLocked
                          ? "ring-inset ring-[3px] ring-[var(--color-accent-nav)]"
                          : "focus-visible:ring-inset focus-visible:ring-[3px] focus-visible:ring-[var(--color-accent-nav)]",
                      )}
                      onClick={() => {
                        setPromoAccentLocked(true);
                        onLinkClick();
                      }}
                    >
                      {(hasImage || isEditing) && (
                        <NextImage
                          field={image}
                          width={NAV_BELT_FINDER_IMAGE_MOBILE_NEXT_WIDTH}
                          height={NAV_BELT_FINDER_IMAGE_MOBILE_NEXT_HEIGHT}
                          sizes={NAV_BELT_FINDER_IMAGE_SIZES_MOBILE}
                          unoptimized
                          className="w-full max-w-none shrink-0 rounded-sm object-cover block mt-0 mx-0 mb-1 p-0"
                          style={{
                            height: `${NAV_BELT_FINDER_IMAGE_HEIGHT_MOBILE}px`,
                          }}
                        />
                      )}
                      {(heading?.value || isEditing) && (
                        <p className="text-ink-inverse! text-sm font-medium px-3 transition-colors duration-150 group-hover:text-chrome-link-hover!">
                          <Text field={heading} />
                          <span className="text-chrome-chevron relative top-[2px] inline-block ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0 text-chrome-chevron! [&_i]:text-chrome-chevron! [&_svg]:text-chrome-chevron! group-hover:text-ink-inverse! [&_i]:group-hover:text-ink-inverse! [&_svg]:group-hover:text-ink-inverse!">
                            {UI_ICONS.chevronRight}
                          </span>
                        </p>
                      )}
                      {(description?.value || isEditing) && (
                        <RichText
                          field={description}
                          className="box-border block w-full max-w-none min-h-[45px] m-0! mt-0! mb-0! mx-0! px-3! py-0! cursor-default list-none [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] font-nav-belt-finder text-xs leading-[15px] text-ink-inverse [&_a]:text-ink-inverse! [&_a]:underline-offset-2 [&_p]:m-0! [&_p]:px-0! [&_p]:py-0! [&_p]:box-border [&_p]:block [&_p]:text-xs! [&_p]:leading-[15px]! [&_p]:font-nav-belt-finder [&_p]:text-ink-inverse! [&_li]:list-none"
                        />
                      )}
                    </SitecoreLink>
                  ) : (
                    <>
                      <div className="group hover:bg-black/25 focus:bg-black/25 block focus:outline-none focus:ring rounded transition-colors duration-150 bg-transparent">
                        {(hasImage || isEditing) && (
                          <NextImage
                            field={image}
                            width={NAV_BELT_FINDER_IMAGE_MOBILE_NEXT_WIDTH}
                            height={NAV_BELT_FINDER_IMAGE_MOBILE_NEXT_HEIGHT}
                            sizes={NAV_BELT_FINDER_IMAGE_SIZES_MOBILE}
                            unoptimized
                            className="w-full max-w-none shrink-0 rounded-sm object-cover block mt-0 mx-0 mb-1 p-0"
                            style={{
                              height: `${NAV_BELT_FINDER_IMAGE_HEIGHT_MOBILE}px`,
                            }}
                          />
                        )}
                        {(heading?.value || isEditing) && (
                          <p className="text-ink-inverse! text-sm font-medium px-3 transition-colors duration-150 group-hover:text-chrome-link-hover!">
                            <Text field={heading} />
                            <span className="text-chrome-chevron relative top-[2px] inline-block ml-0 leading-none [&_i]:block [&_i]:leading-none [&_svg]:block [&_svg]:shrink-0 text-chrome-chevron! [&_i]:text-chrome-chevron! [&_svg]:text-chrome-chevron! group-hover:text-ink-inverse! [&_i]:group-hover:text-ink-inverse! [&_svg]:group-hover:text-ink-inverse!">
                              {UI_ICONS.chevronRight}
                            </span>
                          </p>
                        )}
                      </div>
                      {(description?.value || isEditing) && (
                        <RichText
                          field={description}
                          className="box-border block w-full max-w-none min-h-[45px] m-0! mt-0! mb-0! mx-0! px-3! py-0! cursor-default list-none [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] font-nav-belt-finder text-xs leading-[15px] text-ink-inverse [&_a]:text-ink-inverse! [&_a]:underline-offset-2 [&_p]:m-0! [&_p]:px-0! [&_p]:py-0! [&_p]:box-border [&_p]:block [&_p]:text-xs! [&_p]:leading-[15px]! [&_p]:font-nav-belt-finder [&_p]:text-ink-inverse! [&_li]:list-none"
                        />
                      )}
                    </>
                  )}
                </div>
              </li>
            )}
          </div>
        </MobileNavExpandCollapseGrid>
      )}
    </li>
  );
};

interface MobileOverlayProps {
  isOpen: boolean;
  visibleNavItems?: MainNavItem[];
  topNavLinks: TopNavLinkItem[];
  isEditing: boolean;
  pathname: string;
  sitecoreItemPath?: string;
  routeItemGuid?: string;
  onClose: () => void;
}

/** Slide-in mobile navigation overlay (push-menu pattern). */
export const MobileOverlay = ({
  isOpen,
  visibleNavItems,
  isEditing,
  pathname,
  sitecoreItemPath,
  routeItemGuid,
  onClose,
}: MobileOverlayProps): JSX.Element => {
  const navLinks = useNavigationLinkForAppRouter(isEditing);

  return (
    <>
      <MobileOverlayBackdrop isOpen={isOpen} onClose={onClose} />

      <MobileOverlayUnderlay isOpen={isOpen} />

      <MobileOverlayPanel
        isOpen={isOpen}
        aria-label={NAV_LABELS.navigationMenu}
      >
        <button
          type="button"
          className="absolute top-3 right-4 z-10 flex items-center justify-center w-6 h-6 text-ink-inverse hover:text-chrome-chevron transition-colors focus:outline-none focus:ring-2 focus:ring-ink-inverse/40 cursor-pointer"
          onClick={onClose}
          aria-label={NAV_LABELS.closeMenu}
          tabIndex={isOpen ? 0 : -1}
        >
          {UI_ICONS.close}
        </button>

        <nav aria-label={NAV_LABELS.mobileNavigation}>
          <ul className="m-0! p-0! list-none! list-outside">
            {visibleNavItems
              ?.filter((item) => item?.fields)
              .map((item) => (
                <MobileNavItem
                  key={item.id}
                  item={item}
                  isEditing={isEditing}
                  onLinkClick={onClose}
                  pathname={pathname}
                  sitecoreItemPath={sitecoreItemPath}
                  routeItemGuid={routeItemGuid}
                  navLinks={navLinks}
                />
              ))}
          </ul>
        </nav>
      </MobileOverlayPanel>
    </>
  );
};
