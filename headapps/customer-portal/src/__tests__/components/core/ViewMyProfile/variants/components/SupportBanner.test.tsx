import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { MouseEvent } from "react";
import { SupportBanner } from "components/core/ViewMyProfile/variants/components/SupportBanner";
import * as cdpModule from "@/lib/CDPEvents";
import * as gtmModule from "@/lib/gtm";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/Profile-Setting",
}));

vi.mock("@/lib/CDPEvents", () => ({
  sendContactRequestEvent: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/gtm", () => ({
  logGTMContactRequest: vi.fn(),
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field, alt, width, height }: any) =>
    field?.value?.src ? (
      <img
        src={field.value.src}
        alt={alt ?? ""}
        width={width}
        height={height}
        data-testid="banner-icon"
      />
    ) : null,
  Text: ({ field, tag: Tag = "span", className }: any) =>
    field?.value ? (
      <Tag className={className} data-testid="banner-text">
        {field.value}
      </Tag>
    ) : null,
}));

vi.mock("@/components/ui/Link", () => ({
  default: ({
    href,
    children,
    className,
    onClick,
  }: {
    href: string;
    children?: unknown;
    className?: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  }) => (
    <a
      href={href}
      className={className}
      data-testid="ui-link"
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
    >
      {children as string}
    </a>
  ),
}));

describe("SupportBanner", () => {
  beforeEach(() => {
    vi.mocked(cdpModule.sendContactRequestEvent).mockClear();
    vi.mocked(gtmModule.logGTMContactRequest).mockClear();
  });

  it("returns null when there is no text and no link text", () => {
    const { container } = render(
      <SupportBanner bannerText={{ value: "" }} bannerLink={{ value: { href: "/x", text: "" } }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders icon when icon has src", () => {
    render(
      <SupportBanner
        icon={{ value: { src: "/s.png", alt: "Support" } }}
        bannerText={{ value: "Need help?" }}
        bannerLink={{ value: { href: "/support", text: "Contact" } }}
      />
    );

    expect(screen.getByTestId("banner-icon")).toHaveAttribute("src", "/s.png");
    expect(screen.getByText("Need help?")).toBeInTheDocument();
  });

  it("uses mailto href when csrEmail is provided", () => {
    render(
      <SupportBanner
        bannerText={{ value: "Email us" }}
        bannerLink={{ value: { href: "https://ignored", text: "CSR" } }}
        csrEmail="help@example.com"
      />
    );

    const link = screen.getByTestId("ui-link");
    expect(link).toHaveAttribute("href", "mailto:help@example.com");
    expect(link).toHaveTextContent("CSR");
  });

  it("uses banner link href when csrEmail is not set", () => {
    render(
      <SupportBanner
        bannerText={{ value: "Help" }}
        bannerLink={{ value: { href: "/page", text: "Go" } }}
      />
    );

    expect(screen.getByTestId("ui-link")).toHaveAttribute("href", "/page");
  });

  it("sends Contact_Request to GTM and CDP when support link is clicked (web href)", () => {
    render(
      <SupportBanner
        bannerText={{ value: "Help" }}
        bannerLink={{ value: { href: "/support-page", text: "Contact support" } }}
      />
    );

    fireEvent.click(screen.getByTestId("ui-link"));

    expect(gtmModule.logGTMContactRequest).toHaveBeenCalledWith({
      page_path: "/en/Profile-Setting",
      link_text: "Contact support",
      contact_channel: "url",
      support_surface: "view_my_profile_banner",
      link_target: "/support-page",
    });
    expect(cdpModule.sendContactRequestEvent).toHaveBeenCalledWith({
      type: "Contact_Request",
      pagePath: "/en/Profile-Setting",
      linkText: "Contact support",
      contactChannel: "url",
      supportSurface: "view_my_profile_banner",
      linkTarget: "/support-page",
    });
  });

  it("sends Contact_Request with email channel when csr mailto link is clicked", () => {
    render(
      <SupportBanner
        bannerText={{ value: "Email us" }}
        bannerLink={{ value: { href: "https://ignored", text: "CSR" } }}
        csrEmail="help@example.com"
      />
    );

    fireEvent.click(screen.getByTestId("ui-link"));

    expect(gtmModule.logGTMContactRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        contact_channel: "email",
        link_target: "mailto",
        link_text: "CSR",
      })
    );
    expect(cdpModule.sendContactRequestEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "Contact_Request",
        contactChannel: "email",
        linkTarget: "mailto",
      })
    );
  });
});
