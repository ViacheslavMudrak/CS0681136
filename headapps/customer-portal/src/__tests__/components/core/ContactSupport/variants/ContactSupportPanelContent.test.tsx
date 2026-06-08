import type { ComponentProps } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactSupportPanelContent } from "components/core/ContactSupport/variants/ContactSupportPanelContent";
import type { IContactSupportFields } from "components/core/ContactSupport/ContactSupport.type";
import type { AccountContactDisplay } from "@/lib/contact-support-utils";

vi.mock("@sitecore-content-sdk/nextjs", async () => {
  const React = await import("react");
  return {
  SitecoreProviderReactContext: React.createContext<{ page?: unknown } | null>(null),
  NextImage: ({ field, alt, width, height, className }: any) =>
    field?.value?.src ? (
      <img
        src={field.value.src}
        alt={(alt ?? field.value.alt ?? "") as string}
        width={width}
        height={height}
        className={className}
        data-testid="content-sdk-image"
      />
    ) : null,
  Text: ({ field, tag: Tag = "span", className }: any) =>
    field?.value ? (
      <Tag className={className} data-testid="content-sdk-text">
        {field.value}
      </Tag>
    ) : null,
  Link: ({ field, className, children }: any) => {
    const href = field?.value?.href ?? field?.value?.url ?? "#";
    return (
      <a href={href} className={className} data-testid="content-sdk-link">
        {children ?? field?.value?.text}
      </a>
    );
  },
};
});

vi.mock("@/components/shared/icons", () => ({
  CloseIcon: ({ width, height }: { width?: number; height?: number }) => (
    <span data-testid="close-icon" data-w={width} data-h={height} aria-hidden />
  ),
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({ children, onPress, className, "aria-label": ariaLabel, type, ...rest }: any) => (
    <button
      type={type ?? "button"}
      onClick={onPress}
      className={className}
      aria-label={ariaLabel}
      data-testid="ui-button"
      {...rest}
    >
      {children}
    </button>
  ),
}));

const baseFields = (): IContactSupportFields => ({
  PopupTitle: { value: "Your Account Contacts" },
  /** Shown in header when there are no account contacts (matches panel branch in component). */
  NoContactPanelTitle: { value: "Your Account Contacts" },
  Title: { value: "Contact" },
  Icon: { value: { src: "/icon.png", alt: "Contact", width: 16, height: 16 } },
  SupportLink: {
    value: {
      href: "tel:+18005551234",
      text: "+1 800 555 1234",
      url: "tel:+18005551234",
    },
  },
  SupportIcon: {
    value: { src: "/phone.png", alt: "Support phone", width: 40, height: 40 },
  },
  SupportTitle: { value: "Call us for general support" },
});

const contact = (overrides?: Partial<AccountContactDisplay>): AccountContactDisplay => ({
  id: "c1",
  fullName: "Jane Doe",
  initials: "JD",
  jobTitle: "Account Manager",
  email: "jane@example.com",
  phone: "+1 555 000 1111",
  ...overrides,
});

describe("ContactSupportPanelContent", () => {
  const onClose = vi.fn();
  const onEmailClick = vi.fn();
  const onPhoneClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderPanel(
    props: Partial<ComponentProps<typeof ContactSupportPanelContent>> = {}
  ) {
    return render(
      <ContactSupportPanelContent
        isMobile={false}
        isTablet={false}
        fields={baseFields()}
        accountContacts={[]}
        supportLinkHref=""
        supportLinkText=""
        copiedPhone={null}
        onClose={onClose}
        onEmailClick={onEmailClick}
        onPhoneClick={onPhoneClick}
        {...props}
      />
    );
  }

  it("shows close control and PopupTitle on mobile", () => {
    renderPanel({ isMobile: true });

    expect(screen.getByText("Your Account Contacts")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("does not show close button on desktop", () => {
    renderPanel({ isMobile: false });

    expect(screen.getByText("Your Account Contacts")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("calls onClose when mobile close is clicked", async () => {
    const user = userEvent.setup();
    renderPanel({ isMobile: true });

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders account contacts and triggers email / phone handlers", async () => {
    const user = userEvent.setup();
    renderPanel({
      accountContacts: [contact()],
    });

    await user.click(screen.getByRole("button", { name: "Email Jane Doe" }));
    expect(onEmailClick).toHaveBeenCalledWith("jane@example.com");

    await user.click(screen.getByRole("button", { name: "Call Jane Doe" }));
    expect(onPhoneClick).toHaveBeenCalledWith("+1 555 000 1111");
  });

  it("shows Copied toast for contact phone on desktop when copiedPhone matches", () => {
    renderPanel({
      accountContacts: [contact()],
      copiedPhone: "+1 555 000 1111",
    });

    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("does not show contact-phone Copied toast on mobile", () => {
    renderPanel({
      isMobile: true,
      accountContacts: [contact()],
      copiedPhone: "+1 555 000 1111",
    });

    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
  });

  it("uses tel anchor with supportLinkText on mobile", () => {
    renderPanel({
      isMobile: true,
      supportLinkText: "+1 800 555 9999",
      supportLinkHref: "",
    });

    const link = screen.getByRole("link", { name: "+1 800 555 9999" });
    expect(link).toHaveAttribute("href", "tel:+18005559999");
  });

  it("uses tel anchor with supportLinkText on tablet (same as mobile)", () => {
    renderPanel({
      isMobile: false,
      isTablet: true,
      supportLinkText: "+1 800 555 7777",
      supportLinkHref: "",
    });

    const link = screen.getByRole("link", { name: "+1 800 555 7777" });
    expect(link).toHaveAttribute("href", "tel:+18005557777");
  });

  it("uses supportLinkHref when it is already a tel: URL on mobile", () => {
    renderPanel({
      isMobile: true,
      supportLinkText: "ignored",
      supportLinkHref: "tel:+19998887777",
    });

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "tel:+19998887777");
  });

  it("renders support phone as button on desktop and shows copied state", async () => {
    const user = userEvent.setup();
    const { rerender } = renderPanel({
      supportLinkText: "+1 800 555 8888",
    });

    const phoneBtn = screen.getByRole("button", { name: "+1 800 555 8888" });
    await user.click(phoneBtn);
    expect(onPhoneClick).toHaveBeenCalledWith("+1 800 555 8888");

    rerender(
      <ContactSupportPanelContent
        isMobile={false}
        isTablet={false}
        fields={baseFields()}
        accountContacts={[]}
        supportLinkHref=""
        supportLinkText="+1 800 555 8888"
        copiedPhone="+1 800 555 8888"
        onClose={onClose}
        onEmailClick={onEmailClick}
        onPhoneClick={onPhoneClick}
      />
    );

    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("renders ContentSdk Link when supportLinkText is empty", () => {
    renderPanel({
      supportLinkText: "",
      supportLinkHref: "",
    });

    const link = screen.getByTestId("content-sdk-link");
    expect(link).toHaveAttribute("href", "tel:+18005551234");
  });

  it("renders support icon and title when fields are set", () => {
    renderPanel();

    const icon = screen.getByRole("img", { name: "Support phone" });
    expect(icon).toHaveAttribute("src", expect.stringContaining("phone.png"));
    expect(screen.getByText("Call us for general support")).toBeInTheDocument();
  });
});
