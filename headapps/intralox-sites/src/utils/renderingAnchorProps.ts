/**
 * Lowercased DOM `id` from Sitecore `RenderingIdentifier`, matching Tabs `ComponentId` /
 * `getElementById` behavior. Returns `undefined` when unset so callers can omit `id`.
 */
export function renderingAnchorId(
  renderingIdentifier: string | undefined | null,
): string | undefined {
  if (renderingIdentifier == null || renderingIdentifier === "") {
    return undefined;
  }
  return String(renderingIdentifier).toLowerCase();
}

/**
 * Props fragment: `{ id: "<lowercased>" }` or `{}` when unset (no empty `id=""`).
 */
export function renderingAnchorIdProps(
  renderingIdentifier: string | undefined | null,
): { id: string } | Record<string, never> {
  const id = renderingAnchorId(renderingIdentifier);
  if (id === undefined) {
    return {};
  }
  return { id };
}
