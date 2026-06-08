import type { FormEvent } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchFormContent } from "@/components/core/GlobalSearch/components/SearchFormContent";
import type {
  IGlobalSearchCategory,
  IGlobalSearchFields,
} from "@/components/core/GlobalSearch/GlobalSearch.type";

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

vi.mock("@/components/ui/Input", () => ({
  default: (props: React.ComponentProps<"input">) => <input {...props} />,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ alt }: { alt?: string }) => <img alt={alt ?? ""} data-testid="search-icon" />,
  Text: ({ field }: { field?: { value?: string } }) => <span>{field?.value ?? ""}</span>,
}));

vi.mock("components/shared/icons/ChevronDownIcon", () => ({
  default: () => <span data-testid="chevron-down" />,
}));

vi.mock("components/shared/icons/ChevronUpIcon", () => ({
  default: () => <span data-testid="chevron-up" />,
}));

const fields: IGlobalSearchFields = {
  SearchTitle: { value: "Search type" },
  SearchPlaceholder: { value: "Search..." },
  SearchIcon: { value: { src: "/search.svg", alt: "Search" } },
  Categories: [],
};

const categories: IGlobalSearchCategory[] = [
  {
    id: "cat-products",
    fields: { Title: { value: "Products" } },
  },
];

const baseProps = {
  fields,
  categories,
  selectedCategory: null as IGlobalSearchCategory | null,
  searchQuery: "",
  setSearchQuery: vi.fn(),
  isDropdownOpen: false,
  setIsDropdownOpen: vi.fn(),
  handleCategorySelect: vi.fn(),
  handleSearchSubmit: vi.fn((e: FormEvent) => e.preventDefault()),
  placeholder: "Find items",
};

describe("SearchFormContent", () => {
  it("toggles category dropdown from type selector by default", async () => {
    const user = userEvent.setup();
    const setIsDropdownOpen = vi.fn();

    render(<SearchFormContent {...baseProps} setIsDropdownOpen={setIsDropdownOpen} />);

    await user.click(screen.getByRole("button", { name: "Search type" }));
    expect(setIsDropdownOpen).toHaveBeenCalledWith(true);
  });

  it("uses custom type selector handler when provided", async () => {
    const user = userEvent.setup();
    const onTypeSelectorPress = vi.fn();
    const setIsDropdownOpen = vi.fn();

    render(
      <SearchFormContent
        {...baseProps}
        onTypeSelectorPress={onTypeSelectorPress}
        setIsDropdownOpen={setIsDropdownOpen}
      />
    );

    await user.click(screen.getByRole("button", { name: "Search type" }));
    expect(onTypeSelectorPress).toHaveBeenCalled();
    expect(setIsDropdownOpen).not.toHaveBeenCalled();
  });

  it("shows selected category title and category list when dropdown is open", async () => {
    const user = userEvent.setup();
    const handleCategorySelect = vi.fn();

    render(
      <SearchFormContent
        {...baseProps}
        isDropdownOpen
        selectedCategory={categories[0]}
        handleCategorySelect={handleCategorySelect}
      />
    );

    expect(screen.getAllByText("Products").length).toBeGreaterThan(0);
    expect(screen.getByTestId("chevron-up")).toBeInTheDocument();
    const categoryButtons = screen.getAllByRole("button", { name: "Products" });
    await user.click(categoryButtons[categoryButtons.length - 1]!);
    expect(handleCategorySelect).toHaveBeenCalledWith(categories[0]);
  });

  it("uses search icon button when onSearchIconPress is provided", async () => {
    const user = userEvent.setup();
    const onSearchIconPress = vi.fn();

    render(<SearchFormContent {...baseProps} onSearchIconPress={onSearchIconPress} />);

    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(onSearchIconPress).toHaveBeenCalled();
  });

  it("exposes listbox aria attributes when suggestions are open", () => {
    render(
      <SearchFormContent
        {...baseProps}
        searchQuery="belt"
        suggestionsOpen
        highlightedOptionId="global-search-suggestion-0"
      />
    );

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", "global-search-suggestions-listbox");
    expect(input).toHaveAttribute("aria-activedescendant", "global-search-suggestion-0");
  });
});
