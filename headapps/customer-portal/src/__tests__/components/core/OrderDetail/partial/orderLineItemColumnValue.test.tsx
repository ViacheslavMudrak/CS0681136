import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import type { OrderDetailLineItem } from "@/components/core/OrderDetail/OrderDetail.type";
import { renderOrderLineItemColumnValue } from "@/components/core/OrderDetail/partial/orderLineItemColumnValue";

const money = { value: 12.34, currency: "USD", displayValue: "$12.34" };

function renderCell(keyNorm: string, item: OrderDetailLineItem, locale = "en-US") {
  return render(<div data-testid="cell">{renderOrderLineItemColumnValue(keyNorm, item, locale)}</div>);
}

describe("renderOrderLineItemColumnValue", () => {
  it("formats extended net price columns", () => {
    const item: OrderDetailLineItem = { extendedNetPrice: money };
    renderCell("EXTENDED NET PRICE", item);
    expect(screen.getByTestId("cell")).toHaveTextContent(/\$12\.34|12\.34/);
  });

  it("formats net unit price columns", () => {
    const item: OrderDetailLineItem = { netUnitPrice: money };
    renderCell("NET UNIT PRICE", item);
    expect(screen.getByTestId("cell")).toHaveTextContent(/\$12\.34|12\.34/);
  });

  it("formats net unit price when display value has no dollar sign", () => {
    const item: OrderDetailLineItem = {
      netUnitPrice: { value: 12.34, currency: "USD", displayValue: "12.34" },
    };

    renderCell("NET UNIT PRICE", item);

    expect(screen.getByTestId("cell")).toHaveTextContent("$12.34");
  });

  it("removes country prefix from net unit price display values", () => {
    const item: OrderDetailLineItem = {
      netUnitPrice: { value: 12.34, currency: "USD", displayValue: "US$12.34" },
    };

    renderCell("NET UNIT PRICE", item);

    expect(screen.getByTestId("cell")).toHaveTextContent("$12.34");
    expect(screen.getByTestId("cell")).not.toHaveTextContent("US$12.34");
  });

  it("removes country prefix from formatted extended net price fallback", () => {
    const item: OrderDetailLineItem = {
      extendedNetPrice: { value: 56.78, currency: "CAD", displayValue: "" },
    };

    renderCell("EXTENDED NET PRICE", item);

    expect(screen.getByTestId("cell")).toHaveTextContent("$56.78");
    expect(screen.getByTestId("cell")).not.toHaveTextContent("CA$56.78");
  });

  it("renders em dash when quantity column has no quantity", () => {
    renderCell("QUANTITY", {});
    expect(screen.getByTestId("cell")).toHaveTextContent("—");
  });

  it("renders quantity value for QUANTITY and QTY keys", () => {
    const item: OrderDetailLineItem = { quantity: { value: 10, unit: "EACH" } };
    renderCell("QUANTITY (EACH)", item);
    expect(screen.getByTestId("cell")).toHaveTextContent("10");

    const { unmount } = render(
      <div data-testid="q2">{renderOrderLineItemColumnValue("QTY", item, "en-US")}</div>
    );
    expect(screen.getByTestId("q2")).toHaveTextContent("10");
    unmount();
  });

  it("renders product type or dash", () => {
    renderCell("PRODUCT TYPE", { productType: "Belt" });
    expect(screen.getByTestId("cell")).toHaveTextContent("Belt");

    renderCell("PRODUCT TYPE", {});
    expect(screen.getAllByTestId("cell").pop()).toHaveTextContent("—");
  });

  it("renders attribute list or dash", () => {
    const item: OrderDetailLineItem = {
      productAttributes: [
        { key: "Width", value: "24", unit: "in" },
        { key: "Color", value: "Blue", unit: "" },
      ],
    };
    renderCell("ATTRIBUTE LIST", item);
    expect(screen.getByText(/Width: 24 in/)).toBeInTheDocument();
    expect(screen.getByText(/Color: Blue/)).toBeInTheDocument();

    renderCell("ATTRIBUTE LIST", { productAttributes: [] });
    const cells = screen.getAllByTestId("cell");
    expect(cells[cells.length - 1]).toHaveTextContent("—");
  });

  it("returns dash for unrecognized columns", () => {
    renderCell("UNKNOWN_METRIC", {});
    expect(screen.getByTestId("cell")).toHaveTextContent("—");
  });
});
