import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderDetail from "components/core/OrderDetail/OrderDetail";
import { TEST_CASE_DATA_IDS } from "../../../../helpers/enums";
import type { IOrderDetailFields } from "components/core/OrderDetail/OrderDetail.type";
import type { ComponentProps } from "@/lib/component-props";

vi.mock("components/core/OrderDetail/variants/OrderDetailDefault.variant", () => ({
  OrderDetailDefaultVariant: ({
    testId,
    fields,
  }: {
    testId: string;
    fields: IOrderDetailFields;
  }) => <div data-testid={testId}>OrderDetailDefaultVariant</div>,
}));

describe("OrderDetail", () => {
  const mockParams = {
    styles: "test-styles",
    RenderingIdentifier: "test-id",
  };

  const mockPage = {
    mode: { isEditing: false, isPreview: false },
  } as unknown as ComponentProps["page"];

  const mockRendering = {} as ComponentProps["rendering"];

  const mockFields: IOrderDetailFields = {
    OrderNumberLabel: { value: "Order #" },
    PanelTitle: { value: "Order details" },
  };

  it("should render component with test id", () => {
    render(
      <OrderDetail
        fields={mockFields}
        params={mockParams}
        page={mockPage}
        rendering={mockRendering}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.ORDER_DETAIL)).toBeInTheDocument();
  });

  it("should pass fields and params to variant component", () => {
    render(
      <OrderDetail
        fields={mockFields}
        params={mockParams}
        page={mockPage}
        rendering={mockRendering}
      />
    );

    const variant = screen.getByTestId(TEST_CASE_DATA_IDS.ORDER_DETAIL);
    expect(variant).toBeInTheDocument();
    expect(variant).toHaveTextContent("OrderDetailDefaultVariant");
  });

  it("should handle empty fields", () => {
    const emptyFields = {} as IOrderDetailFields;

    render(
      <OrderDetail
        fields={emptyFields}
        params={mockParams}
        page={mockPage}
        rendering={mockRendering}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.ORDER_DETAIL)).toBeInTheDocument();
  });

  it("should handle missing fields gracefully", () => {
    const partialFields = {
      OrderNumberLabel: { value: "Order #" },
    } as unknown as IOrderDetailFields;

    render(
      <OrderDetail
        fields={partialFields}
        params={mockParams}
        page={mockPage}
        rendering={mockRendering}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.ORDER_DETAIL)).toBeInTheDocument();
  });
});
