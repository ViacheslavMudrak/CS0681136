/**
 * Viewport-safe fixed position for the Order Management date panel (desktop).
 * Aligns to the trigger but clamps horizontally and flips above when needed.
 */
export function computeOrderManagementDatePanelLayout(anchor: DOMRect): {
  top: number;
  left: number;
  width: number;
} {
  const margin = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxPanel = 920;
  const width = Math.min(maxPanel, vw - 2 * margin);

  let left = anchor.right - width;
  left = Math.max(margin, Math.min(left, vw - margin - width));

  const gap = 6;
  let top = anchor.bottom + gap;
  const estimatedHeight = 560;
  if (top + estimatedHeight > vh - margin) {
    top = Math.max(margin, anchor.top - estimatedHeight - gap);
  }

  return { top, left, width };
}
