import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ResetPasswordSuccess } from "@/components/core/Auth/components/ResetPasswordSuccess";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  RichText: ({ field }: { field?: { value?: string } }) => (
    <div dangerouslySetInnerHTML={{ __html: field?.value ?? "" }} />
  ),
}));

vi.mock("@/components/shared/success-message/SuccessMessage", () => ({
  default: ({
    message,
    actionButton,
  }: {
    message: string;
    actionButton: React.ReactNode;
  }) => (
    <div>
      <p>{message}</p>
      {actionButton}
    </div>
  ),
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    onPress,
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <button type="button" onClick={onPress}>
      {children}
    </button>
  ),
}));

describe("ResetPasswordSuccess", () => {
  beforeEach(() => {
    mockPush.mockClear();
    localStorage.clear();
  });

  it("clears Okta flow keys and navigates to login", async () => {
    const user = userEvent.setup();
    localStorage.setItem("okta_forgot_password_flow", "1");
    localStorage.setItem("okta_reset_password_success", "1");

    render(<ResetPasswordSuccess />);

    await user.click(screen.getByRole("button", { name: /user_reset_back_to_login_text|sign in now/i }));

    expect(localStorage.getItem("okta_forgot_password_flow")).toBeNull();
    expect(localStorage.getItem("okta_reset_password_success")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
