import { ICheckedFacets } from "../../SearchComponent.type";
import { IValue } from "./PopupFacet.types";

export const normalizeLabel = (label: string): string => {
  return label.trim().toLowerCase();
};

export const syncFacetQueryParam = (
  facetName: string,
  valueTexts: string[],
): void => {
  const currentUrl = new URL(window.location.href);
  const searchParams = currentUrl.searchParams;
  if (valueTexts.length === 0) {
    searchParams.delete(facetName);
  } else {
    searchParams.set(facetName, valueTexts.join(","));
  }
  window.history.pushState({}, "", currentUrl.toString());
};

export const normalizeSearchParamsKey = (raw: string): string => {
  const params = new URLSearchParams(raw);
  return [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
};

export const readBrowserSearchParamsKey = (): string => {
  return normalizeSearchParamsKey(
    new URL(window.location.href).searchParams.toString(),
  );
};

export const desiredFacetLabelsFromParams = (
  facetName: string,
  params: URLSearchParams,
): string[] => {
  const raw = params.get(facetName);
  if (!raw) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];
  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const desiredSingleFacetLabelFromParams = (
  facetName: string,
  params: URLSearchParams,
): string | undefined => {
  const labels = desiredFacetLabelsFromParams(facetName, params);
  return labels[0];
};

export const facetValueIdForLabel = (
  values: IValue[],
  label: string,
): string => {
  const normalized = normalizeLabel(label);
  if (!normalized) return "";
  const byExact = values.find((v) => normalizeLabel(v.text) === normalized);
  if (byExact) return byExact.id;
  return "";
};

export const areSameSelections = (
  current: string[],
  desired: string[],
): boolean => {
  if (current.length !== desired.length) return false;
  const currentSet = new Set(current);
  return desired.every((item) => currentSet.has(item));
};

export const buildSelectedFacetMap = (
  selectedFacets: ICheckedFacets[],
): Map<string, ICheckedFacets[]> => {
  const map = new Map<string, ICheckedFacets[]>();
  for (const item of selectedFacets) {
    const list = map.get(item.facetId);
    if (list) list.push(item);
    else map.set(item.facetId, [item]);
  }
  return map;
};

export const isSingleSelectFacetType = (
  facetType: string | undefined,
): boolean => {
  const normalized = facetType?.trim().toLowerCase();
  return normalized === "text" || normalized === "range";
};
