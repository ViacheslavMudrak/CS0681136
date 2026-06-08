import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { useState } from "react";

import { OrderDetailPagination } from "@/components/core/OrderDetail/partial/OrderDetailPagination";

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: (): ReactElement => <span data-testid="pagination-icon" />,
}));

vi.mock("@/components/ui/Button", () => ({
  __esModule: true,
  default: ({
    children,
    onPress,
    isDisabled,
    btnVariant: _btnVariant,
    ...rest
  }: {
    children?: ReactNode;
    onPress?: () => void;
    isDisabled?: boolean;
    btnVariant?: string;
  } & ButtonHTMLAttributes<HTMLButtonElement>): ReactElement => (
    <button type="button" disabled={isDisabled} onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

function PaginationHarness({
  initialPage = 1,
  initialPageSize = 10,
  totalResults = 100,
  cmsDefaultPageSize = 5,
}: {
  initialPage?: number;
  initialPageSize?: number;
  totalResults?: number;
  cmsDefaultPageSize?: number;
}) {
  const [safePage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const clampedPage = Math.min(safePage, totalPages);

  return (
    <OrderDetailPagination
      totalResults={totalResults}
      safePage={clampedPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      setCurrentPage={setCurrentPage}
      totalPages={totalPages}
      pageSizeOptions={[10, 25, 50]}
      cmsDefaultPageSize={cmsDefaultPageSize}
      resultSummaryPattern={{ value: "{start}–{end} of {total}" }}
    />
  );
}

describe("OrderDetailPagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when totalResults does not exceed cms default page size", () => {
    const { container } = render(
      <OrderDetailPagination
        totalResults={40}
        safePage={1}
        pageSize={50}
        setPageSize={vi.fn()}
        setCurrentPage={vi.fn()}
        totalPages={1}
        pageSizeOptions={[50]}
        cmsDefaultPageSize={50}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders summary, rows select, and nav when pagination applies", () => {
    render(<PaginationHarness />);

    expect(screen.getByText(/1–10 of 100/)).toBeInTheDocument();
    expect(screen.getByLabelText("Rows per page")).toHaveValue("10");
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).not.toBeDisabled();
  });

  it("changes page size and resets to page 1", async () => {
    const user = userEvent.setup();
    render(<PaginationHarness initialPage={3} initialPageSize={10} />);

    await user.selectOptions(screen.getByLabelText("Rows per page"), "25");
    expect(screen.getByText(/1–25 of 100/)).toBeInTheDocument();
  });

  it("goes to previous and next page", async () => {
    const user = userEvent.setup();
    render(<PaginationHarness initialPage={2} />);

    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(screen.getByText(/1–10 of 100/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText(/21–30 of 100/)).toBeInTheDocument();
  });

  it("renders ellipsis and highlights current page for large page counts", () => {
    render(
      <OrderDetailPagination
        totalResults={100}
        safePage={5}
        pageSize={10}
        setPageSize={vi.fn()}
        setCurrentPage={vi.fn()}
        totalPages={10}
        pageSizeOptions={[10]}
        cmsDefaultPageSize={5}
      />
    );

    expect(screen.getAllByText("…")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Page 4" })).toBeInTheDocument();
    const current = screen.getByText("5", { selector: '[aria-current="page"]' });
    expect(current).toBeInTheDocument();
  });
});
