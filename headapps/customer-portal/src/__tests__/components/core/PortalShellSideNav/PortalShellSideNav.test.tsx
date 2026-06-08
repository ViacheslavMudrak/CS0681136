import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PortalShellSideNav from "components/core/PortalShellSideNav/PortalShellSideNav";
import { TEST_CASE_DATA_IDS } from "../../../../helpers/enums";
import type { PortalShellSideNavFields } from "components/core/PortalShellSideNav/PortalShellSideNav.type";

vi.mock("components/core/PortalShellSideNav/variants/PortalShellSideNavDefault.variant", () => ({
  default: ({
    fields,
    testId,
  }: {
    fields: PortalShellSideNavFields | null;
    testId: string;
  }) => (
    <div data-testid={testId}>
      PortalShellSideNavDefaultVariant
      {fields ? "with-fields" : "no-fields"}
    </div>
  ),
}));

describe("PortalShellSideNav", () => {
  const mockParams = {
    params: {
      styles: "test-styles",
      RenderingIdentifier: "test-id",
    },
  };

  const mockFields: PortalShellSideNavFields = {
    CopyrightText: { value: "© {current_year} Intralox" },
    WebsiteURL: { value: { href: "https://www.intralox.com", text: "intralox.com" } },
    NavigationSection: [],
  };

  it("should render component with test id", () => {
    render(<PortalShellSideNav fields={mockFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV)).toBeInTheDocument();
  });

  it("should pass fields and testId to variant component", () => {
    render(<PortalShellSideNav fields={mockFields} params={mockParams} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV);
    expect(variant).toBeInTheDocument();
    expect(variant).toHaveTextContent("PortalShellSideNavDefaultVariant");
    expect(variant).toHaveTextContent("with-fields");
  });

  it("should handle null fields", () => {
    render(<PortalShellSideNav fields={null} params={mockParams} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV);
    expect(variant).toBeInTheDocument();
    expect(variant).toHaveTextContent("no-fields");
  });

  it("should handle empty fields object", () => {
    const emptyFields = {} as PortalShellSideNavFields;

    render(<PortalShellSideNav fields={emptyFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV)).toBeInTheDocument();
  });

  it("should handle partial fields gracefully", () => {
    const partialFields = {
      CopyrightText: { value: "© Test" },
    } as unknown as PortalShellSideNavFields;

    render(<PortalShellSideNav fields={partialFields} params={mockParams} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV)).toBeInTheDocument();
  });
});
