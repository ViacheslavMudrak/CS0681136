"use client";

import { type JSX, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getContentPathFromAppPathname } from "components/local-navigation/localNavigationUtils";
import { ICON_CHEVRON_DOWN_14PX } from "lib/chrome-icons";
import type {
  CountryLanguageDropdownProps,
  LanguageDocumentItem,
} from "./CountryLanguageDropdown.type";
import {
  DROPDOWN_COUNTRY_ARIA_LABEL_FALLBACK,
  DROPDOWN_LANGUAGE_ARIA_LABEL_FALLBACK,
  DROPDOWN_SELECT_PLACEHOLDER,
  isPdfLink,
  isExternalLink,
  resolveCountryCodeFromRouteSync,
  resolveLanguageDocIndexFromRouteSync,
  persistLastPdfOrExternalLanguageNav,
  clearLastPdfOrExternalLanguageNav,
  DROPDOWN_NO_DATA_MESSAGE,
} from "./countryLanguageDropdownUtils";

/** Stable empty list — avoids a new `[]` each render when `routeDocuments` is absent. */
const NO_LANGUAGE_DOCS: LanguageDocumentItem[] = [];

interface CldSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CldNativeSelectProps {
  id: string;
  /** When absent, the visible `<label htmlFor={id}>` supplies the accessible name. */
  ariaLabel?: string;
  wrapperClassName: string;
  value: string;
  options: CldSelectOption[];
  onChange: (nextValue: string) => void;
}

const USER_CLEARED_LANGUAGE_SELECTION = -2;

function CldNativeSelect({
  id,
  ariaLabel,
  wrapperClassName,
  value,
  options,
  onChange,
}: CldNativeSelectProps): JSX.Element {
  return (
    <div className={wrapperClassName}>
      <select
        id={id}
        className="box-border block h-[34px]  py-1.5 pl-1.5 pr-7 text-sm font-normal leading-normal text-ink-primary bg-surface border border-solid border-stroke-default rounded truncate text-left whitespace-nowrap overflow-hidden cursor-default transition-[border-color] duration-150 ease-in-out focus:outline-none focus:border-stroke-input-focus focus-visible:outline-none focus-visible:border-stroke-input-focus [-webkit-tap-highlight-color:transparent]"
        value={value}
        {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((opt) => (
          <option
            key={opt.value || "placeholder"}
            value={opt.value}
            disabled={opt.disabled}
          >
            {opt.label}
          </option>
        ))}
      </select>
      {/* <span
        className="pointer-events-none absolute right-[3px] top-1/2 inline-flex -translate-y-1/2 items-center justify-center leading-none text-ink-primary"
        aria-hidden="true"
      >
        {ICON_CHEVRON_DOWN_14PX}
      </span> */}
    </div>
  );
}

/** Country/language dropdown for policy pages; PDF/external language choice persists via sessionStorage. */
export function CountryLanguageDropdown({
  countryLabel,
  languageLabel,
  countries,
  initialCountryCode = "",
  isEditing = false,
  isPreview = false,
  routeDocuments,
}: CountryLanguageDropdownProps): JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  /** Sitecore links omit the App Router `[site]/[locale]` prefix; align before matching. */
  const pathForMatch = useMemo(
    () => getContentPathFromAppPathname(pathname),
    [pathname],
  );
  const countrySelectId = useId();
  const languageSelectId = useId();

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(-1);

  const hasRouteDocuments = routeDocuments !== undefined;
  const languageDocs = routeDocuments ?? NO_LANGUAGE_DOCS;
  const showLanguageDropdown = hasRouteDocuments && languageDocs.length > 0;

  const suppressNavigation = isEditing || isPreview;
  const showCountryControl =
    !!(countryLabel || isEditing || isPreview) && countries.length > 0;
  const showLanguageControl = showCountryControl && showLanguageDropdown;

  useEffect(() => {
    if (countries.length === 0) return;
    const code = resolveCountryCodeFromRouteSync(
      countries,
      initialCountryCode,
      pathForMatch,
    );
    if (code) {
      setSelectedCountryCode(code);
    }
  }, [initialCountryCode, countries, pathForMatch]);

  const languageDocsSyncKey = languageDocs.map((d) => d.href).join("\u001f");
  const languageDocsRef = useRef(languageDocs);
  languageDocsRef.current = languageDocs;

  useEffect(() => {
    const docs = languageDocsRef.current;
    if (!languageDocsSyncKey) {
      setSelectedDocIndex(-1);
      return;
    }
    setSelectedDocIndex(
      resolveLanguageDocIndexFromRouteSync(pathForMatch, docs),
    );
  }, [pathForMatch, languageDocsSyncKey]);

  function handleCountryChange(code: string): void {
    clearLastPdfOrExternalLanguageNav();
    setSelectedCountryCode(code);
    setSelectedDocIndex(-1);

    if (suppressNavigation) return;

    const country = countries.find((c) => c.code === code);
    const href = country?.documents[0]?.href;
    if (href) {
      router.push(href);
    }
  }

  function handleLanguageChange(idx: number): void {
    setSelectedDocIndex(idx);

    if (suppressNavigation) return;

    const doc = languageDocs[idx];
    if (!doc?.href) return;

    if (isPdfLink(doc.href) || isExternalLink(doc.href)) {
      persistLastPdfOrExternalLanguageNav(pathForMatch, doc.href);
      window.location.href = doc.href;
    } else {
      clearLastPdfOrExternalLanguageNav();
      router.push(doc.href);
    }
  }

  const countryOptions: CldSelectOption[] = useMemo(
    () => [
      { value: "", label: DROPDOWN_SELECT_PLACEHOLDER },
      ...countries.map((c) => ({ value: c.code, label: c.name })),
    ],
    [countries],
  );

  const languageOptions: CldSelectOption[] = useMemo(
    () => [
      { value: "", label: DROPDOWN_SELECT_PLACEHOLDER },
      ...languageDocs.map((doc, i) => ({
        value: String(i),
        label: doc.language,
      })),
    ],
    [languageDocs],
  );

  const routeDerivedCountryCode = useMemo(
    () =>
      resolveCountryCodeFromRouteSync(
        countries,
        initialCountryCode,
        pathForMatch,
      ),
    [countries, initialCountryCode, pathForMatch],
  );

  const countrySelectValue =
    selectedCountryCode !== "" ? selectedCountryCode : routeDerivedCountryCode;
  const selectedCountry = useMemo(
    () => countries.find((country) => country.code === countrySelectValue),
    [countries, countrySelectValue],
  );

  const showNoDataMessage =
    countrySelectValue !== "" &&
    ((hasRouteDocuments && !showLanguageDropdown) ||
      (!hasRouteDocuments &&
        selectedCountry !== undefined &&
        selectedCountry.documents.length === 0));

  const routeDerivedDocIndex = useMemo(
    () => resolveLanguageDocIndexFromRouteSync(pathForMatch, languageDocs),
    [pathForMatch, languageDocs],
  );

  const languageSelectValue =
    selectedDocIndex === USER_CLEARED_LANGUAGE_SELECTION
      ? ""
      : selectedDocIndex >= 0
      ? String(selectedDocIndex)
      : routeDerivedDocIndex >= 0
        ? String(routeDerivedDocIndex)
        : "";

  if (!showCountryControl && !isEditing && !isPreview) {
    return null;
  }

  return (
    <div className="flex flex-col items-start w-max max-w-full">
      {showCountryControl && (
        <div className="box-border max-w-full">
          {countryLabel ? (
            <label
              htmlFor={countrySelectId}
              className="box-border inline-block h-6 mb-[5px] max-w-full p-0 w-full font-sans text-base font-bold leading-6 text-ink-primary border-0 cursor-default [-webkit-tap-highlight-color:transparent]"
            >
              {countryLabel}
            </label>
          ) : isEditing || isPreview ? (
            <span className="is-empty-hint">Country Label</span>
          ) : null}
          <CldNativeSelect
            id={countrySelectId}
            ariaLabel={
              countryLabel ? undefined : DROPDOWN_COUNTRY_ARIA_LABEL_FALLBACK
            }
            wrapperClassName="relative block box-border w-full max-w-full"
            value={countrySelectValue}
            options={countryOptions}
            onChange={handleCountryChange}
          />
          {showNoDataMessage && (
            <p className=" text-base leading-normal text-ink-primary">
              {DROPDOWN_NO_DATA_MESSAGE}
            </p>
          )}
        </div>
      )}

      {showLanguageControl && (
        <div className="box-border max-w-full shrink-0">
          {languageLabel ? (
            <label
              htmlFor={languageSelectId}
              className="box-border mt-4 inline-block h-6 mb-[5px] max-w-full p-0 w-full font-sans text-base font-bold leading-6 text-ink-primary border-0 cursor-default [-webkit-tap-highlight-color:transparent]"
            >
              {languageLabel}
            </label>
          ) : isEditing || isPreview ? (
            <span className="is-empty-hint">Language Label</span>
          ) : null}
          <CldNativeSelect
            id={languageSelectId}
            ariaLabel={
              languageLabel ? undefined : DROPDOWN_LANGUAGE_ARIA_LABEL_FALLBACK
            }
            wrapperClassName="relative block box-border w-full max-w-full shrink-0"
            value={languageSelectValue}
            options={languageOptions}
            onChange={(v) => {
              if (v === "") {
                setSelectedDocIndex(USER_CLEARED_LANGUAGE_SELECTION);
                return;
              }
              handleLanguageChange(Number(v));
            }}
          />
        </div>
      )}
    </div>
  );
}
