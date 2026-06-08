import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactSupport from "components/core/ContactSupport/ContactSupport";
import { TEST_CASE_DATA_IDS } from "../../../../helpers/enums";
import type { IContactSupportFields } from "components/core/ContactSupport/ContactSupport.type";

vi.mock("components/core/ContactSupport/variants/ContactSupportDefault.variant", () => ({
  ContactSupportDefaultVariant: ({
    testId,
    fields,
  }: {
    testId: string;
    fields: IContactSupportFields;
  }) => (
    <div data-testid={testId}>
      ContactSupportDefaultVariant
    </div>
  ),
}));

describe("ContactSupport", () => {
  const mockParams = {
    params: {
      styles: "test-styles",
      RenderingIdentifier: "test-id",
    },
  };

  const mockFields: IContactSupportFields = {
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
  };

  it("should render component with test id", () => {
    render(<ContactSupport fields={mockFields} params={mockParams} />);

    expect(
      screen.getByTestId(TEST_CASE_DATA_IDS.CONTACT_SUPPORT)
    ).toBeInTheDocument();
  });

  it("should pass fields and params to variant component", () => {
    render(<ContactSupport fields={mockFields} params={mockParams} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.CONTACT_SUPPORT);
    expect(variant).toBeInTheDocument();
    expect(variant).toHaveTextContent("ContactSupportDefaultVariant");
  });

  it("should handle empty fields", () => {
    const emptyFields: IContactSupportFields = {
      PopupTitle: { value: "" },
      Title: { value: "" },
      Icon: { value: undefined },
      SupportLink: { value: undefined },
      SupportIcon: { value: undefined },
      SupportTitle: { value: "" },
    };

    render(<ContactSupport fields={emptyFields} params={mockParams} />);

    expect(
      screen.getByTestId(TEST_CASE_DATA_IDS.CONTACT_SUPPORT)
    ).toBeInTheDocument();
  });

  it("should handle partial fields gracefully", () => {
    const partialFields = {
      Title: { value: "Contact" },
      SupportLink: { value: { href: "tel:123", text: "123" } },
    } as unknown as IContactSupportFields;

    render(<ContactSupport fields={partialFields} params={mockParams} />);

    expect(
      screen.getByTestId(TEST_CASE_DATA_IDS.CONTACT_SUPPORT)
    ).toBeInTheDocument();
  });
});
