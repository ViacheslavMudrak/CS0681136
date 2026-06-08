import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SwitchCompanyModal } from "components/core/PortalShellSideNav/components/SwitchCompanyModal";
import type { PortalShellAccount } from "components/core/PortalShellSideNav/PortalShellSideNav.type";
import { I18N } from "@/lib/dictionary-keys";

const mockT = vi.fn((key: string) => key);

vi.mock("next-intl", () => ({
  useTranslations: () => mockT,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field, alt, width, height, className }: any) =>
    field?.value?.src ? (
      <img
        src={field.value.src}
        alt={(alt ?? field.value.alt ?? "") as string}
        width={width}
        height={height}
        className={className}
        data-testid="company-icon-image"
      />
    ) : null,
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

vi.mock("@/components/ui/Heading", () => ({
  default: ({ children, className }: any) => (
    <h2 className={className} data-testid="ui-heading">
      {children}
    </h2>
  ),
}));

const account = (overrides: Partial<PortalShellAccount> & { id: string }): PortalShellAccount => ({
  id: overrides.id,
  companyName: overrides.companyName ?? "Company",
  address: overrides.address ?? "123 Main St",
  accountNumber: overrides.accountNumber ?? "99",
  isActive: overrides.isActive ?? true,
});

describe("SwitchCompanyModal", () => {
  const onClose = vi.fn();
  const onSelectAccount = vi.fn();

  const defaultAccounts: PortalShellAccount[] = [
    account({ id: "a1", companyName: "Acme Corp", accountNumber: "1001" }),
    account({ id: "a2", companyName: "Beta LLC", accountNumber: "2002" }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockT.mockImplementation((key: string) => {
      if (key === I18N.PortalShellSwitch) return "Switch company";
      if (key === I18N.PortalShellAccount) return "Account";
      return key;
    });
  });

  it("returns null when closed", () => {
    const { container } = render(
      <SwitchCompanyModal
        isOpen={false}
        onClose={onClose}
        accounts={defaultAccounts}
        currentAccountId="a1"
        anchorRef={{ current: document.body }}
        onSelectAccount={onSelectAccount}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders dialog in a portal when open", () => {
    render(
      <SwitchCompanyModal
        isOpen
        onClose={onClose}
        accounts={defaultAccounts}
        currentAccountId="a1"
        anchorRef={{ current: document.body }}
        onSelectAccount={onSelectAccount}
      />
    );

    const dialog = screen.getByRole("dialog", { name: "Switch company" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("calls onClose when backdrop is activated", async () => {
    const user = userEvent.setup();
    render(
      <SwitchCompanyModal
        isOpen
        onClose={onClose}
        accounts={defaultAccounts}
        currentAccountId="a1"
        anchorRef={{ current: document.body }}
        onSelectAccount={onSelectAccount}
      />
    );

    await user.click(screen.getByRole("button", { name: "Close modal" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSelectAccount).not.toHaveBeenCalled();
  });

  it("calls onSelectAccount and onClose when selecting a different account", async () => {
    const user = userEvent.setup();
    render(
      <SwitchCompanyModal
        isOpen
        onClose={onClose}
        accounts={defaultAccounts}
        currentAccountId="a1"
        anchorRef={{ current: document.body }}
        onSelectAccount={onSelectAccount}
      />
    );

    await user.click(screen.getByRole("button", { name: /Beta LLC/i }));

    expect(onSelectAccount).toHaveBeenCalledWith("a2");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onSelectAccount when selecting the current account", async () => {
    const user = userEvent.setup();
    render(
      <SwitchCompanyModal
        isOpen
        onClose={onClose}
        accounts={defaultAccounts}
        currentAccountId="a1"
        anchorRef={{ current: document.body }}
        onSelectAccount={onSelectAccount}
      />
    );

    await user.click(screen.getByRole("button", { name: /Acme Corp/i }));

    expect(onSelectAccount).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders company icon image when companyIcon has src", () => {
    render(
      <SwitchCompanyModal
        isOpen
        onClose={onClose}
        accounts={defaultAccounts}
        currentAccountId="a1"
        companyIcon={{
          value: { src: "/logo.png", alt: "Logo", width: 12, height: 16 },
        }}
        anchorRef={{ current: document.body }}
        onSelectAccount={onSelectAccount}
      />
    );

    expect(screen.getAllByTestId("company-icon-image").length).toBeGreaterThan(0);
  });

  it("uses rtl dir on dialog when document contains dir=rtl", () => {
    const rtlHost = document.createElement("div");
    rtlHost.setAttribute("dir", "rtl");
    document.body.appendChild(rtlHost);

    render(
      <SwitchCompanyModal
        isOpen
        onClose={onClose}
        accounts={defaultAccounts}
        currentAccountId="a1"
        anchorRef={{ current: document.body }}
        onSelectAccount={onSelectAccount}
      />
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("dir", "rtl");

    document.body.removeChild(rtlHost);
  });
});
