import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentRendering, Page } from "@sitecore-content-sdk/nextjs";

import FeaturedContentTile from "components/core/FeaturedContentTile/FeaturedContentTile";
import { FeaturedContentTileDefaultVariant } from "components/core/FeaturedContentTile/variants/FeaturedContentTileDefault.variant";
import type { IFeaturedContentTileFields } from "components/core/FeaturedContentTile/FeaturedContentTile.type";
import type { ComponentProps } from "@/lib/component-props";
import { TEST_CASE_DATA_IDS } from "../../../../helpers/enums";
import * as dashboardAnalytics from "@/lib/dashboardAnalytics";

vi.mock("@/lib/dashboardAnalytics", () => ({
  trackDashboardFeaturedContentClick: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/dashboard",
}));

vi.mock("@/components/shared/link-render/LinkRender", () => ({
  LinkRender: ({
    children,
    className,
    field,
    showLinkTextWithChildrenPresent,
  }: {
    children?: ReactNode;
    className?: string;
    field?: { value?: { href?: string; target?: string; text?: string } };
    showLinkTextWithChildrenPresent?: boolean;
  }) => (
    <a
      data-testid="cta-link"
      className={className}
      href={field?.value?.href}
      target={field?.value?.target}
      rel={field?.value?.target === "_blank" ? "noopener noreferrer" : undefined}
    >
      {showLinkTextWithChildrenPresent ? field?.value?.text : null}
      {children}
    </a>
  ),
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: () => <span data-testid="external-icon" aria-hidden />,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field, alt, className }: { field?: { value?: { src?: string } }; alt?: string; className?: string }) =>
    field?.value?.src ? (
      <img src={field.value.src} alt={alt ?? ""} data-testid="tile-bg" className={className} />
    ) : null,
  Text: ({ field, tag: Tag = "span" }: { field?: { value?: string }; tag?: keyof JSX.IntrinsicElements }) => (
    <Tag>{field?.value ?? ""}</Tag>
  ),
  RichText: ({ field }: { field?: { value?: string } }) =>
    field?.value ? <div data-testid="rich-desc">{field.value}</div> : null,
}));

const rendering = {} as ComponentRendering;

const basePage = { mode: { isEditing: false } } as Page;

const baseParams = {
  styles: "",
  RenderingIdentifier: "fct-test",
} as ComponentProps["params"];

const baseFields: IFeaturedContentTileFields = {
  Visible: { value: true },
  CategoryLabel: { value: "CATEGORY" },
  TileHeading: { value: "Heading" },
  TileDescription: { value: "<p>Body</p>" },
  CTALabel: { value: "Learn More" },
  CTAURL: {
    value: {
      href: "https://example.com/article",
      text: "Learn more we got it",
      linktype: "external",
      url: "https://example.com/article",
    },
  },
  BackgroundImage: {
    value: {
      src: "https://example.test/bg.png",
      alt: "Bg",
      width: "537",
      height: "329",
    },
  },
};

describe("FeaturedContentTile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with featured-content-tile test id", () => {
    render(
      <FeaturedContentTile fields={baseFields} params={baseParams} page={basePage} rendering={rendering} />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE)).toBeInTheDocument();
  });

  it("shows empty hint when fields are null", () => {
    render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={null}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByText("Featured content tile")).toBeInTheDocument();
  });

  it("returns null for visitors when params.HideTile is truthy", () => {
    const params = { ...baseParams, HideTile: true } as ComponentProps["params"];
    const { container } = render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={baseFields}
        params={params}
        page={basePage}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("still renders when fields.Visible is false", () => {
    const fields = { ...baseFields, Visible: { value: false } };
    render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE)).toBeInTheDocument();
    expect(screen.getByText("Heading")).toBeInTheDocument();
  });

  it("still renders in editing mode when HideTile is truthy", () => {
    const params = { ...baseParams, HideTile: true } as ComponentProps["params"];
    const page = { mode: { isEditing: true } } as Page;

    render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={baseFields}
        params={params}
        page={page}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE)).toBeInTheDocument();
    expect(screen.getByText("Heading")).toBeInTheDocument();
  });

  it("opens CTA in a new tab via link target", () => {
    render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    const link = screen.getByTestId("cta-link");
    expect(link).toHaveAttribute("href", "https://example.com/article");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("omits optional text blocks when category, heading, and description are empty", () => {
    const fields = {
      ...baseFields,
      CategoryLabel: { value: "" },
      TileHeading: { value: "" },
      TileDescription: { value: "" },
    };

    render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.queryByText("CATEGORY")).not.toBeInTheDocument();
    expect(screen.queryByTestId("rich-desc")).not.toBeInTheDocument();
  });

  it("does not render CTA when href or label is missing", () => {
    const fields = {
      ...baseFields,
      CTAURL: { value: { href: "", text: "", linktype: "external", url: "" } },
    };

    render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.queryByTestId("cta-link")).not.toBeInTheDocument();
  });

  it("renders without background image when src is empty", () => {
    const fields = {
      ...baseFields,
      BackgroundImage: { value: { src: "", alt: "", width: "537", height: "329" } },
    };

    render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.queryByTestId("tile-bg")).not.toBeInTheDocument();
    expect(screen.getByText("Heading")).toBeInTheDocument();
  });

  it("tracks CTA clicks for visitors", () => {
    render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    fireEvent.click(screen.getByTestId("cta-link"));

    expect(dashboardAnalytics.trackDashboardFeaturedContentClick).toHaveBeenCalledWith(
      expect.objectContaining({
        tileHeading: "Heading",
        categoryLabel: "CATEGORY",
        linkUrl: expect.stringContaining("example.com"),
      })
    );
  });

  it("does not track CTA clicks in editing mode", () => {
    const page = { mode: { isEditing: true } } as Page;

    render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={baseFields}
        params={baseParams}
        page={page}
      />
    );

    fireEvent.click(screen.getByTestId("cta-link"));

    expect(dashboardAnalytics.trackDashboardFeaturedContentClick).not.toHaveBeenCalled();
  });

  it("uses href fallback when URL constructor throws", () => {
    const originalUrl = URL;
    vi.stubGlobal(
      "URL",
      class BrokenUrl {
        constructor() {
          throw new TypeError("Invalid URL");
        }
      } as unknown as typeof URL
    );

    render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    fireEvent.click(screen.getByTestId("cta-link"));

    expect(dashboardAnalytics.trackDashboardFeaturedContentClick).toHaveBeenCalledWith(
      expect.objectContaining({ linkUrl: "https://example.com/article" })
    );

    vi.stubGlobal("URL", originalUrl);
  });

  it("returns original CTA field when value is not a link object", () => {
    const fields = {
      ...baseFields,
      CTAURL: { value: "not-an-object" as unknown as typeof baseFields.CTAURL.value },
    };

    render(
      <FeaturedContentTileDefaultVariant
        testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT_TILE}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.queryByTestId("cta-link")).not.toBeInTheDocument();
  });
});
