import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentRendering, Page } from "@sitecore-content-sdk/nextjs";

import UserActionTiles from "components/core/UserActionTiles/UserActionTiles";
import { UserActionTilesDefaultVariant } from "components/core/UserActionTiles/variants/UserActionTilesDefault.variant";
import type { IUserActionTilesFields, IUserActionTileItem } from "components/core/UserActionTiles/UserActionTiles.type";
import type { ComponentProps } from "@/lib/component-props";
import { TEST_CASE_DATA_IDS } from "../../../../helpers/enums";
import * as dashboardAnalytics from "@/lib/dashboardAnalytics";

vi.mock("@/lib/dashboardAnalytics", () => ({
  trackDashboardNavigationPillClick: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/dashboard",
}));

vi.mock("@/components/image/LocalizedImageFieldLink", () => ({
  LocalizedImageFieldLink: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <a href="/en/orders-management/orders" data-testid="localized-tile-link" className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: () => <span data-testid="chevron-icon-mock" aria-hidden />,
}));

vi.mock("@sitecore-content-sdk/nextjs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@sitecore-content-sdk/nextjs")>();
  return {
    ...actual,
    NextImage: ({ field }: { field?: { value?: { src?: string; alt?: string } } }) =>
      field?.value?.src ? (
        <img src={field.value.src} alt={field.value.alt ?? ""} data-testid="tile-next-image" />
      ) : null,
    Text: ({ field, tag: Tag = "span" }: { field?: { value?: string }; tag?: keyof JSX.IntrinsicElements }) => (
      <Tag>{field?.value ?? ""}</Tag>
    ),
  };
});

const rendering = {} as ComponentRendering;

const basePage = { mode: { isEditing: false } } as Page;

const baseParams = {
  styles: "",
  RenderingIdentifier: "uat-test",
} as ComponentProps["params"];

const tile = (overrides: Partial<IUserActionTileItem>): IUserActionTileItem => ({
  id: overrides.id ?? "tile-id",
  displayName: overrides.displayName,
  fields: overrides.fields,
});

describe("UserActionTiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with user-action-tiles test id", () => {
    const fields: IUserActionTilesFields = {
      TilesSelection: [
        tile({
          id: "a",
          fields: {
            TileTitle: { value: "Alpha" },
            TileDescription: { value: "Desc A" },
            Visible: { value: true },
            SortOrder: { value: "10" },
            TileURL: { value: { href: "/en/orders-management/orders" } },
            TileIcon: { value: { src: "https://example.test/a.svg", alt: "A" } },
          },
        }),
      ],
    };

    render(
      <UserActionTiles fields={fields} params={baseParams} page={basePage} rendering={rendering} />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.USER_ACTION_TILES)).toBeInTheDocument();
  });

  it("shows empty hint when fields are null", () => {
    render(
      <UserActionTilesDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_ACTION_TILES}
        fields={null}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByText("User action tiles")).toBeInTheDocument();
  });

  it("returns null for visitors when HideUserActionTiles is enabled on params", () => {
    const fields: IUserActionTilesFields = {
      TilesSelection: [
        tile({
          id: "x",
          fields: {
            TileTitle: { value: "Hidden row" },
            TileDescription: { value: "d" },
            TileURL: { value: { href: "/en/x" } },
            TileIcon: { value: { src: "https://example.test/x.svg", alt: "x" } },
          },
        }),
      ],
    };

    const params = { ...baseParams, HideUserActionTiles: true } as ComponentProps["params"];

    const { container } = render(
      <UserActionTilesDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_ACTION_TILES}
        fields={fields}
        params={params}
        page={basePage}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("still renders in editing mode when HideUserActionTiles is true", () => {
    const fields: IUserActionTilesFields = {
      TilesSelection: [
        tile({
          id: "e1",
          fields: {
            TileTitle: { value: "Edit mode tile" },
            TileDescription: { value: "d" },
            TileURL: { value: { href: "/en/e" } },
            TileIcon: { value: { src: "https://example.test/e.svg", alt: "e" } },
          },
        }),
      ],
    };

    const params = { ...baseParams, HideUserActionTiles: true } as ComponentProps["params"];
    const page = { mode: { isEditing: true } } as Page;

    render(
      <UserActionTilesDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_ACTION_TILES}
        fields={fields}
        params={params}
        page={page}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.USER_ACTION_TILES)).toBeInTheDocument();
    expect(screen.getByText("Edit mode tile")).toBeInTheDocument();
  });

  it("sorts tiles by SortOrder ascending with stable tie-breaker", () => {
    const fields: IUserActionTilesFields = {
      TilesSelection: [
        tile({
          id: "second",
          fields: {
            TileTitle: { value: "Second in CMS" },
            TileDescription: { value: "b" },
            SortOrder: { value: "20" },
            TileURL: { value: { href: "/en/b" } },
            TileIcon: { value: { src: "https://example.test/b.svg", alt: "b" } },
          },
        }),
        tile({
          id: "first",
          fields: {
            TileTitle: { value: "First in CMS" },
            TileDescription: { value: "a" },
            SortOrder: { value: "10" },
            TileURL: { value: { href: "/en/a" } },
            TileIcon: { value: { src: "https://example.test/a.svg", alt: "a" } },
          },
        }),
      ],
    };

    const { container } = render(
      <UserActionTilesDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_ACTION_TILES}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    const list = container.querySelector('[role="list"]');
    expect(list).toBeTruthy();
    const titles = Array.from(list!.querySelectorAll("span")).map((el) => el.textContent?.trim()).filter(Boolean);
    expect(titles.indexOf("First in CMS")).toBeLessThan(titles.indexOf("Second in CMS"));
  });

  it("filters out tiles with Visible explicitly false for visitors", () => {
    const fields: IUserActionTilesFields = {
      TilesSelection: [
        tile({
          id: "gone",
          fields: {
            TileTitle: { value: "Hidden" },
            TileDescription: { value: "x" },
            Visible: { value: false },
            TileURL: { value: { href: "/en/hidden" } },
            TileIcon: { value: { src: "https://example.test/h.svg", alt: "h" } },
          },
        }),
        tile({
          id: "shown",
          fields: {
            TileTitle: { value: "Visible" },
            TileDescription: { value: "y" },
            Visible: { value: true },
            TileURL: { value: { href: "/en/ok" } },
            TileIcon: { value: { src: "https://example.test/v.svg", alt: "v" } },
          },
        }),
      ],
    };

    render(
      <UserActionTilesDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_ACTION_TILES}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("returns null when every tile is filtered out", () => {
    const fields: IUserActionTilesFields = {
      TilesSelection: [
        tile({
          id: "hidden",
          fields: {
            TileTitle: { value: "Hidden" },
            Visible: { value: false },
            TileURL: { value: { href: "/en/hidden" } },
          },
        }),
      ],
    };

    const { container } = render(
      <UserActionTilesDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_ACTION_TILES}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders non-linked tile when href is missing", () => {
    const fields: IUserActionTilesFields = {
      TilesSelection: [
        tile({
          id: "plain",
          fields: {
            TileTitle: { value: "Plain tile" },
            TileDescription: { value: "No link" },
            TileURL: { value: {} },
          },
        }),
      ],
    };

    render(
      <UserActionTilesDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_ACTION_TILES}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.queryByTestId("localized-tile-link")).not.toBeInTheDocument();
    expect(screen.getByText("Plain tile")).toBeInTheDocument();
  });

  it("tracks navigation pill clicks on linked tiles", () => {
    const fields: IUserActionTilesFields = {
      TilesSelection: [
        tile({
          id: "linked",
          displayName: "Orders",
          fields: {
            TileTitle: { value: "Orders" },
            TileURL: { value: { href: "/en/orders-management/orders" } },
          },
        }),
      ],
    };

    const { container } = render(
      <UserActionTilesDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_ACTION_TILES}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    fireEvent.click(screen.getByTestId("localized-tile-link"));

    expect(dashboardAnalytics.trackDashboardNavigationPillClick).toHaveBeenCalledWith(
      expect.objectContaining({ pillLabel: "Orders", pillPosition: 1 })
    );
  });

  it("shows title in editing mode when TileTitle is empty", () => {
    const fields: IUserActionTilesFields = {
      TilesSelection: [
        tile({
          id: "edit-tile",
          fields: {
            TileTitle: { value: "" },
            TileDescription: { value: "Desc" },
            TileURL: { value: { href: "/en/x" } },
          },
        }),
      ],
    };
    const page = { mode: { isEditing: true } } as Page;

    render(
      <UserActionTilesDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_ACTION_TILES}
        fields={fields}
        params={baseParams}
        page={page}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.USER_ACTION_TILES)).toBeInTheDocument();
  });

  it("tracks pill clicks in editing mode because editing state is not wired to analytics guard", () => {
    const fields: IUserActionTilesFields = {
      TilesSelection: [
        tile({
          id: "linked",
          fields: {
            TileTitle: { value: "Orders" },
            TileURL: { value: { href: "/en/orders-management/orders" } },
          },
        }),
      ],
    };
    const page = { mode: { isEditing: true } } as Page;

    render(
      <UserActionTilesDefaultVariant
        testId={TEST_CASE_DATA_IDS.USER_ACTION_TILES}
        fields={fields}
        params={baseParams}
        page={page}
      />
    );

    fireEvent.click(screen.getByTestId("localized-tile-link"));
    expect(dashboardAnalytics.trackDashboardNavigationPillClick).toHaveBeenCalledWith(
      expect.objectContaining({ pillLabel: "Orders", pillPosition: 1 })
    );
  });
});
