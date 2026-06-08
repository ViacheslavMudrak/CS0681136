import type { LinkField } from "@sitecore-content-sdk/nextjs";

export type LinkChromeButtonTheme = "alert" | "contrast" | "default" | "muted";
export type LinkChromeViewButtonType = "more" | "pill" | "link" | undefined;

export function normalizeLinkRendererTheme(
  colorscheme: string | undefined,
): LinkChromeButtonTheme {
  const lower = (colorscheme ?? "default").toLowerCase();
  if (lower === "alert" || lower === "contrast" || lower === "muted") {
    return lower;
  }
  return "default";
}

export function linkFieldHref(link: LinkField | undefined): string | undefined {
  const href = link?.value?.href;
  if (typeof href !== "string") {
    return undefined;
  }
  const trimmed = href.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function linkFieldRel(target?: string): string | undefined {
  return target === "_blank" ? "noopener noreferrer" : undefined;
}

