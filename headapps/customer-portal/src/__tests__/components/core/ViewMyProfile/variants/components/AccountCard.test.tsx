import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountCard } from "components/core/ViewMyProfile/variants/components/AccountCard";
import type { ICompanyAccount } from "components/core/ViewMyProfile/ViewMyProfile.type";
import { I18N } from "@/lib/dictionary-keys";

const mockT = vi.fn((key: string) => {
  if (key === I18N.CurrentLocation) return "Current location";
  if (key === I18N.SwitchLocation) return "Switch location";
  if (key === I18N.AccountIdLabel) return "Account #";
  return key;
});

vi.mock("next-intl", () => ({
  useTranslations: () => mockT,
}));

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
  usePathname: () => "/",
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field, alt, width, height, className }: any) =>
    field?.value?.src ? (
      <img
        src={field.value.src}
        alt={alt ?? ""}
        width={width}
        height={height}
        className={className}
        data-testid="location-icon-img"
      />
    ) : null,
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({ children, onClick, className }: any) => (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

const baseAccount = (overrides?: Partial<ICompanyAccount>): ICompanyAccount => ({
  id: "acc-1",
  companyName: "Acme",
  address: "123 St",
  accountNumber: "99",
  isActive: true,
  role: "",
  organization: "",
  ...overrides,
});

describe("AccountCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows current location badge when active", () => {
    render(
      <AccountCard
        account={baseAccount({ isActive: true })}
        locationIconActive={{ value: { src: "/on.png", alt: "On" } }}
        locationIconInactive={{ value: { src: "/off.png", alt: "Off" } }}
      />
    );

    expect(screen.getByText("Current location")).toBeInTheDocument();
    expect(screen.getByTestId("location-icon-img")).toHaveAttribute("src", "/on.png");
    expect(screen.queryByRole("button", { name: /switch location/i })).not.toBeInTheDocument();
  });

  it("shows switch button and calls onSwitchLocation when inactive", async () => {
    const user = userEvent.setup();
    const onSwitchLocation = vi.fn();
    render(
      <AccountCard
        account={baseAccount({ isActive: false })}
        locationIconActive={{ value: { src: "/on.png", alt: "On" } }}
        locationIconInactive={{ value: { src: "/off.png", alt: "Off" } }}
        onSwitchLocation={onSwitchLocation}
      />
    );

    expect(screen.getByTestId("location-icon-img")).toHaveAttribute("src", "/off.png");
    await user.click(screen.getByRole("button", { name: /switch location/i }));
    expect(onSwitchLocation).toHaveBeenCalledWith("acc-1");
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("calls onSwitchLocation when clicking inactive card body", async () => {
    const user = userEvent.setup();
    const onSwitchLocation = vi.fn();
    render(
      <AccountCard
        account={baseAccount({ isActive: false })}
        locationIconInactive={{ value: { src: "/off.png", alt: "Off" } }}
        onSwitchLocation={onSwitchLocation}
      />
    );

    await user.click(screen.getByTestId("view-my-profile-account-card"));
    expect(onSwitchLocation).toHaveBeenCalledWith("acc-1");
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("calls router.refresh when inactive and onSwitchLocation is omitted", async () => {
    const user = userEvent.setup();
    render(
      <AccountCard
        account={baseAccount({ isActive: false })}
        locationIconInactive={{ value: { src: "/off.png", alt: "Off" } }}
      />
    );

    await user.click(screen.getByRole("button", { name: /switch location/i }));
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("renders placeholder when location icons have no src", () => {
    render(<AccountCard account={baseAccount({ isActive: true })} />);

    expect(screen.queryByTestId("location-icon-img")).not.toBeInTheDocument();
    expect(screen.getByTestId("view-my-profile-account-card")).toBeInTheDocument();
  });
});
