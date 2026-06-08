import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiRequestError, AUTH_EVENTS, request, requestBlob } from "@/lib/apis/api-service";

const mockBuildLoginUrl = vi.fn((returnUrl: string) => `/login?returnUrl=${encodeURIComponent(returnUrl)}`);
const mockClearTokensFromLocalStorage = vi.fn();
const mockGetAccessTokenFromLocalStorage = vi.fn();
const mockSetTokensInLocalStorage = vi.fn();

vi.mock("@/lib/auth-utils", () => ({
  buildLoginUrl: (returnUrl: string) => mockBuildLoginUrl(returnUrl),
}));

vi.mock("@/lib/okta-auth-client", () => ({
  clearTokensFromLocalStorage: () => mockClearTokensFromLocalStorage(),
  getAccessTokenFromLocalStorage: () => mockGetAccessTokenFromLocalStorage(),
  setTokensInLocalStorage: (accessToken: string, idToken?: string | null, refreshToken?: string | null) =>
    mockSetTokensInLocalStorage(accessToken, idToken, refreshToken),
}));

describe("api-service request auth recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessTokenFromLocalStorage.mockReturnValue("old-access-token");

    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        pathname: "/dashboard",
        search: "?tab=orders",
        assign: vi.fn(),
      },
    });
  });

  it("throws ApiRequestError for forbidden responses without refresh attempt", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: "Forbidden" }),
    } as unknown as Response);

    await expect(request({ method: "GET", path: "/orders" })).rejects.toBeInstanceOf(ApiRequestError);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockSetTokensInLocalStorage).not.toHaveBeenCalled();
  });

  it("refreshes once on 401 and retries original request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "expired" }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: "fresh-at",
          id_token: "fresh-id",
          refresh_token: "fresh-rt",
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as unknown as Response);

    global.fetch = fetchMock as unknown as typeof fetch;

    const data = await request<{ success: boolean }>({ method: "GET", path: "/orders" });

    expect(data.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe("/api/auth/token");
    expect(mockSetTokensInLocalStorage).toHaveBeenCalledWith("fresh-at", "fresh-id", "fresh-rt");
  });

  it("sends auth and custom headers for blob requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => new Blob(["%PDF-"], { type: "application/pdf" }),
    } as unknown as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    const blob = await requestBlob({
      method: "GET",
      path: "/orders/documents/binary",
      params: { path: "orders/file.pdf" },
      options: {
        headers: {
          Accept: "application/pdf",
          requestId: "1",
          language: "1",
        },
      },
    });

    expect(blob.type).toBe("application/pdf");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/dxp/orders/documents/binary?path=orders%2Ffile.pdf",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/pdf",
          Authorization: "Bearer old-access-token",
          requestId: "1",
          language: "1",
        }),
      })
    );
  });

  it("dispatches session-expired event and redirects when refresh fails", async () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "expired" }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "refresh_failed" }),
      } as unknown as Response);

    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(request({ method: "GET", path: "/orders" })).rejects.toBeInstanceOf(ApiRequestError);

    expect(mockClearTokensFromLocalStorage).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: AUTH_EVENTS.SESSION_EXPIRED_TOAST_EVENT })
    );
    expect(mockBuildLoginUrl).toHaveBeenCalledWith("/dashboard?tab=orders");
    expect(window.location.assign).toHaveBeenCalled();
  });
});
