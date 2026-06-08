import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CategoryPromptDropdown } from "@/components/core/GlobalSearch/components/CategoryPromptDropdown";
import type { IGlobalSearchCategory } from "@/components/core/GlobalSearch/GlobalSearch.type";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => (key === "global_sort_list" ? "in" : key),
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    onPress,
    ...rest
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" onClick={onPress} {...rest}>
      {children}
    </button>
  ),
}));

vi.mock("components/shared/icons/ChevronRightIcon", () => ({
  default: () => <span data-testid="chevron-right" />,
}));

const categories: IGlobalSearchCategory[] = [
  {
    id: "cat-1",
    name: "Products",
    fields: { Title: { value: "Products" } },
  },
  {
    id: "cat-2",
    name: "Fallback name",
    fields: {},
  },
];

describe("CategoryPromptDropdown", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when query is blank", () => {
    const { container } = render(
      <CategoryPromptDropdown
        searchQuery="   "
        categories={categories}
        highlightedIndex={0}
        onExecuteSearch={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when there are no categories", () => {
    const { container } = render(
      <CategoryPromptDropdown
        searchQuery="belt"
        categories={[]}
        highlightedIndex={0}
        onExecuteSearch={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders category options and executes search on press", async () => {
    const user = userEvent.setup();
    const onExecuteSearch = vi.fn();

    render(
      <CategoryPromptDropdown
        searchQuery="belt"
        categories={categories}
        highlightedIndex={0}
        onExecuteSearch={onExecuteSearch}
      />
    );

    expect(screen.getByRole("listbox", { name: "Select search category" })).toBeInTheDocument();
    expect(screen.getByText(/belt/)).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Fallback name")).toBeInTheDocument();

    await user.click(screen.getAllByRole("option")[0]!);
    expect(onExecuteSearch).toHaveBeenCalledWith(categories[0]);
  });

  it("omits activedescendant when highlighted index is out of range", () => {
    render(
      <CategoryPromptDropdown
        searchQuery="belt"
        categories={categories}
        highlightedIndex={5}
        onExecuteSearch={vi.fn()}
      />
    );

    expect(screen.getByRole("listbox")).not.toHaveAttribute("aria-activedescendant");
  });
});
