import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentRendering, Page } from "@sitecore-content-sdk/nextjs";

import UserInfo from "components/core/UserInfo/UserInfo";
import { UserInfoDefaultVariant } from "components/core/UserInfo/variants/UserInfoDefault.variant";
import type { IUserInfoFields } from "components/core/UserInfo/UserInfo.type";
import type { ComponentProps } from "@/lib/component-props";
import { TEST_CASE_DATA_IDS } from "../../../../helpers/enums";
import * as dashboardAnalytics from "@/lib/dashboardAnalytics";
import { useQuoteRequest } from "@/hooks/useQuoteRequest";
import { useDeviceType } from "@/hooks/use-device-type";

const mockCan = vi.fn(() => true);
const mockOpenFromHeader = vi.fn();

const mockUserProfile = vi.hoisted(() => ({
  profile: {
    parentContact: [{ id: "1", firstName: "Jane", lastName: "User" }],
  },
}));

vi.mock("@/lib/dashboardAnalytics", () => ({
  trackDashboardRequestQuoteHeaderClick: vi.fn(),
}));

vi.mock("@/hooks/use-device-type", () => ({
  useDeviceType: vi.fn(() => ({
    device: "desktop",
    isMobile: false,
    isTablet: false,
  })),
}));

vi.mock("@/lib/user-profile-context", () => ({
  useUserProfile: () => mockUserProfile,
}));

vi.mock("@/lib/permission-context", () => ({
  usePermissionContext: () => ({
    can: (code: string) => mockCan(code),
    canAny: vi.fn(() => true),
    canAll: vi.fn(() => true),
    isLoading: false,
    sitecoreEditingPermissionBypass: false,
  }),
}));

vi.mock("@/lib/profile-context", () => ({
  useProfileContext: () => ({
    selectedAccount: { id: "42", companyName: "Acme" },
  }),
}));

vi.mock("@/hooks/use-active-locale", () => ({
  useActiveLocale: () => "en",
}));

vi.mock("@/hooks/useQuoteRequest", () => ({
  useQuoteRequest: vi.fn(() => ({
    hasPendingDraft: false,
    queueItemCount: 0,
    openFromHeader: mockOpenFromHeader,
    quoteCms: {},
    draft: {},
    isOpen: false,
    closeDrawer: vi.fn(),
    step: "general",
    setStep: vi.fn(),
    generalForm: { application: "", productDetails: "", comments: "" },
    setGeneralForm: vi.fn(),
    lineForm: null,
    setLineForm: vi.fn(),
    generalFieldErrors: {},
    reviewAdditional: "",
    onUpdateReviewNotes: vi.fn(),
    onContinueGeneral: vi.fn(),
    onContinueLine: vi.fn(),
    onAddAnother: vi.fn(),
    onSearchOrders: vi.fn(),
    onDeleteItem: vi.fn(),
    onEditGeneral: vi.fn(),
    onEditLine: vi.fn(),
    onEditOrderQuoteLine: vi.fn(),
    onDeleteOrderQuoteLine: vi.fn(),
    onCancelLineStep: vi.fn(),
    orderHeaderReview: null,
    onConfirmDiscard: vi.fn(),
    discardOpen: false,
    setDiscardOpen: vi.fn(),
    isSaving: false,
    lineKeyInQueue: vi.fn(),
    isOrderHeaderInOrderQuoteDraft: vi.fn(),
    lineInQuoteDraftForListLine: vi.fn(),
    getLineItemByKey: vi.fn(),
    isSubmittingRequest: false,
    submitError: null,
    submittedRequestId: null,
    onSubmitRequest: vi.fn(),
    openFromQuoteRow: vi.fn(),
    openFromLineItem: vi.fn(),
    openFromOrderDetailHeader: vi.fn(),
    setIsOpen: vi.fn(),
    hasOrdersHistory: false,
  })),
}));

vi.mock("@/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer", () => ({
  QuoteRequestDrawer: () => <div data-testid="quote-request-drawer-mock" />,
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    onPress,
    ...rest
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    [key: string]: unknown;
  }) => (
    <button type="button" onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Text: ({ field, tag: Tag = "span" }: { field?: { value?: string }; tag?: keyof JSX.IntrinsicElements }) => (
    <Tag data-testid="sitecore-text">{field?.value ?? ""}</Tag>
  ),
  /** `UserInfo` imports `Image as SitecoreImage` from the SDK. */
  Image: ({ field }: { field?: { value?: { src?: string; alt?: string } } }) =>
    field?.value?.src ? (
      <img src={field.value.src} alt={field.value.alt ?? ""} data-testid="sitecore-image" />
    ) : null,
}));

const rendering = {} as ComponentRendering;

const basePage = { mode: { isEditing: false } } as Page;

const baseParams = {
  styles: "",
  RenderingIdentifier: "user-info-test",
} as ComponentProps["params"];

const baseFields: IUserInfoFields = {
  HideButton: { value: false },
  UserTitle: { value: "Welcome," },
  RequestQuoteLabelDesktop: { value: "Request Quote" },
  QuoteSelection: [],
};

function buildQuoteRequestReturn(
  overrides: Partial<ReturnType<typeof useQuoteRequest>> = {}
): ReturnType<typeof useQuoteRequest> {
  return {
    hasPendingDraft: false,
    queueItemCount: 0,
    openFromHeader: mockOpenFromHeader,
    quoteCms: {},
    draft: {},
    isOpen: false,
    closeDrawer: vi.fn(),
    step: "general",
    setStep: vi.fn(),
    generalForm: { application: "", productDetails: "", comments: "" },
    setGeneralForm: vi.fn(),
    lineForm: null,
    setLineForm: vi.fn(),
    generalFieldErrors: {},
    reviewAdditional: "",
    onUpdateReviewNotes: vi.fn(),
    onContinueGeneral: vi.fn(),
    onContinueLine: vi.fn(),
    onAddAnother: vi.fn(),
    onSearchOrders: vi.fn(),
    onDeleteItem: vi.fn(),
    onEditGeneral: vi.fn(),
    onEditLine: vi.fn(),
    onEditOrderQuoteLine: vi.fn(),
    onDeleteOrderQuoteLine: vi.fn(),
    onCancelLineStep: vi.fn(),
    orderHeaderReview: null,
    onConfirmDiscard: vi.fn(),
    discardOpen: false,
    setDiscardOpen: vi.fn(),
    isSaving: false,
    lineKeyInQueue: vi.fn(),
    isOrderHeaderInOrderQuoteDraft: vi.fn(),
    lineInQuoteDraftForListLine: vi.fn(),
    getLineItemByKey: vi.fn(),
    isSubmittingRequest: false,
    submitError: null,
    submittedRequestId: null,
    onSubmitRequest: vi.fn(),
    openFromQuoteRow: vi.fn(),
    openFromLineItem: vi.fn(),
    openFromOrderDetailHeader: vi.fn(),
    setIsOpen: vi.fn(),
    hasOrdersHistory: false,
    ...overrides,
  } as ReturnType<typeof useQuoteRequest>;
}

describe("UserInfo", () => {
  beforeEach(() => {
    mockUserProfile.profile = {
      parentContact: [{ id: "1", firstName: "Jane", lastName: "User" }],
    };
    mockCan.mockImplementation(() => true);
    vi.mocked(useDeviceType).mockReturnValue({
      device: "desktop",
      isMobile: false,
      isTablet: false,
    });
    vi.mocked(useQuoteRequest).mockReturnValue(buildQuoteRequestReturn());
    mockOpenFromHeader.mockClear();
    vi.clearAllMocks();
  });

  it("renders wrapper with test id and forwards to variant", () => {
    render(
      <UserInfo
        fields={baseFields}
        params={baseParams}
        page={basePage}
        rendering={rendering}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.USER_INFO)).toBeInTheDocument();
  });

  it("shows empty hint when variant receives null fields", () => {
    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={null}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByText("User info")).toBeInTheDocument();
  });

  it("renders greeting prefix and first name from user profile API", () => {
    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByText("Welcome,")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  it("renders request quote control when user can initiate RFQ and button is not hidden", () => {
    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByRole("button", { name: /request quote/i })).toBeInTheDocument();
    expect(screen.getByTestId("quote-request-drawer-mock")).toBeInTheDocument();
  });

  it("does not render request quote button when user lacks RFQ permission", () => {
    mockCan.mockImplementation(() => false);

    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.queryByRole("button", { name: /request quote/i })).not.toBeInTheDocument();
  });

  it("hides request quote button when params.HideRequestQuoteButton is true", () => {
    const params = { ...baseParams, HideRequestQuoteButton: true } as ComponentProps["params"];

    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={baseFields}
        params={params}
        page={basePage}
      />
    );

    expect(screen.queryByRole("button", { name: /request quote/i })).not.toBeInTheDocument();
  });

  it("does not render first name when profile has no parent contact first name", () => {
    mockUserProfile.profile = {
      parentContact: [{ id: "1", firstName: "", lastName: "Rivera" }],
    };

    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByText("Welcome,")).toBeInTheDocument();
    expect(screen.queryByText("Alex")).not.toBeInTheDocument();
  });

  it("tracks request quote header click and opens drawer", async () => {
    const user = userEvent.setup();

    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    await user.click(screen.getByRole("button", { name: /request quote/i }));

    expect(dashboardAnalytics.trackDashboardRequestQuoteHeaderClick).toHaveBeenCalledWith({
      deviceType: "desktop",
    });
    expect(mockOpenFromHeader).toHaveBeenCalled();
  });

  it("reports tablet device type when tracking header quote click", async () => {
    vi.mocked(useDeviceType).mockReturnValue({
      device: "tablet",
      isMobile: false,
      isTablet: true,
    });
    const user = userEvent.setup();

    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    await user.click(screen.getByRole("button", { name: /request quote/i }));

    expect(dashboardAnalytics.trackDashboardRequestQuoteHeaderClick).toHaveBeenCalledWith({
      deviceType: "tablet",
    });
  });

  it("shows modify pending quote label and queue badge when draft exists", () => {
    vi.mocked(useQuoteRequest).mockReturnValue(
      buildQuoteRequestReturn({ hasPendingDraft: true, queueItemCount: 120 })
    );

    const fields = {
      ...baseFields,
      ModifyPendingQuoteTitle: { value: "Modify quote" },
      ModifyPendingQuoteIcon: {
        value: { src: "https://example.test/modify.svg", alt: "Modify" },
      },
    };

    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByRole("button", { name: /modify quote/i })).toBeInTheDocument();
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("shows request quote label in editing mode when desktop label is empty", () => {
    const fields = {
      ...baseFields,
      RequestQuoteLabelDesktop: { value: "" },
    };
    const page = { mode: { isEditing: true } } as Page;

    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={fields}
        params={baseParams}
        page={page}
      />
    );

    const quoteButton = screen.getByRole("button");
    expect(quoteButton).toBeInTheDocument();
    expect(quoteButton.querySelector('[data-testid="sitecore-text"]')).toBeInTheDocument();
  });

  it("defaults to desktop device type when useDeviceType returns null device", async () => {
    vi.mocked(useDeviceType).mockReturnValue({
      device: null,
      isMobile: false,
      isTablet: false,
    });
    const user = userEvent.setup();

    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    await user.click(screen.getByRole("button", { name: /request quote/i }));

    expect(dashboardAnalytics.trackDashboardRequestQuoteHeaderClick).toHaveBeenCalledWith({
      deviceType: "desktop",
    });
  });

  it("reports mobile device type when tracking header quote click", async () => {
    vi.mocked(useDeviceType).mockReturnValue({
      device: "mobile",
      isMobile: true,
      isTablet: false,
    });
    const user = userEvent.setup();

    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    await user.click(screen.getByRole("button", { name: /request quote/i }));

    expect(dashboardAnalytics.trackDashboardRequestQuoteHeaderClick).toHaveBeenCalledWith({
      deviceType: "mobile",
    });
  });

  it("shows queue count on request quote icon when draft is not pending", () => {
    vi.mocked(useQuoteRequest).mockReturnValue(
      buildQuoteRequestReturn({ queueItemCount: 3 })
    );
    const fields = {
      ...baseFields,
      RequestQuoteIcon: {
        value: { src: "https://example.test/quote.svg", alt: "Quote" },
      },
    };

    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("uses mobile label fallback for button aria-label", () => {
    const fields = {
      ...baseFields,
      RequestQuoteLabelDesktop: undefined,
      RequestQuoteLabelMobile: { value: "Quote on mobile" },
    };

    render(
      <UserInfoDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_INFO}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByRole("button", { name: "Quote on mobile" })).toBeInTheDocument();
  });
});
