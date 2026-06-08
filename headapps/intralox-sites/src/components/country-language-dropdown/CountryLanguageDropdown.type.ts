export interface LanguageDocumentItem {
  id: string;
  /** Value of the CMS Language dropdown field (e.g. "English", "French"). */
  language: string;
  /** Resolved href from the General Link / documentLink field. */
  href: string;
  /** Link target (_blank, _self, etc.). */
  target?: string;
}

export interface CountryItem {
  id: string;
  name: string;
  /** ISO country code, e.g. "US", "IN". */
  code: string;
  documents: LanguageDocumentItem[];
}

export interface CountryLanguageDropdownProps {
  countryLabel?: string;
  languageLabel?: string;
  countries: CountryItem[];
  /** ISO country code to preselect on mount (from CMS default or server-side geo header). */
  initialCountryCode?: string;
  /** Whether XM Cloud Pages is in editing mode. */
  isEditing?: boolean;
  /** When true (XM Cloud Pages preview), client navigation is suppressed like {@link isEditing}. */
  isPreview?: boolean;
  /**
   * Language documents from the current route item's `Documents` field.
   * When provided (i.e. on a Country Policy Statement page), the language
   * dropdown is populated from these docs and a selection opens the document.
   * When absent (i.e. on the listing page), selecting a country navigates to
   * that country's page and no language dropdown is rendered.
   */
  routeDocuments?: LanguageDocumentItem[];
}
