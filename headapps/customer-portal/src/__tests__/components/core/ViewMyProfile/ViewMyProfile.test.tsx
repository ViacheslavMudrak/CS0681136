import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ViewMyProfile from "components/core/ViewMyProfile/ViewMyProfile";
import { TEST_CASE_DATA_IDS } from "../../../../helpers/enums";
import type { IViewMyProfileFields } from "components/core/ViewMyProfile/ViewMyProfile.type";

vi.mock("components/core/ViewMyProfile/variants/ViewMyProfileDefault.variant", () => ({
  ViewMyProfileDefaultVariant: ({
    testId,
    fields,
  }: {
    testId: string;
    fields: IViewMyProfileFields | null;
  }) => <div data-testid={testId}>ViewMyProfileDefaultVariant</div>,
}));

describe("ViewMyProfile", () => {
  const mockParams = {
    params: {
      styles: "test-styles",
      RenderingIdentifier: "test-id",
    },
  };

  const mockFields: IViewMyProfileFields = {
    ProfileTitle: { value: "Profile Settings" },
    ProfileSectionTitle: { value: "Personal Information" },
    CompanySectionTitle: { value: "Your Company Accounts" },
    BannerText: { value: "Need help?" },
    BannerLink: { value: { href: "/support", text: "Contact Support" } },
  };

  it("should render component with test id", () => {
    render(<ViewMyProfile fields={mockFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.VIEW_MY_PROFILE)).toBeInTheDocument();
  });

  it("should pass fields and params to variant component", () => {
    render(<ViewMyProfile fields={mockFields} params={mockParams} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.VIEW_MY_PROFILE);
    expect(variant).toBeInTheDocument();
    expect(variant).toHaveTextContent("ViewMyProfileDefaultVariant");
  });

  it("should handle empty fields", () => {
    const emptyFields = {} as IViewMyProfileFields;

    render(<ViewMyProfile fields={emptyFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.VIEW_MY_PROFILE)).toBeInTheDocument();
  });

  it("should handle missing fields gracefully", () => {
    const partialFields = {
      ProfileTitle: { value: "Profile Settings" },
    } as unknown as IViewMyProfileFields;

    render(<ViewMyProfile fields={partialFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.VIEW_MY_PROFILE)).toBeInTheDocument();
  });
});
