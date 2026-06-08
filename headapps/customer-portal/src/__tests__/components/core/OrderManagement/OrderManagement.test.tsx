import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";import OrderManagement from "components/core/OrderManagement/OrderManagement";
import { TEST_CASE_DATA_IDS } from "../../../../helpers/enums";
import type { IOrderManagementFields } from "components/core/OrderManagement/OrderManagement.type";
import type { Page } from "@sitecore-content-sdk/nextjs";

const mockPage = { mode: { isEditing: false } } as Page;

vi.mock("next/dynamic", () => ({
  default: () => {
    const React = require("react");
    return function DynamicOrderManagementStub(props: { testId?: string }) {
      return React.createElement("div", { "data-testid": props.testId }, "OrderManagementDefaultVariant");
    };
  },
}));

vi.mock("components/core/OrderManagement/variants/OrderManagementDefault.variant", () => ({
  OrderManagementDefaultVariant: ({
    testId,
    fields,
  }: {
    testId: string;
    fields: IOrderManagementFields;
  }) => <div data-testid={testId}>OrderManagementDefaultVariant</div>,
}));

describe("OrderManagement", () => {
  const mockParams = {
    styles: "test-styles",
    RenderingIdentifier: "test-id",
  };

  const mockFields: IOrderManagementFields = {
    Title: { value: "Orders" },
    SubTitle: { value: "Manage your orders" },
  };

  it("should render component with test id", () => {
    render(<OrderManagement fields={mockFields} params={mockParams} page={mockPage} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.ORDER_MANAGEMENT)).toBeInTheDocument();
  });

  it("should pass fields and params to variant component", () => {
    render(<OrderManagement fields={mockFields} params={mockParams} page={mockPage} />);

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.ORDER_MANAGEMENT);
    expect(variant).toBeInTheDocument();
    expect(variant).toHaveTextContent("OrderManagementDefaultVariant");
  });

  it("should handle empty fields", () => {
    const emptyFields = {} as IOrderManagementFields;

    render(<OrderManagement fields={emptyFields} params={mockParams} page={mockPage} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.ORDER_MANAGEMENT)).toBeInTheDocument();
  });

  it("should handle missing fields gracefully", () => {
    const partialFields = {
      Title: { value: "Orders" },
    } as unknown as IOrderManagementFields;

    render(<OrderManagement fields={partialFields} params={mockParams} page={mockPage} />);

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.ORDER_MANAGEMENT)).toBeInTheDocument();
  });
});
