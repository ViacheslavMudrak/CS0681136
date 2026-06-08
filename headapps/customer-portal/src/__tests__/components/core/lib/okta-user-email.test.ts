import type { OktaAuth } from "@okta/okta-auth-js";
import { describe, expect, it, vi } from "vitest";

import {
  applyIdxTransactionTokens,
  getEmailFromIdTokenClaims,
  getEmailFromIdTokenLike,
  resolveOktaAuthenticatedEmail,
} from "@/lib/okta-user-email";

describe("okta-user-email", () => {
  it("reads email from standard and fallback id token claim keys", () => {
    expect(getEmailFromIdTokenClaims({ email: "user@example.com" })).toBe("user@example.com");
    expect(
      getEmailFromIdTokenClaims({ preferred_username: "alias@example.com" })
    ).toBe("alias@example.com");
    expect(getEmailFromIdTokenClaims({ login: "login@example.com" })).toBe(
      "login@example.com"
    );
  });

  it("resolves email from IDX transaction tokens before auth state", async () => {
    const setTokens = vi.fn().mockResolvedValue(undefined);
    const oktaAuth = {
      tokenManager: {
        get: vi.fn().mockResolvedValue(undefined),
        setTokens,
      },
      authStateManager: {
        getAuthState: () => ({
          idToken: { claims: { email: "stale@example.com" } },
        }),
      },
      getUser: vi.fn(),
    } as unknown as OktaAuth;

    const email = await resolveOktaAuthenticatedEmail(oktaAuth, {
      tokens: {
        idToken: {
          claims: { preferred_username: "idx@example.com" },
        },
      },
    });

    expect(email).toBe("idx@example.com");
  });

  it("applies IDX tokens before resolving getUser email", async () => {
    const setTokens = vi.fn().mockResolvedValue(undefined);
    const getUser = vi.fn().mockResolvedValue({ preferred_username: "user@example.com" });
    const oktaAuth = {
      tokenManager: {
        get: vi.fn().mockResolvedValue(undefined),
        setTokens,
      },
      authStateManager: { getAuthState: () => null },
      getUser,
    } as unknown as OktaAuth;

    const idxTransaction = { tokens: { accessToken: "at" } };

    await applyIdxTransactionTokens(oktaAuth, idxTransaction);

    const email = await resolveOktaAuthenticatedEmail(oktaAuth, idxTransaction);

    expect(setTokens).toHaveBeenCalledWith({ accessToken: "at" });
    expect(getUser).toHaveBeenCalled();
    expect(email).toBe("user@example.com");
  });

  it("reads email from id token-like objects with claims", () => {
    expect(
      getEmailFromIdTokenLike({
        idToken: "jwt",
        claims: { email: "claims@example.com" },
      })
    ).toBe("claims@example.com");
  });
});
