import type { OktaAuth } from "@okta/okta-auth-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { runPostRegisterApi } from "@/lib/apis/register-apis";
import { resolvePostLoginDestination } from "@/lib/auth-utils";
import { setTokensInLocalStorage } from "@/lib/okta-auth-client";
import { completeRegisterActivationSession } from "@/lib/register-activation-session";

vi.mock("@/lib/apis/register-apis", () => ({
  runPostRegisterApi: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth-utils", () => ({
  resolvePostLoginDestination: vi.fn().mockResolvedValue("/"),
}));

vi.mock("@/lib/okta-auth-client", () => ({
  setTokensInLocalStorage: vi.fn(),
}));

function createMockOktaAuth(options: {
  access?: unknown;
  id?: unknown;
  refresh?: unknown;
  getUserEmail?: string | undefined;
}): OktaAuth {
  const { access, id, refresh, getUserEmail } = options;
  const get = vi.fn(async (key: string) => {
    if (key === "accessToken") {
      return access !== undefined
        ? access
        : { accessToken: "access-token-xyz", expiresAt: Date.now() / 1000 + 3600 };
    }
    if (key === "idToken") {
      return id !== undefined
        ? id
        : { idToken: "id-jwt", claims: { email: "from-claims@example.com" } };
    }
    if (key === "refreshToken") {
      return refresh !== undefined ? refresh : "refresh-token-xyz";
    }
    return undefined;
  });

  return {
    tokenManager: { get },
    getUser:
      getUserEmail !== undefined
        ? vi.fn().mockResolvedValue({ email: getUserEmail })
        : vi.fn().mockResolvedValue({ email: "from-user@example.com" }),
    authStateManager: { updateAuthState: vi.fn() },
  } as unknown as OktaAuth;
}

describe("completeRegisterActivationSession", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.mocked(runPostRegisterApi).mockClear();
    vi.mocked(resolvePostLoginDestination).mockClear();
    vi.mocked(setTokensInLocalStorage).mockClear();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: "api-access",
        id_token: "api-id",
        refresh_token: "api-refresh",
      }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it("submits lead registration, resolves destination, POSTs tokens, and stores client tokens", async () => {
    const okta = createMockOktaAuth({});

    await completeRegisterActivationSession(okta);

    expect(runPostRegisterApi).toHaveBeenCalledWith({
      email: "from-claims@example.com",
      authIdentity: "access-token-xyz",
    });
    expect(resolvePostLoginDestination).toHaveBeenCalledWith({
      userEmail: "from-claims@example.com",
      includeStoredReturnUrl: true,
      clearStoredReturnUrl: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/token",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
      })
    );
    const body = JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body);
    expect(body.access_token).toBe("access-token-xyz");
    expect(body.id_token).toBe("id-jwt");
    expect(body.refresh_token).toBe("refresh-token-xyz");
    expect(body.returnUrl).toBe("/");

    expect(setTokensInLocalStorage).toHaveBeenCalledWith("api-access", "api-id", "api-refresh");
  });

  it("uses getUser email when id token has no claims email", async () => {
    const okta = createMockOktaAuth({
      id: { idToken: "id-only", claims: {} },
      getUserEmail: "fallback@example.com",
    });

    await completeRegisterActivationSession(okta);

    expect(runPostRegisterApi).toHaveBeenCalledWith({
      email: "fallback@example.com",
      authIdentity: "access-token-xyz",
    });
  });

  it("falls back setTokensInLocalStorage to widget tokens when API omits access_token in JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    const okta = createMockOktaAuth({});

    await completeRegisterActivationSession(okta);

    expect(setTokensInLocalStorage).toHaveBeenCalledWith(
      "access-token-xyz",
      "id-jwt",
      "refresh-token-xyz"
    );
  });

  it("skips lead API and fetch when access token is missing", async () => {
    const okta = createMockOktaAuth({ access: {} });

    await completeRegisterActivationSession(okta);

    expect(runPostRegisterApi).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(setTokensInLocalStorage).not.toHaveBeenCalled();
  });

  it("does not throw when tokenManager.get rejects", async () => {
    const get = vi.fn().mockRejectedValue(new Error("storage"));
    const okta = {
      tokenManager: { get },
      authStateManager: { updateAuthState: vi.fn() },
    } as unknown as OktaAuth;

    await expect(completeRegisterActivationSession(okta)).resolves.toBeUndefined();
    expect(runPostRegisterApi).not.toHaveBeenCalled();
  });

  it("uses IDX transaction tokens when tokenManager has no access token yet", async () => {
    const get = vi.fn(async (key: string) => {
      if (key === "accessToken") return undefined;
      if (key === "idToken") return undefined;
      if (key === "refreshToken") return undefined;
      return undefined;
    });
    const setTokens = vi.fn().mockResolvedValue(undefined);
    const okta = {
      tokenManager: { get, setTokens },
      getUser: vi.fn().mockResolvedValue({ email: "tx@example.com" }),
      authStateManager: { updateAuthState: vi.fn() },
    } as unknown as OktaAuth;

    const idxTx = {
      status: "SUCCESS",
      tokens: {
        accessToken: {
          accessToken: "from-idx",
          expiresAt: Math.floor(Date.now() / 1000) + 3600,
        },
        idToken: { idToken: "id-jwt", claims: { email: "tx@example.com" } },
      },
    };

    await completeRegisterActivationSession(okta, idxTx);

    expect(setTokens).toHaveBeenCalledWith(idxTx.tokens);
    expect(runPostRegisterApi).toHaveBeenCalledWith({
      email: "tx@example.com",
      authIdentity: "from-idx",
    });
  });
});
