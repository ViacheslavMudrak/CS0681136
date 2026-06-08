/**
 * Stable per-line id segment for {@link makeLineItemQueueKey} in `quote-request-utils`.
 * Order Management (orders list) and Order Detail (line rows / “full order” quote) must use the
 * same format so a line opened from the list matches `orderQuote.lineItems[].lineItemKey`.
 */
export function buildQuoteRequestLineId(
  line: { intraloxPartNumber?: string; customerPartNumber?: string },
  lineIndex: number
): string {
  const part = (
    String(line.intraloxPartNumber ?? "").trim() ||
    String(line.customerPartNumber ?? "").trim() ||
    "row"
  ).replace(/\s+/g, "-");
  return `${lineIndex}-${part}`;
}
