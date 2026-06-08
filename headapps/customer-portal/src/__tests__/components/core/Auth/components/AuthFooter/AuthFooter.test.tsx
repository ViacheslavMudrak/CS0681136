import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { AuthFooterInfo } from "@/components/core/Auth/components/AuthFooter/AuthFooter";
import { logout } from "@/lib/client-auth-sign-out";

vi.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({ oktaAuth: { signOut: vi.fn() } }),
}));

vi.mock("@/lib/client-auth-sign-out", () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  RichText: ({ field }: { field?: { value?: string } }) => <p>{field?.value}</p>,
  Link: ({
    onClick,
    className,
  }: {
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    className?: string;
  }) => (
    <a href="#back" className={className} onClick={onClick}>
      Back to site
    </a>
  ),
}));

vi.mock("@/components/shared/icons/ChevronRightIcon", () => ({
  default: ({ className }: { className?: string }) => (
    <span data-testid="chevron" className={className} />
  ),
}));

describe("AuthFooterInfo", () => {
  const websiteUrl = { value: { href: "https://intralox.com", text: "Intralox" } };
  const copyRight = { value: "© Intralox" };

  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.dir = "ltr";
  });

  afterEach(() => {
    document.documentElement.dir = "ltr";
  });

  it("returns nothing when CopyRightText is missing", () => {
    const { container } = render(
      <AuthFooterInfo WebsiteURL={websiteUrl} CopyRightText={null as never} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("replaces {current_year} in copyright with the current year", () => {
    render(
      <AuthFooterInfo
        WebsiteURL={websiteUrl}
        CopyRightText={{ value: "© {current_year} Intralox" }}
      />
    );

    expect(screen.getByText(`© ${new Date().getFullYear()} Intralox`)).toBeInTheDocument();
  });

  it("renders copyright and invokes logout when website link is clicked", async () => {
    render(<AuthFooterInfo WebsiteURL={websiteUrl} CopyRightText={copyRight} />);

    expect(screen.getByText("© Intralox")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Back to site" }));

    expect(logout).toHaveBeenCalled();
  });

  it("rotates chevron icon when document direction is rtl", () => {
    document.documentElement.dir = "rtl";

    render(<AuthFooterInfo WebsiteURL={websiteUrl} CopyRightText={copyRight} />);

    expect(screen.getByTestId("chevron")).toHaveClass("rotate-180");
  });
});
