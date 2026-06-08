import type {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  TextField,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'lib/component-props';

/**
 * Sitecore may return ChildLinks as an array of resolved items OR as a raw
 * pipe-separated GUID string when the layout service doesn't resolve the
 * treelist/multilist field.
 */
export type RawOrResolvedChildren = NavChildItem[] | string;

/** A secondary or tertiary navigation child item. */
export interface NavChildItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    /** Optional label from Sitecore; preferred over Link description when authors need text that tracks the page separately from the stored link text. */
    Title?: TextField;
    Link?: LinkField;
    ChildLinks?: RawOrResolvedChildren;
    ShowChildLinks?: Field<boolean>;
    HasChildLinks?: Field<boolean>;
    /** When `true`, omit from header mega-menu / mobile nav; item stays in tree for local nav strip matching. */
    HideFromNav?: Field<boolean>;
  };
}

/** A primary-level navigation item with optional mega-menu content. */
export interface MainNavItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Link?: LinkField;
    Title?: TextField;
    Heading?: TextField;
    Description?: RichTextField;
    Image?: ImageField;
    /** Mega-menu featured tile CTA (e.g. Belt Finder); wraps image + heading in the desktop panel. */
    PromoLink?: LinkField;
    /** Alternate CMS field name for the same featured-tile link. */
    FeaturedLink?: LinkField;
    /** Other template names supported by `resolveMegaMenuPromoLink` (plus any `*Link` / extra General Link). */
    HeadingLink?: LinkField;
    TileLink?: LinkField;
    PromotionalLink?: LinkField;
    CallToAction?: LinkField;
    CTALink?: LinkField;
    IsVisible?: Field<boolean>;
    /** When `true`, omit from header mega-menu / mobile nav; item stays in tree for local nav strip matching. */
    HideFromNav?: Field<boolean>;
    ChildLinks?: RawOrResolvedChildren;
  };
}

/** A link displayed in the top utility bar. */
export interface TopNavLinkItem {
  id: string;
  displayName?: string;
  fields?: {
    Title?: TextField;
    Link?: LinkField;
    /** Unused in the Next header: utility glyphs are Font Awesome via `CssClass`. */
    Icon?: ImageField;
    /** Font Awesome class string (e.g. `fa-solid fa-phone`). */
    CssClass?: TextField;
    /**
     * Same field name as footer social links — many templates use `IconCssClass` instead of `CssClass`.
     */
    IconCssClass?: TextField;
  };
}

/** A language option for the language switcher. */
export interface LanguageItem {
  id: string;
  /** Sitecore item technical name — often the ISO code (`en`, `en-US`) when `LanguageSource` is not expanded. */
  name?: string;
  displayName?: string;
  fields?: {
    /** Native language name (e.g. `English`). Shown before country when `LanguageCountry` is set. */
    LanguageTitle?: TextField;
    /**
     * Region/country segment shown in parentheses (e.g. `U.S.`) — live site pattern `Language (Country)`.
     * Also accepts `CountryTitle` / `Country` if templates use those names.
     */
    LanguageCountry?: TextField;
    CountryTitle?: TextField;
    Country?: TextField;
    LanguageSource?: {
      id: string;
      name?: string;
      displayName?: string;
      fields?: Record<string, TextField>;
    };
    LanguageAlignment?: TextField;
    /** Optional explicit locale (`en`, `en-US`) when `LanguageSource` is not expanded in layout JSON. */
    LanguageCode?: TextField;
    LocaleCode?: TextField;
  };
}

/** Top bar datasource containing utility links and language options. */
export interface TopBarFields {
  id?: string;
  displayName?: string;
  fields?: {
    TopNavLinks?: TopNavLinkItem[];
    Languages?: LanguageItem[];
    LanguageTitle?: TextField;
    /** Font Awesome class string for the language control (e.g. `fa-solid fa-globe`). */
    LanguageIconCssClass?: TextField;
    /**
     * Footer-parity name when authors reuse the same Top Bar field as social `IconCssClass`.
     */
    IconCssClass?: TextField;
    /** Legacy image icon; header uses `LanguageIconCssClass` + FA fallbacks. */
    LanguageIcon?: ImageField;
  };
}

/** All Sitecore fields for the Navigation rendering. */
export interface NavigationFields {
  TopBar?: TopBarFields;
  ShowTopBar?: Field<boolean>;
  Logo?: ImageField;
  LogoLink?: LinkField;
  MainNavigationLinks?: MainNavItem[];
  SearchBoxPlaceholder?: TextField;
  SearchPage?: LinkField;
  /**
   * @deprecated Use `SearchIconCssClass` with Font Awesome classes (e.g. `fa-solid fa-magnifying-glass`).
   * The header no longer renders this image.
   */
  SearchIcon?: ImageField;
  /** Font Awesome class string for the search affordance (header trigger + inline submit). */
  SearchIconCssClass?: TextField;
  /**
   * Footer-parity: same single-line field as footer social icons (`IconCssClass` on the link item).
   * Used when `SearchIconCssClass` is empty so header and footer can share authoring patterns.
   */
  IconCssClass?: TextField;
  /**
   * @deprecated Inline search close uses hardcoded `fa-solid fa-xmark` in code; field is ignored.
   */
  SearchCloseIconCssClass?: TextField;
}

/** Props for the Navigation component. */
export type NavigationProps = ComponentProps & {
  fields: NavigationFields;
};
