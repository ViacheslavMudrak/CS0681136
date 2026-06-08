import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearQuoteRequestDraftForAccount,
  readQuoteRequestDraftForAccount,
  writeQuoteRequestDraftForAccount,
} from "@/lib/quote-request/quote-request-local-storage";
import { createEmptyQuoteRequestDraft } from "@/lib/quote-request/quote-request-utils";

describe("quote-request-local-storage", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips a draft for an account", () => {
    const d = createEmptyQuoteRequestDraft(99);
    d.general.quoteItems.push({
      application: "x",
      productDetails: "y",
      comments: "z",
      sequence: 1,
    });
    writeQuoteRequestDraftForAccount("acc-1", d);
    const read = readQuoteRequestDraftForAccount("acc-1");
    expect(read).not.toBeNull();
    expect(read?.accountID).toBe(99);
    expect(read?.general.quoteItems).toHaveLength(1);
  });

  it("clear removes account draft", () => {
    const d = createEmptyQuoteRequestDraft(1);
    writeQuoteRequestDraftForAccount("acc-2", d);
    clearQuoteRequestDraftForAccount("acc-2");
    expect(readQuoteRequestDraftForAccount("acc-2")).toBeNull();
  });
});
