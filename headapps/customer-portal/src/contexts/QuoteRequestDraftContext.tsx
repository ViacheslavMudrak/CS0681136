"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";

import {
  fetchQuoteRequestDraft,
  saveQuoteRequestDraft,
} from "@/lib/apis/request-quote-api";
import {
  readQuoteRequestDraftForAccount,
  writeQuoteRequestDraftForAccount,
} from "@/lib/quote-request/quote-request-local-storage";
import {
  QUOTE_REQUEST_SAVE_CONNECTION_MESSAGE,
  QUOTE_REQUEST_SAVE_FALLBACK_MESSAGE,
  resolveQuoteRequestErrorMessage,
} from "@/lib/quote-request/quote-request-errors";
import type { QuoteRequestDraftDto } from "@/lib/quote-request/request-quote.types";
import { createEmptyQuoteRequestDraft } from "@/lib/quote-request/quote-request-utils";
import { useProfileContextOptional } from "@/lib/profile-context";

export type PersistQuoteDraftResult =
  | { ok: true; draft: QuoteRequestDraftDto }
  | { ok: false; errorMessage: string };

export interface QuoteRequestDraftContextValue {
  draft: QuoteRequestDraftDto;
  setDraft: React.Dispatch<SetStateAction<QuoteRequestDraftDto>>;
  persistDraft: (next: QuoteRequestDraftDto) => Promise<PersistQuoteDraftResult>;
  accountId: string;
  accountNumeric: number;
  userEmail: string;
  isClient: boolean;
}

const QuoteRequestDraftContext = createContext<QuoteRequestDraftContextValue | undefined>(
  undefined
);

export function QuoteRequestDraftProvider({
  children,
  userEmail = "",
}: {
  children: ReactNode;
  userEmail?: string;
}): React.ReactElement {
  const profile = useProfileContextOptional();
  const accountIdRaw = profile?.selectedAccount?.id ?? "";
  const accountId = String(accountIdRaw ?? "").trim();
  const accountNumeric = Number.parseInt(accountId, 10) || 0;

  const [isClient, setIsClient] = useState(false);
  const [draft, setDraft] = useState<QuoteRequestDraftDto>(() =>
    createEmptyQuoteRequestDraft(accountNumeric)
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const resolveDraftSaveErrorMessage = useCallback(
    (err?: unknown): string =>
      resolveQuoteRequestErrorMessage(err, {
        connectionMessage: QUOTE_REQUEST_SAVE_CONNECTION_MESSAGE,
        fallbackMessage: QUOTE_REQUEST_SAVE_FALLBACK_MESSAGE,
      }),
    []
  );

  const persistDraft = useCallback(
    async (next: QuoteRequestDraftDto): Promise<PersistQuoteDraftResult> => {
      const withAccount: QuoteRequestDraftDto = {
        ...next,
        accountID: accountNumeric,
        ...(userEmail ? { email: userEmail } : {}),
      };

      if (!accountId) {
        setDraft(withAccount);
        return { ok: true, draft: withAccount };
      }

      if (!userEmail.trim()) {
        return {
          ok: false,
          errorMessage: "Sign in to save your quote request.",
        };
      }

      try {
        const saved = await saveQuoteRequestDraft(accountId, withAccount, userEmail);
        const merged: QuoteRequestDraftDto = { ...saved, accountID: accountNumeric };
        setDraft(merged);
        writeQuoteRequestDraftForAccount(accountId, merged);
        return { ok: true, draft: merged };
      } catch (err) {
        return { ok: false, errorMessage: resolveDraftSaveErrorMessage(err) };
      }
    },
    [accountId, accountNumeric, resolveDraftSaveErrorMessage, userEmail]
  );

  /**
   * One load per account: seed from `localStorage`, then refresh from the API when signed in.
   */
  useEffect(() => {
    if (!isClient || !accountId) {
      setDraft(createEmptyQuoteRequestDraft(accountNumeric));
      return;
    }

    const local = readQuoteRequestDraftForAccount(accountId);
    if (local) {
      setDraft({ ...local, accountID: accountNumeric });
    } else {
      const empty = createEmptyQuoteRequestDraft(accountNumeric);
      setDraft(empty);
      writeQuoteRequestDraftForAccount(accountId, empty);
    }

    void (async () => {
      if (!userEmail) return;
      try {
        const server = await fetchQuoteRequestDraft(accountId, userEmail);
        const merged: QuoteRequestDraftDto = {
          ...server,
          accountID: accountNumeric,
          ...(userEmail ? { email: userEmail } : {}),
        };
        setDraft(merged);
        writeQuoteRequestDraftForAccount(accountId, merged);
      } catch {
        // Keep local / empty draft when the API is unavailable.
      }
    })();
  }, [isClient, accountId, accountNumeric, userEmail]);

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      persistDraft,
      accountId,
      accountNumeric,
      userEmail,
      isClient,
    }),
    [draft, persistDraft, accountId, accountNumeric, userEmail, isClient]
  );

  return (
    <QuoteRequestDraftContext.Provider value={value}>
      {children}
    </QuoteRequestDraftContext.Provider>
  );
}

export function useQuoteRequestDraftContext(): QuoteRequestDraftContextValue {
  const ctx = useContext(QuoteRequestDraftContext);
  if (!ctx) {
    throw new Error("useQuoteRequestDraftContext must be used within QuoteRequestDraftProvider");
  }
  return ctx;
}
