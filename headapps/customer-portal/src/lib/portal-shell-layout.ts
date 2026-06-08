import type {
  PortalShellLanguageItem,
  PortalShellProps,
  TopPlaceholderRendering,
} from "@/components/core/PortalShell/PortalShell.type";

function normalizeGuid(value?: string): string {
  return String(value ?? "")
    .replace(/[{}]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Resolves the current language item from PortalShell fields and LanguageSwitcher placeholder
 * to determine layout direction (LTR vs RTL) from languageAlignment.
 */
export function getIsRightAlignedLayout(props: PortalShellProps): boolean {
  const routeLanguage = String(
    props.page?.layout?.sitecore?.route?.itemLanguage ?? ""
  ).toLowerCase();
  const contextLanguage = String(
    (props.page?.layout?.sitecore?.context as { language?: string } | undefined)?.language ?? ""
  ).toLowerCase();
  const activeLanguage = routeLanguage || contextLanguage;
  const languageCode = activeLanguage.split("-")[0];

  const languageItems = props.fields?.data?.item?.children?.results ?? [];
  const topPlaceholders =
    (props.rendering as { placeholders?: { Top?: TopPlaceholderRendering[] } } | undefined)
      ?.placeholders?.Top ?? [];
  const languageSwitcher = topPlaceholders.find((r) => r.componentName === "LanguageSwitcher");
  const switcherSelections = languageSwitcher?.fields?.LanguageSelection ?? [];

  const localeMatchers = [activeLanguage, languageCode].filter(Boolean);
  try {
    const enDisplay = new Intl.DisplayNames(["en"], { type: "language" }).of(languageCode)?.toLowerCase();
    const nativeDisplay = new Intl.DisplayNames([activeLanguage || "en"], { type: "language" })
      .of(languageCode)
      ?.toLowerCase();
    if (enDisplay) localeMatchers.push(enDisplay);
    if (nativeDisplay) localeMatchers.push(nativeDisplay);
  } catch {
    // Continue with code-based matchers only
  }

  const selectedSourceId = switcherSelections.find((s) => {
    const iso = String(s.fields?.LanguageSource?.fields?.Iso?.value ?? "").toLowerCase();
    const regional = String(
      s.fields?.LanguageSource?.fields?.["Regional Iso Code"]?.value ?? ""
    ).toLowerCase();
    return localeMatchers.some((m) => iso === m || regional === m);
  })?.fields?.LanguageSource?.id;

  const selectedBySource = languageItems.find((item) => {
    const itemGuid = normalizeGuid(item.languageSource?.value);
    const selectedGuid = normalizeGuid(selectedSourceId);
    return itemGuid && selectedGuid && itemGuid === selectedGuid;
  });

  const matchesSource = (item: PortalShellLanguageItem): boolean => {
    const iso = String(item?.languageSource?.targetItem?.fields?.Iso?.value ?? "").toLowerCase();
    const regional = String(
      item?.languageSource?.targetItem?.fields?.["Regional Iso Code"]?.value ?? ""
    ).toLowerCase();
    return localeMatchers.some((m) => m && (iso === m || regional === m));
  };

  const currentItem =
    selectedBySource ??
    languageItems.find((item) => {
      if (matchesSource(item)) return true;
      const name = String(item?.name ?? "").toLowerCase();
      const title = String(item?.languageTitle?.value ?? "").toLowerCase();
      return localeMatchers.some((m) => name.includes(m) || title.includes(m));
    });

  const alignment = String(currentItem?.languageAlignment?.value ?? "").toLowerCase();
  return alignment === "right" || alignment === "rtl";
}
