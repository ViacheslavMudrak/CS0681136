import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DocumentRequestPanel } from "@/components/shared/document-request-panel/DocumentRequestPanel";
import type { IDocumentRequestPanelFields } from "@/lib/document-request-panel-types";
import { ProfileContextProvider } from "@/lib/profile-context";

type EditableTestField = NonNullable<IDocumentRequestPanelFields["DocumentRequestSubmittingAsTooltip"]> & {
  editable?: string;
};

vi.mock("@okta/okta-react", () => ({
  useOktaAuth: () => ({
    authState: {
      idToken: { claims: { email: "panel-user@example.com", name: "Panel User" } },
    },
  }),
}));

vi.mock("@/lib/user-profile-context", () => ({
  useUserProfile: () => ({
    profile: {
      parentContact: [
        { id: "p1", firstName: "Jeremy", lastName: "Gebert", childContacts: [] },
      ],
      leads: [],
    },
    loading: false,
    error: null,
    hasNoAccounts: false,
    accounts: [],
    defaultAccountId: null,
    userDisplay: { fullName: "Jeremy Gebert", email: "", isVerified: true },
    refetch: vi.fn(),
    setProfileData: vi.fn(),
  }),
}));

vi.mock("@/lib/profile-context", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/profile-context")>();
  return {
    ...actual,
    useProfileContext: () => ({
      selectedAccount: {
        id: "6087859",
        companyName: "TYSON FOOD SERVICE - JEFFERSON",
        address: "1 Rock River Rd",
        accountNumber: "710733",
        isActive: true,
        role: "Engineer",
        organization: "TYSON",
      },
      setCurrentLanguage: vi.fn(),
      setSelectedAccount: vi.fn(),
      currentLanguage: "en",
    }),
  };
});

vi.mock("@/hooks/use-device-type", () => ({
  __esModule: true,
  default: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    device: "desktop" as const,
  }),
}));

const { submitDocumentRequestMock } = vi.hoisted(() => ({
  submitDocumentRequestMock: vi.fn(),
}));

const {
  trackDocumentRequestAbandonedMock,
  trackDocumentRequestConfirmationClosedMock,
  trackDocumentRequestDocumentTypeSelectedMock,
  trackDocumentRequestInitiatedMock,
  trackDocumentRequestItemRemovedMock,
  trackDocumentRequestOtherDocumentTypeEnteredMock,
  trackDocumentRequestPanelDismissedMock,
  trackDocumentRequestPanelOpenedMock,
  trackDocumentRequestSubmissionErrorMock,
  trackDocumentRequestSubmittedMock,
} = vi.hoisted(() => ({
  trackDocumentRequestAbandonedMock: vi.fn(),
  trackDocumentRequestConfirmationClosedMock: vi.fn(),
  trackDocumentRequestDocumentTypeSelectedMock: vi.fn(),
  trackDocumentRequestInitiatedMock: vi.fn(),
  trackDocumentRequestItemRemovedMock: vi.fn(),
  trackDocumentRequestOtherDocumentTypeEnteredMock: vi.fn(),
  trackDocumentRequestPanelDismissedMock: vi.fn(),
  trackDocumentRequestPanelOpenedMock: vi.fn(),
  trackDocumentRequestSubmissionErrorMock: vi.fn(),
  trackDocumentRequestSubmittedMock: vi.fn(),
}));

vi.mock("@/lib/apis/document-request-api", () => ({
  submitDocumentRequest: (...args: unknown[]) => submitDocumentRequestMock(...args),
}));

vi.mock("@/lib/documentRequestAnalytics", () => ({
  trackDocumentRequestAbandoned: (...args: unknown[]) => trackDocumentRequestAbandonedMock(...args),
  trackDocumentRequestConfirmationClosed: (...args: unknown[]) =>
    trackDocumentRequestConfirmationClosedMock(...args),
  trackDocumentRequestDocumentTypeSelected: (...args: unknown[]) =>
    trackDocumentRequestDocumentTypeSelectedMock(...args),
  trackDocumentRequestInitiated: (...args: unknown[]) => trackDocumentRequestInitiatedMock(...args),
  trackDocumentRequestItemRemoved: (...args: unknown[]) => trackDocumentRequestItemRemovedMock(...args),
  trackDocumentRequestOtherDocumentTypeEntered: (...args: unknown[]) =>
    trackDocumentRequestOtherDocumentTypeEnteredMock(...args),
  trackDocumentRequestPanelDismissed: (...args: unknown[]) =>
    trackDocumentRequestPanelDismissedMock(...args),
  trackDocumentRequestPanelOpened: (...args: unknown[]) => trackDocumentRequestPanelOpenedMock(...args),
  trackDocumentRequestSubmissionError: (...args: unknown[]) =>
    trackDocumentRequestSubmissionErrorMock(...args),
  trackDocumentRequestSubmitted: (...args: unknown[]) => trackDocumentRequestSubmittedMock(...args),
}));

const baseFields: IDocumentRequestPanelFields = {
  DocumentRequestPanelTitle: { value: "Request Document" },
  DocumentRequestSingleItemSectionLabel: { value: "Details" },
  DocumentRequestSubmittingAsLabel: { value: "Submitting As" },
  DocumentRequestSubmittingAsTooltip: { value: "Tip" },
  DocumentRequestDocumentTypeLabel: { value: "Type" },
  DocumentRequestDocumentTypeList: [
    {
      id: "t1",
      fields: {
        Label: { value: "Certificate" },
        Value: { value: "certificate" },
        Visible: { value: true },
        SortOrder: { value: "1" },
        IsOtherType: { value: false },
      },
    },
    {
      id: "other",
      fields: {
        Label: { value: "Other" },
        Value: { value: "other" },
        Visible: { value: true },
        SortOrder: { value: "2" },
        IsOtherType: { value: true },
      },
    },
  ],
  DocumentRequestOtherTypeLabel: { value: "Other label" },
  DocumentRequestOtherTypePlaceholder: { value: "Other ph" },
  DocumentRequestAdditionalNotesLabel: { value: "Notes" },
  DocumentRequestAdditionalNotesPlaceholder: { value: "" },
  DocumentRequestCancelLabel: { value: "Cancel" },
  DocumentRequestSubmitLabel: { value: "Submit" },
  DocumentRequestUnsavedDialogTitle: { value: "Unsaved" },
  DocumentRequestUnsavedDialogBody: { value: "Body" },
  DocumentRequestUnsavedConfirmLabel: { value: "Discard" },
  DocumentRequestUnsavedCancelLabel: { value: "Back" },
};

function renderPanel(props: Partial<ComponentProps<typeof DocumentRequestPanel>> = {}) {
  const { onClose: onCloseProp, ...rest } = props;
  const onClose = onCloseProp ?? vi.fn();
  const utils = render(
    <ProfileContextProvider>
      <DocumentRequestPanel
        isOpen
        onClose={onClose}
        fields={baseFields}
        entryPoint="EP1"
        layoutMode="single"
        poNumber="PO1"
        orderNumber="ORD1"
        initialLines={[
          {
            lineId: "L1",
            customerPartNumber: "C1",
            intraloxPartNumber: "I1",
            description: "Desc",
            quantity: 1,
          },
        ]}
        {...rest}
      />
    </ProfileContextProvider>
  );
  return { ...utils, onClose };
}

describe("DocumentRequestPanel", () => {
  beforeEach(() => {
    submitDocumentRequestMock.mockReset();
    submitDocumentRequestMock.mockResolvedValue({ success: true });
    trackDocumentRequestAbandonedMock.mockReset();
    trackDocumentRequestConfirmationClosedMock.mockReset();
    trackDocumentRequestDocumentTypeSelectedMock.mockReset();
    trackDocumentRequestInitiatedMock.mockReset();
    trackDocumentRequestItemRemovedMock.mockReset();
    trackDocumentRequestOtherDocumentTypeEnteredMock.mockReset();
    trackDocumentRequestPanelDismissedMock.mockReset();
    trackDocumentRequestPanelOpenedMock.mockReset();
    trackDocumentRequestSubmissionErrorMock.mockReset();
    trackDocumentRequestSubmittedMock.mockReset();
  });

  it("tracks panel open", () => {
    renderPanel();
    expect(trackDocumentRequestPanelOpenedMock).toHaveBeenCalledWith({
      entryPoint: "EP1",
      itemCount: 1,
    });
  });

  it("shows submitting-as help control for HTML tooltip markup from CMS", () => {
    renderPanel({
      fields: {
        ...baseFields,
        DocumentRequestSubmittingAsTooltip: { value: "<p>Show this help</p>" },
      },
    });
    expect(
      screen.getByRole("button", { name: /Document request account information/i })
    ).toBeInTheDocument();
  });

  it("shows submitting-as help when tooltip text is only in editable (Sitecore)", () => {
    renderPanel({
      fields: {
        ...baseFields,
        DocumentRequestSubmittingAsTooltip: {
          value: "",
          editable: "<p>Edit mode copy</p>",
        } as EditableTestField,
      },
    });
    expect(
      screen.getByRole("button", { name: /Document request account information/i })
    ).toBeInTheDocument();
  });

  it("shows validation when submitting without document type", async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole("button", { name: /Submit/i }));
    expect(await screen.findByText(/Please select a document type/i)).toBeInTheDocument();
    expect(submitDocumentRequestMock).not.toHaveBeenCalled();
  });

  it("renders the document type section header once", () => {
    renderPanel();
    expect(screen.getAllByText(/^Type$/)).toHaveLength(1);
  });

  it("renders Additional Notes textarea placeholder from CMS field", () => {
    renderPanel({
      fields: {
        ...baseFields,
        DocumentRequestAdditionalNotesPlaceholder: {
          value: "Add any additional details or specific document requirements",
        },
      },
    });
    expect(
      screen.getByPlaceholderText(/Add any additional details or specific document requirements/i)
    ).toBeInTheDocument();
  });

  it("renders combined customer and intralox part line in single-item card", () => {
    renderPanel({
      initialLines: [
        {
          lineId: "L1",
          customerPartNumber: "",
          intraloxPartNumber: "I1",
          description: "Desc",
          quantity: 1,
        },
      ],
    });
    expect(screen.getByText("Customer Part # — | Intralox Part # I1")).toBeInTheDocument();
  });

  it("submits when document type selected", async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole("checkbox", { name: /Certificate/i }));
    await user.click(screen.getByRole("button", { name: /Submit/i }));
    await waitFor(() => expect(submitDocumentRequestMock).toHaveBeenCalled());
    const body = submitDocumentRequestMock.mock.calls[0][0] as {
      requests: { documentType: string }[];
      comments: string;
      accountId: string;
      customerAccountName: string;
      contactEmail: string;
      recipients: { email: string; name: string }[];
    };
    expect(body.requests).toEqual([{ documentType: "Certificate" }]);
    expect(body.comments).toBe("");
    expect(body.accountId).toBe("6087859");
    expect(body.customerAccountName).toBe("TYSON FOOD SERVICE - JEFFERSON");
    expect(body.contactEmail).toBe("panel-user@example.com");
    expect(body.recipients).toEqual([{ email: "panel-user@example.com", name: "Jeremy Gebert" }]);
    expect(trackDocumentRequestDocumentTypeSelectedMock).toHaveBeenCalledWith({
      entryPoint: "EP1",
      documentType: "certificate",
    });
    expect(trackDocumentRequestInitiatedMock).toHaveBeenCalledWith({
      entryPoint: "EP1",
      itemCount: 1,
      documentType: "certificate",
    });
    expect(trackDocumentRequestSubmittedMock).toHaveBeenCalledWith({
      entryPoint: "EP1",
      itemCount: 1,
      documentType: "certificate",
    });
  });

  it("supports multi-select document types", async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole("checkbox", { name: /Certificate/i }));
    await user.click(screen.getByRole("checkbox", { name: /^Other$/i }));
    await user.type(screen.getByLabelText(/Other label/i), "MSDS");
    await user.click(screen.getByRole("button", { name: /Submit/i }));
    await waitFor(() => expect(submitDocumentRequestMock).toHaveBeenCalled());
    const body = submitDocumentRequestMock.mock.calls[0][0] as {
      requests: { documentType: string; otherDocumentType?: string }[];
      comments: string;
    };
    expect(body.requests).toEqual([
      { documentType: "Certificate" },
      { documentType: "Other", otherDocumentType: "MSDS" },
    ]);
    expect(body.comments).toBe("");
  });

  it("tracks other document type blur when non-empty", async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole("checkbox", { name: /^Other$/i }));
    const otherInput = screen.getByLabelText(/Other label/i);
    await user.type(otherInput, "SDS");
    await user.tab();
    expect(trackDocumentRequestOtherDocumentTypeEnteredMock).toHaveBeenCalledWith({
      entryPoint: "EP1",
    });
  });

  it("requires Other Document Type when Other is selected", async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole("checkbox", { name: /^Other$/i }));
    await user.click(screen.getByRole("button", { name: /Submit/i }));
    expect(await screen.findByText(/This field is required/i)).toBeInTheDocument();
    expect(submitDocumentRequestMock).not.toHaveBeenCalled();
  });

  it("closes when last multi item is removed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const multiFields: IDocumentRequestPanelFields = {
      ...baseFields,
      DocumentRequestMultiItemSectionLabelPattern: { value: "PO {PO_NUMBER}" },
    };
    renderPanel({
      onClose,
      layoutMode: "multi",
      entryPoint: "EP2a",
      fields: multiFields,
      initialLines: [
        {
          lineId: "only",
          customerPartNumber: "c",
          intraloxPartNumber: "i",
          description: "d",
          quantity: 1,
        },
      ],
    });
    await user.click(screen.getByRole("button", { name: /Remove line from request/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(trackDocumentRequestItemRemovedMock).toHaveBeenCalledWith({
      entryPoint: "EP2a",
      itemCount: 0,
    });
  });

  it("tracks clean close when no interaction", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderPanel({ onClose });
    await user.click(screen.getByRole("button", { name: /^Cancel$/i }));
    expect(onClose).toHaveBeenCalled();
    expect(trackDocumentRequestPanelDismissedMock).toHaveBeenCalledWith({
      entryPoint: "EP1",
      itemCount: 1,
    });
  });

  it("tracks abandonment when discard is confirmed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderPanel({ onClose });
    await user.click(screen.getByRole("checkbox", { name: /Certificate/i }));
    await user.click(screen.getByRole("button", { name: /^Cancel$/i }));
    await user.click(screen.getByRole("button", { name: /^Discard$/i }));
    expect(onClose).toHaveBeenCalled();
    expect(trackDocumentRequestAbandonedMock).toHaveBeenCalledWith({
      entryPoint: "EP1",
      itemCount: 1,
      documentTypeSelected: true,
      hadNotes: false,
    });
  });

  it("tracks submission error", async () => {
    submitDocumentRequestMock.mockResolvedValueOnce({ success: false, message: "HTTP 500" });
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole("checkbox", { name: /Certificate/i }));
    await user.click(screen.getByRole("button", { name: /Submit/i }));
    await waitFor(() => expect(trackDocumentRequestSubmissionErrorMock).toHaveBeenCalled());
    expect(trackDocumentRequestSubmissionErrorMock).toHaveBeenCalledWith({
      entryPoint: "EP1",
      itemCount: 1,
      errorType: "500",
    });
  });

  it("shows CMS SubmissionRetryButtonLabel on error modal and footer primary after fail", async () => {
    submitDocumentRequestMock.mockResolvedValueOnce({ success: false, message: "HTTP 500" });
    const user = userEvent.setup();
    renderPanel({
      fields: {
        ...baseFields,
        DocumentRequestRetryLabel: { value: "Try Again-EP1" },
      },
    });
    await user.click(screen.getByRole("checkbox", { name: /Certificate/i }));
    await user.click(screen.getByRole("button", { name: /Submit/i }));
    const retryButtons = await screen.findAllByRole("button", { name: /Try Again-EP1/i });
    expect(retryButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Try Again-EP1").length).toBeGreaterThanOrEqual(1);
  });

  it("replaces the confirmation requestId token with the API response request ID", async () => {
    submitDocumentRequestMock.mockResolvedValueOnce({
      success: true,
      requestId: "8bea0465af064a7e8eac87c5c7c3aea1",
    });
    const user = userEvent.setup();
    renderPanel({
      fields: {
        ...baseFields,
        DocumentRequestSuccessTitle: { value: "Done" },
        DocumentRequestSuccessBody: {
          value: "Your request ID is {requestId}",
        },
        DocumentRequestSuccessCloseLabel: { value: "Close Window" },
      },
    });

    await user.click(screen.getByRole("checkbox", { name: /Certificate/i }));
    await user.click(screen.getByRole("button", { name: /Submit/i }));

    expect(
      await screen.findByText("Your request ID is 8bea0465af064a7e8eac87c5c7c3aea1")
    ).toBeInTheDocument();
  });

  it("tracks confirmation close from success modal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const successFields: IDocumentRequestPanelFields = {
      ...baseFields,
      DocumentRequestSuccessTitle: { value: "Done" },
      DocumentRequestSuccessBody: { value: "Complete" },
      DocumentRequestSuccessCloseLabel: { value: "Close Window" },
    };
    renderPanel({ onClose, fields: successFields });
    await user.click(screen.getByRole("checkbox", { name: /Certificate/i }));
    await user.click(screen.getByRole("button", { name: /Submit/i }));
    await user.click(screen.getByRole("button", { name: /Close Window/i }));
    expect(onClose).toHaveBeenCalled();
    expect(trackDocumentRequestConfirmationClosedMock).toHaveBeenCalledWith({
      entryPoint: "EP1",
    });
  });

  it("renders CMS confirmation icon in success modal when src is configured", async () => {
    const user = userEvent.setup();
    const successFields: IDocumentRequestPanelFields = {
      ...baseFields,
      DocumentRequestSuccessTitle: { value: "Done" },
      DocumentRequestSuccessBody: { value: "Complete" },
      DocumentRequestSuccessCloseLabel: { value: "Close Window" },
      DocumentRequestConfirmationIcon: {
        value: { src: "https://cms.example/tick.svg", alt: "Tick" },
      },
    };
    renderPanel({ fields: successFields });
    await user.click(screen.getByRole("checkbox", { name: /Certificate/i }));
    await user.click(screen.getByRole("button", { name: /Submit/i }));
    const wrap = await screen.findByTestId("document-request-success-icon");
    expect(wrap).toBeInTheDocument();
    const img = wrap.querySelector("img");
    expect(
      img?.getAttribute("src")?.includes("tick.svg") ||
        img?.getAttribute("srcset")?.includes("tick.svg")
    ).toBeTruthy();
  });
});
