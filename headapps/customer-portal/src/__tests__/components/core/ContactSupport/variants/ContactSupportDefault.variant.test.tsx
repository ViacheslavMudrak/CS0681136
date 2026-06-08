import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { ContactSupportDefaultVariant } from "components/core/ContactSupport/variants/ContactSupportDefault.variant";
import {
  ContactSupportModalProvider,
  useContactSupportModal,
} from "@/lib/contact-support-modal-context";
import { TEST_CASE_DATA_IDS } from "../../../../../helpers/enums";
import type { IContactSupportFields } from "components/core/ContactSupport/ContactSupport.type";

const { mockUseDeviceType } = vi.hoisted(() => ({
  mockUseDeviceType: vi.fn(() => ({
    isMobile: false,
    isTablet: false,
    isNarrowContactViewport: false,
  })),
}));

vi.mock("@/hooks/use-device-type", () => ({
  useDeviceType: () => mockUseDeviceType(),
}));

vi.mock("@/hooks/use-account-contacts", () => ({
  useAccountContacts: vi.fn(() => []),
}));

vi.mock("@/lib/profile-context", () => ({
  useProfileContext: () => ({
    currentLanguage: "en",
    selectedAccount: null,
    setCurrentLanguage: vi.fn(),
    setSelectedAccount: vi.fn(),
  }),
  useProfileContextOptional: () => ({
    currentLanguage: "en",
    selectedAccount: null,
    setCurrentLanguage: vi.fn(),
    setSelectedAccount: vi.fn(),
  }),
}));

vi.mock("@/hooks/useClickOutside", () => ({
  default: vi.fn(),
}));

vi.mock("@/components/core/ContactSupport/variants/ContactSupportPanelContent", () => ({
  ContactSupportPanelContent: ({
    onEmailClick,
    onPhoneClick,
    supportLinkHref,
    supportLinkText,
  }: {
    onEmailClick?: (email: string) => void;
    onPhoneClick?: (phone: string) => void;
    supportLinkHref?: string;
    supportLinkText?: string;
  }) => (
    <div
      data-testid="contact-support-panel-content"
      data-support-href={supportLinkHref ?? ""}
      data-support-text={supportLinkText ?? ""}
    >
      <span>Panel Content</span>
      <button
        type="button"
        data-testid="panel-trigger-email"
        onClick={() => onEmailClick?.("support@example.com")}
      >
        Email
      </button>
      <button
        type="button"
        data-testid="panel-trigger-phone"
        onClick={() => onPhoneClick?.("555 0100")}
      >
        Phone
      </button>
    </div>
  ),
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field, alt, width, height }: any) =>
    field?.value?.src ? (
      <img
        src={field.value.src}
        alt={alt ?? ""}
        width={width}
        height={height}
        data-testid="content-sdk-image"
      />
    ) : null,
  Text: ({ field, tag: Tag = "span" }: any) =>
    field?.value ? (
      <Tag data-testid="content-sdk-text">{field.value}</Tag>
    ) : null,
}));

/** Opens the portal mobile drawer; Contact trigger is not rendered on mobile. */
function TestOpenMobileContactDrawer(): ReactElement {
  const { openMobileContactDrawer } = useContactSupportModal();
  return (
    <button type="button" onClick={openMobileContactDrawer}>
      Open mobile contact drawer (test helper)
    </button>
  );
}

describe("ContactSupportDefaultVariant", () => {
  const mockParams = { params: { styles: "test", RenderingIdentifier: "id" } };

  const createMockFields = (
    overrides?: Partial<IContactSupportFields>
  ): IContactSupportFields => ({
    PopupTitle: { value: "Your Account Contacts" },
    Title: { value: "Contact" },
    Icon: {
      value: {
        src: "/contact-icon.png",
        alt: "Contact",
        width: 16,
        height: 16,
      },
    },
    SupportLink: {
      value: {
        href: "tel:+18005358848",
        text: "+1 (800) 535-8848",
        url: "tel:+18005358848",
      },
    },
    SupportIcon: {
      value: {
        src: "/phone-icon.png",
        alt: "Phone",
        width: 16,
        height: 16,
      },
    },
    SupportTitle: { value: "Call us for general support" },
    NoContactPanelTitle: { value: "No account contacts found" },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeviceType.mockReturnValue({ isMobile: false, isTablet: false });
  });

  function renderWithContactModal(ui: ReactElement) {
    return render(<ContactSupportModalProvider>{ui}</ContactSupportModalProvider>);
  }

  describe("Component Rendering", () => {
    it("should render component with test id", () => {
      const fields = createMockFields();
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      expect(
        screen.getByTestId(TEST_CASE_DATA_IDS.CONTACT_SUPPORT)
      ).toBeInTheDocument();
    });

    it("should render empty div when fields are null", () => {
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={null as unknown as IContactSupportFields}
          params={mockParams}
        />
      );

      const container = screen.getByTestId(TEST_CASE_DATA_IDS.CONTACT_SUPPORT);
      expect(container).toBeInTheDocument();
      expect(container.children.length).toBe(0);
    });

    it("should render trigger button with Contact aria-label", () => {
      const fields = createMockFields();
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      const button = screen.getByRole("button", { name: "Contact" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveAttribute("aria-haspopup", "dialog");
    });

    it("should render icon when Icon has src", () => {
      const fields = createMockFields();
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      const image = screen.getByTestId("content-sdk-image");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/contact-icon.png");
    });

    it("should not render trigger icon when Icon has no src", () => {
      const fields = createMockFields({
        Icon: {
          value: { src: "", alt: "Contact", width: 16, height: 16 },
        },
      });
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      expect(screen.queryByTestId("content-sdk-image")).not.toBeInTheDocument();
    });

    it("should render title text when Title has value and not mobile", () => {
      const fields = createMockFields();
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      expect(screen.getByText("Contact")).toBeInTheDocument();
    });

    it("should render Contact trigger on mobile when viewport is wider than 350px", () => {
      mockUseDeviceType.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isNarrowContactViewport: false,
      });
      const fields = createMockFields();
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      expect(screen.getByRole("button", { name: "Contact" })).toBeInTheDocument();
    });
  });

  describe("Panel Open / Close", () => {
    it("should open dropdown when trigger is clicked", () => {
      const fields = createMockFields();
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      const button = screen.getByRole("button", { name: "Contact" });
      fireEvent.click(button);

      const dialog = screen.getByRole("dialog", {
        name: "Your Account Contacts",
      });
      expect(dialog).toBeInTheDocument();
      expect(screen.getByTestId("contact-support-panel-content")).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("should close dropdown when trigger is clicked again", () => {
      const fields = createMockFields();
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      const button = screen.getByRole("button", { name: "Contact" });
      fireEvent.click(button);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      fireEvent.click(button);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should close panel when Escape is pressed", () => {
      const fields = createMockFields();
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      const button = screen.getByRole("button", { name: "Contact" });
      fireEvent.click(button);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should show panel when PopupTitle is empty (dialog still present)", () => {
      const fields = createMockFields({ PopupTitle: { value: "" } });
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Contact" }));
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("should not render title on trigger when Title has no value", () => {
      const fields = createMockFields({ Title: { value: "" } });
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      const button = screen.getByRole("button", { name: "Contact" });
      expect(button).toBeInTheDocument();
    });
  });

  describe("Mobile drawer", () => {
    it("renders drawer and backdrop on mobile when open", () => {
      mockUseDeviceType.mockReturnValue({ isMobile: true, isTablet: false });
      const fields = createMockFields();
      renderWithContactModal(
        <>
          <ContactSupportDefaultVariant
            testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
            fields={fields}
            params={mockParams}
          />
          <TestOpenMobileContactDrawer />
        </>
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Open mobile contact drawer (test helper)" })
      );

      expect(screen.getByRole("button", { name: /close contact panel/i })).toBeInTheDocument();
      expect(screen.getByTestId("contact-support-panel-content")).toBeInTheDocument();
      expect(screen.queryByRole("dialog", { name: "Your Account Contacts" })).toBeInTheDocument();
    });

    it("closes mobile drawer when backdrop is pressed", () => {
      mockUseDeviceType.mockReturnValue({ isMobile: true, isTablet: false });
      const fields = createMockFields();
      renderWithContactModal(
        <>
          <ContactSupportDefaultVariant
            testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
            fields={fields}
            params={mockParams}
          />
          <TestOpenMobileContactDrawer />
        </>
      );

      fireEvent.click(
        screen.getByRole("button", { name: "Open mobile contact drawer (test helper)" })
      );
      fireEvent.click(screen.getByRole("button", { name: /close contact panel/i }));

      expect(screen.queryByTestId("contact-support-panel-content")).not.toBeInTheDocument();
    });
  });

  describe("Panel interactions", () => {
    const withStubLocation = (run: (getHref: () => string) => void) => {
      const orig = window.location;
      let href = "http://localhost:3000/";
      delete (window as unknown as { location?: Location }).location;
      (window as unknown as { location: Location }).location = {
        get href() {
          return href;
        },
        set href(v: string) {
          href = v;
        },
        origin: "http://localhost:3000",
        assign: vi.fn(),
      } as unknown as Location;
      try {
        run(() => href);
      } finally {
        (window as unknown as { location: Location }).location = orig;
      }
    };

    it("navigates to mailto when email is triggered from desktop panel", () => {
      mockUseDeviceType.mockReturnValue({ isMobile: false, isTablet: false });
      withStubLocation((getHref) => {
        const fields = createMockFields();
        renderWithContactModal(
          <ContactSupportDefaultVariant
            testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
            fields={fields}
            params={mockParams}
          />
        );
        fireEvent.click(screen.getByRole("button", { name: "Contact" }));
        fireEvent.click(screen.getByTestId("panel-trigger-email"));
        expect(getHref()).toBe("mailto:support@example.com");
      });
    });

    it("copies phone to clipboard on desktop when panel triggers phone", async () => {
      mockUseDeviceType.mockReturnValue({ isMobile: false, isTablet: false });
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        writable: true,
        value: { writeText },
      });

      const fields = createMockFields();
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "Contact" }));
      fireEvent.click(screen.getByTestId("panel-trigger-phone"));

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith("5550100");
      });
    });

    it("uses tel link when phone is triggered on mobile", () => {
      mockUseDeviceType.mockReturnValue({ isMobile: true, isTablet: false });
      withStubLocation((getHref) => {
        const fields = createMockFields();
        renderWithContactModal(
          <>
            <ContactSupportDefaultVariant
              testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
              fields={fields}
              params={mockParams}
            />
            <TestOpenMobileContactDrawer />
          </>
        );
        fireEvent.click(
          screen.getByRole("button", { name: "Open mobile contact drawer (test helper)" })
        );
        fireEvent.click(screen.getByTestId("panel-trigger-phone"));
        expect(getHref()).toBe("tel:5550100");
      });
    });

    it("uses tel link when phone is triggered on tablet", () => {
      mockUseDeviceType.mockReturnValue({ isMobile: false, isTablet: true });
      withStubLocation((getHref) => {
        const fields = createMockFields();
        renderWithContactModal(
          <ContactSupportDefaultVariant
            testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
            fields={fields}
            params={mockParams}
          />
        );
        fireEvent.click(screen.getByRole("button", { name: "Contact" }));
        fireEvent.click(screen.getByTestId("panel-trigger-phone"));
        expect(getHref()).toBe("tel:5550100");
      });
    });

    it("passes support link resolved from url when href is absent", () => {
      const fields = createMockFields({
        SupportLink: {
          value: {
            url: "https://support.example/help",
            text: "Help desk",
          },
        },
      });
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "Contact" }));
      const panel = screen.getByTestId("contact-support-panel-content");
      expect(panel).toHaveAttribute("data-support-href", "https://support.example/help");
      expect(panel).toHaveAttribute("data-support-text", "Help desk");
    });

    it("falls back support link href to hash when href and url missing", () => {
      const fields = createMockFields({
        SupportLink: { value: { text: "No link" } },
      });
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "Contact" }));
      expect(screen.getByTestId("contact-support-panel-content")).toHaveAttribute(
        "data-support-href",
        "#"
      );
    });
  });

  describe("RTL", () => {
    afterEach(() => {
      document.documentElement.removeAttribute("dir");
    });

    it("does not set dir on desktop dialog; RTL is handled via document / CSS", () => {
      document.documentElement.setAttribute("dir", "rtl");
      const fields = createMockFields();
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "Contact" }));
      const dialog = screen.getByRole("dialog", { name: "Your Account Contacts" });
      expect(dialog).toBeInTheDocument();
      expect(dialog).not.toHaveAttribute("dir");
      expect(document.documentElement).toHaveAttribute("dir", "rtl");
    });

    it("sets dir rtl on mobile drawer when document is rtl", () => {
      mockUseDeviceType.mockReturnValue({ isMobile: true, isTablet: false });
      document.documentElement.setAttribute("dir", "rtl");
      const fields = createMockFields();
      renderWithContactModal(
        <>
          <ContactSupportDefaultVariant
            testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
            fields={fields}
            params={mockParams}
          />
          <TestOpenMobileContactDrawer />
        </>
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Open mobile contact drawer (test helper)" })
      );
      const dialog = screen.getByRole("dialog", { name: "Your Account Contacts" });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("dir", "rtl");
    });
  });

  describe("Desktop dropdown", () => {
    it("renders the dropdown panel with base dropdown class when opened", async () => {
      const fields = createMockFields();
      renderWithContactModal(
        <ContactSupportDefaultVariant
          testId={TEST_CASE_DATA_IDS.CONTACT_SUPPORT}
          fields={fields}
          params={mockParams}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Contact" }));

      const dialog = screen.getByRole("dialog", { name: "Your Account Contacts" });
      await waitFor(() => {
        expect(dialog).toHaveClass("rounded-[8px]");
      });
    });
  });
});
