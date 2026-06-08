import { createEmptyQuoteRequestDraft } from "@/lib/quote-request/quote-request-utils";
import type { QuoteRequestDraftDto } from "@/lib/quote-request/request-quote.types";

const STORAGE_KEY = "cp_quote_request_draft_v1";

interface StorageRootV1 {
  v: 1;
  /** Keyed by profile account id string */
  accounts: Record<string, QuoteRequestDraftDto>;
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

function isQuoteRequestDraftDto(x: unknown): x is QuoteRequestDraftDto {
  if (!isPlainObject(x)) return false;
  if (typeof x.accountID !== "number") return false;
  if (typeof x.status !== "string") return false;
  if (typeof x.additionalComments !== "string") return false;
  if (!isPlainObject(x.general) || !Array.isArray(x.general.quoteItems)) return false;
  if (!isPlainObject(x.singleLineItem) || !Array.isArray(x.singleLineItem.quoteItems)) {
    return false;
  }
  if (!isPlainObject(x.orderQuote) || !Array.isArray(x.orderQuote.quoteItems)) {
    return false;
  }
  return true;
}

function parseRoot(raw: string | null): StorageRootV1 | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!isPlainObject(o) || o.v !== 1) return null;
    if (!isPlainObject(o.accounts)) return null;
    return { v: 1, accounts: o.accounts as StorageRootV1["accounts"] };
  } catch {
    return null;
  }
}

function readAll(): StorageRootV1 {
  if (typeof window === "undefined") {
    return { v: 1, accounts: {} };
  }
  return parseRoot(window.localStorage.getItem(STORAGE_KEY)) ?? { v: 1, accounts: {} };
}

function writeAll(root: StorageRootV1): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(root));
  } catch {
    // quota / private mode
  }
}

export function readQuoteRequestDraftForAccount(
  accountId: string
): QuoteRequestDraftDto | null {
  if (!accountId) return null;
  const root = readAll();
  const d = root.accounts[accountId];
  if (!d || !isQuoteRequestDraftDto(d)) return null;
  return d;
}

export function writeQuoteRequestDraftForAccount(
  accountId: string,
  draft: QuoteRequestDraftDto
): void {
  if (!accountId) return;
  const root = readAll();
  const next: QuoteRequestDraftDto = {
    ...draft,
    accountID: Number.isFinite(Number(accountId)) ? Number(accountId) : draft.accountID,
  };
  root.accounts[accountId] = next;
  writeAll(root);
}

export function clearQuoteRequestDraftForAccount(accountId: string): void {
  if (!accountId) return;
  const root = readAll();
  delete root.accounts[accountId];
  writeAll(root);
}

export function getOrCreateLocalDraft(accountId: string, accountIdNumeric: number): QuoteRequestDraftDto {
  const existing = readQuoteRequestDraftForAccount(accountId);
  if (existing) return existing;
  return createEmptyQuoteRequestDraft(accountIdNumeric);
}
