import OktaPasswordResetWidget from "@/components/core/Auth/octa-widget/OktaResetPasswordWidget";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock Okta Sign-In Widget
const mockOktaSignIn = vi.fn();
const mockRenderEl = vi.fn();
const mockRemove = vi.fn();
const mockShowForgotPassword = vi.fn();

vi.mock("@okta/okta-signin-widget", () => {
  return {
    default: class MockOktaSignIn {
      constructor(config: any) {
        mockOktaSignIn(config);
        this.config = config;
      }
      renderEl = mockRenderEl;
      remove = mockRemove;
      showForgotPassword = mockShowForgotPassword;
    }
  };
});

// Mock okta-config
vi.mock("lib/okta-config", () => ({
  getOktaConfig: vi.fn(() => ({
    domain: "dev-12345.okta.com",
    clientId: "0oa123456789",
    redirectUri: "http://localhost:3000/api/auth/callback/okta",
    issuer: "https://dev-12345.okta.com/oauth2/default",
    scopes: ["openid", "profile", "email"]
  }))
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

// Mock setTimeout
vi.useFakeTimers();

describe("OktaPasswordResetWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRenderEl.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should render loading state initially", () => {
    render(<OktaPasswordResetWidget />);

    expect(
      screen.getByText("Loading password reset form...")
    ).toBeInTheDocument();
  });

  it("should initialize Okta widget with password reset features enabled", async () => {
    await act(async () => {
      render(<OktaPasswordResetWidget />);
    });

    await waitFor(() => {
      expect(mockOktaSignIn).toHaveBeenCalledWith(
        expect.objectContaining({
          features: expect.objectContaining({
            selfServiceUnlock: true,
            smsRecovery: true,
            callRecovery: true
          })
        })
      );
    });
  });

  it("should call showForgotPassword after widget renders", async () => {
    await act(async () => {
      render(<OktaPasswordResetWidget />);
    });

    await waitFor(() => {
      expect(mockRenderEl).toHaveBeenCalled();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(mockShowForgotPassword).toHaveBeenCalled();
    });
  });

  it("should handle success callback", async () => {
    const onSuccess = vi.fn();
    const mockResponse = { status: "SUCCESS" };

    await act(async () => {
      render(<OktaPasswordResetWidget onSuccess={onSuccess} />);
    });

    await waitFor(() => {
      expect(mockRenderEl).toHaveBeenCalled();
    });

    const successCallback = mockRenderEl.mock.calls[0][1];
    await act(async () => {
      successCallback(mockResponse);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("should handle error callback", async () => {
    const onError = vi.fn();
    const mockError = new Error("Password reset failed");

    await act(async () => {
      render(<OktaPasswordResetWidget onError={onError} />);
    });

    await waitFor(() => {
      expect(mockRenderEl).toHaveBeenCalled();
    });

    const errorCallback = mockRenderEl.mock.calls[0][2];
    await act(async () => {
      errorCallback(mockError);
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  it("should handle error when showForgotPassword fails", async () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    mockShowForgotPassword.mockImplementation(() => {
      throw new Error("showForgotPassword failed");
    });

    await act(async () => {
      render(<OktaPasswordResetWidget />);
    });

    await waitFor(() => {
      expect(mockRenderEl).toHaveBeenCalled();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    consoleWarnSpy.mockRestore();
  });

  it("should cleanup widget on unmount", async () => {
    const { unmount } = render(<OktaPasswordResetWidget />);

    await waitFor(() => {
      expect(mockRenderEl).toHaveBeenCalled();
    });

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it("should handle configuration error", async () => {
    const { getOktaConfig } = await import("lib/okta-config");
    vi.mocked(getOktaConfig).mockImplementationOnce(() => {
      throw new Error("Okta not configured");
    });

    render(<OktaPasswordResetWidget />);

    expect(screen.getByText(/Okta is not configured/i)).toBeInTheDocument();
  });
});
