"use client";

import { JSX, useRef, useEffect, useCallback, Fragment } from "react";

import { Text, type TextField } from "@sitecore-content-sdk/nextjs";

import { NAV_LABELS } from "../navigationUtils";
import { FaIconFromCms, UI_ICONS } from "./NavigationIcons";

interface DesktopSearchProps {
  /** Sitecore single-line text for placeholder / aria labels; rendered with `<Text>` when editing. */
  searchBoxPlaceholderField?: TextField;
  /** Font Awesome classes from Sitecore `SearchIconCssClass` (e.g. `fa-solid fa-magnifying-glass`). */
  searchIconCssClass?: string;
  searchLabel: string;
  isEditing: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  onToggleSearch: () => void;
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: () => void;
}

/** Desktop search trigger and expandable inline search field. */
export const DesktopSearch = ({
  searchBoxPlaceholderField,
  searchIconCssClass,
  searchLabel,
  isEditing,
  isSearchOpen,
  searchQuery,
  onToggleSearch,
  onSearchQueryChange,
  onSearchSubmit,
}: DesktopSearchProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSearchSubmit();
      }
      if (e.key === "Escape") {
        onToggleSearch();
      }
    },
    [onSearchSubmit, onToggleSearch],
  );

  const searchIconEl = <FaIconFromCms cssClass={searchIconCssClass} />;
  const closeIconEl = UI_ICONS.searchClose;

  const editingPlaceholderChrome =
    isEditing &&
    (searchBoxPlaceholderField ? (
      <span className="sr-only">
        <Text field={searchBoxPlaceholderField} />
      </span>
    ) : (
      <span className="is-empty-hint sr-only">{NAV_LABELS.searchFallback}</span>
    ));

  if (isSearchOpen) {
    return (
      <Fragment>
        {editingPlaceholderChrome}
        <div className="pointer-events-none hidden desktop:flex absolute inset-y-0 left-0 right-0 z-20 items-center justify-center px-6">
          <div
            className="pointer-events-auto relative flex w-full items-center box-border rounded transition-[border-width,border-color] duration-150 motion-reduce:transition-none max-w-[672px]"
            role="search"
          >
            <input
              ref={inputRef}
              type="text"
              className="flex-1 h-[41.6px] w-full min-w-0 min-h-0 p-2 pr-10 border border-stroke-default focus:outline-none focus:ring text-base font-normal bg-surface-muted-light border leading-6 text-ink-primary rounded  cursor-text"
              placeholder={searchLabel}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={searchLabel}
            />
            <div className="flex absolute right-0 top-1/2 -translate-y-1/2 shrink-0 items-center gap-0 pr-2 pl-0 box-border">
              <div className="flex shrink-0 items-center justify-center pr-4 box-border">
                <button
                  type="button"
                  className="inline-flex items-center justify-center shrink-0 rounded-full p-0 text-chrome-chevron cursor-default focus:outline-none focus:ring [&_i]:text-font-large [&_i]:leading-none [&_i]:block [&_svg]:size-[22px] [&_svg]:shrink-0 [&_svg]:block"
                  onClick={onSearchSubmit}
                  aria-label={searchLabel}
                >
                  {searchIconEl}
                </button>
              </div>
              <div
                className="flex shrink-0 flex-col items-center justify-center px-0"
                aria-hidden="true"
              >
                <span className="h-5 w-px shrink-0 bg-stroke-default" />
              </div>
              <div className="flex shrink-0 items-center justify-center pl-4 box-border">
                <button
                  type="button"
                  className="inline-flex rounded-full items-center justify-center shrink-0 p-0 text-chrome-chevron cursor-default focus:outline-none focus:ring [&_i]:text-font-large [&_i]:leading-none [&_i]:block [&_svg]:size-[22px] [&_svg]:shrink-0 [&_svg]:block"
                  onClick={onToggleSearch}
                  aria-label={NAV_LABELS.closeSearch}
                >
                  {closeIconEl}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      {editingPlaceholderChrome}
      <div className="hidden desktop:flex items-center ml-auto pr-6">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-chrome-chevron cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-stroke-focus-search)] [&_i]:text-xl [&_i]:leading-none [&_svg]:size-[1.25rem] [&_svg]:shrink-0"
          aria-label={searchLabel}
          aria-expanded={isSearchOpen}
          onClick={onToggleSearch}
        >
          {searchIconEl}
          <span className="text-ink-primary text-base font-bold uppercase tracking-wide">
            {NAV_LABELS.search}
          </span>
        </button>
      </div>
    </Fragment>
  );
};

interface MobileControlsProps {
  searchBoxPlaceholderField?: TextField;
  searchIconCssClass?: string;
  searchLabel: string;
  isMobileMenuOpen: boolean;
  isMobileSearchOpen: boolean;
  searchQuery: string;
  isEditing: boolean;
  onToggleMobileMenu: () => void;
  onToggleMobileSearch: () => void;
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: () => void;
}

/** Mobile/tablet search field and hamburger menu toggle. */
export const MobileControls = ({
  searchBoxPlaceholderField,
  searchIconCssClass,
  searchLabel,
  isMobileMenuOpen,
  isMobileSearchOpen,
  searchQuery,
  isEditing,
  onToggleMobileMenu,
  onToggleMobileSearch,
  onSearchQueryChange,
  onSearchSubmit,
}: MobileControlsProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMobileSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSearchSubmit();
      }
      if (e.key === "Escape") {
        onToggleMobileSearch();
      }
    },
    [onSearchSubmit, onToggleMobileSearch],
  );

  const searchIconEl = <FaIconFromCms cssClass={searchIconCssClass} />;
  const closeIconEl = UI_ICONS.searchClose;

  const editingPlaceholderChrome =
    isEditing &&
    (searchBoxPlaceholderField ? (
      <span className="sr-only">
        <Text field={searchBoxPlaceholderField} />
      </span>
    ) : (
      <span className="is-empty-hint sr-only">{NAV_LABELS.searchFallback}</span>
    ));

  if (isMobileSearchOpen) {
    return (
      <Fragment>
        {editingPlaceholderChrome}
        <div className="flex flex-1 min-w-0 min-h-0 items-center self-stretch box-border z-20 desktop:hidden layout-mobile:ps-2 layout-mobile:pr-[max(1rem,env(safe-area-inset-right))] tablet-only:justify-center tablet-only:ps-2 tablet-only:pr-[max(1rem,env(safe-area-inset-right))] tablet-only:[unicode-bidi:isolate] leading-6 text-ink-primary">
          <div
            className="pointer-events-auto relative flex w-full items-center box-border rounded h-[42px] min-h-[42px] max-h-[42px] pl-2 overflow-x-clip overflow-y-clip bg-surface-muted-light border border-solid border-stroke-default transition-[border-width,border-color] duration-150 motion-reduce:transition-none [&:has(input:focus)]:border-[3px] [&:has(input:focus)]:border-[var(--color-stroke-focus-search)] motion-reduce:[&:has(input:focus)]:border-stroke-default layout-mobile:min-w-0 layout-mobile:w-full tablet-only:w-full max-w-[672px]"
            role="search"
          >
            <input
              ref={inputRef}
              type="text"
              className="box-border w-full min-w-0 min-h-0 border-none outline-none bg-transparent text-base font-normal leading-6 text-ink-primary pl-0 pr-[96px] h-full placeholder:text-ink-secondary placeholder:opacity-100 cursor-text"
              placeholder={searchLabel}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={searchLabel}
            />
            <div className="absolute inset-y-0 right-0 flex h-[42px] shrink-0 items-center gap-0 pr-2 pl-0 box-border">
              <div className="flex h-[42px] shrink-0 items-center justify-center pr-3 box-border">
                <button
                  type="button"
                  className="inline-flex items-center justify-center shrink-0 size-8 rounded-full p-0 text-chrome-chevron cursor-default focus:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-[var(--color-stroke-focus-search)] [&_i]:text-font-large [&_i]:leading-none [&_i]:block [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:block"
                  onClick={onSearchSubmit}
                  aria-label={searchLabel}
                >
                  {searchIconEl}
                </button>
              </div>
              <div
                className="flex h-8 shrink-0 flex-col items-center justify-center px-0"
                aria-hidden="true"
              >
                <span className="h-5 w-px shrink-0 bg-stroke-default" />
              </div>
              <div className="flex h-[42px] shrink-0 items-center justify-center pl-2.5 box-border">
                <button
                  type="button"
                  className="inline-flex items-center justify-center shrink-0 size-8 rounded-full p-0 text-chrome-chevron cursor-default focus:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-[var(--color-stroke-focus-search)] [&_i]:text-font-large [&_i]:leading-none [&_i]:block [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:block"
                  onClick={onToggleMobileSearch}
                  aria-label={NAV_LABELS.closeSearch}
                >
                  {closeIconEl}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      {editingPlaceholderChrome}
      <div className="flex items-center gap-3 ml-auto px-4 desktop:hidden">
        <button
          type="button"
          className="flex items-center justify-center text-chrome-chevron w-12 h-full shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-stroke-focus-search)] [&_i]:text-lg [&_i]:leading-none [&_svg]:size-[1.125rem] [&_svg]:shrink-0"
          aria-label={searchLabel}
          onClick={onToggleMobileSearch}
        >
          {searchIconEl}
        </button>

        <button
          type="button"
          className="flex [&_svg]:w-[22px] [&_svg]:h-[22px] items-center justify-center text-ink-primary w-10 h-10 border border-stroke-default rounded-sm transition-colors motion-reduce:transition-none hover:text-brand-red focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-stroke-focus-search)] cursor-pointer"
          aria-label={
            isMobileMenuOpen ? NAV_LABELS.closeMenu : NAV_LABELS.openMenu
          }
          aria-expanded={isMobileMenuOpen}
          onClick={onToggleMobileMenu}
        >
          {UI_ICONS.hamburger}
        </button>
      </div>
    </Fragment>
  );
};
