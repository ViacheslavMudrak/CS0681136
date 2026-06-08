import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentRendering, Page } from "@sitecore-content-sdk/nextjs";

import DashboardInfoBanner from "components/core/DashboardInfoBanner/DashboardInfoBanner";
import { DashboardInfoBannerDefaultVariant } from "components/core/DashboardInfoBanner/variants/DashboardInfoBannerDefault.variant";
import type { IDashboardInfoBannerFields } from "components/core/DashboardInfoBanner/DashboardInfoBanner.type";
import type { ComponentProps } from "@/lib/component-props";
import { TEST_CASE_DATA_IDS } from "../../../../helpers/enums";
import * as dashboardAnalytics from "@/lib/dashboardAnalytics";

vi.mock("@/lib/dashboardAnalytics", () => ({
  trackDashboardInfoPanelLinkClick: vi.fn(),
}));

vi.mock("@/components/shared/info-banner/InfoBanner", () => ({
  default: ({
    icon,
    title,
    description,
  }: {
    icon?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
  }) => (
    <div data-testid="info-banner-mock">
      {icon ? <div data-testid="info-banner-icon-slot">{icon}</div> : null}
      <div data-testid="info-banner-title">{title}</div>
      <div data-testid="info-banner-description">{description}</div>
    </div>
  ),
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field }: { field?: { value?: { src?: string; alt?: string } } }) =>
    field?.value?.src ? <img src={field.value.src} alt={field.value.alt ?? ""} data-testid="banner-icon" /> : null,
  Text: ({ field, tag: Tag = "span" }: { field?: { value?: string }; tag?: keyof JSX.IntrinsicElements }) => (
    <Tag>{field?.value ?? ""}</Tag>
  ),
  RichText: ({ field }: { field?: { value?: string } }) =>
    field?.value ? (
      <div data-testid="banner-rich-text">
        <span>{field.value}</span>
        <a href="https://intralox.com/news">Read more</a>
      </div>
    ) : null,
}));

const rendering = {} as ComponentRendering;

const basePage = { mode: { isEditing: false } } as Page;

const baseParams = {
  styles: "",
  RenderingIdentifier: "dib-test",
} as ComponentProps["params"];

const baseFields: IDashboardInfoBannerFields = {
  PanelVisible: { value: true },
  BannerTitle: { value: "Portal news" },
  BannerDescription: { value: "<p>Short <strong>body</strong></p>" },
  BannerIcon: {
    value: { src: "https://example.test/icon.svg", alt: "Info" },
  },
};

describe("DashboardInfoBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with dashboard test id", () => {
    render(
      <DashboardInfoBanner
        fields={baseFields}
        params={baseParams}
        page={basePage}
        rendering={rendering}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER)).toBeInTheDocument();
  });

  it("shows empty hint when fields are null", () => {
    render(
      <DashboardInfoBannerDefaultVariant
        testId={TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER}
        fields={null}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByText("Dashboard info banner")).toBeInTheDocument();
  });

  it("renders InfoBanner when HideBanner is not set on params", () => {
    render(
      <DashboardInfoBannerDefaultVariant
        testId={TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByTestId("info-banner-mock")).toBeInTheDocument();
    expect(screen.getByText("Portal news")).toBeInTheDocument();
    expect(screen.getByTestId("banner-rich-text")).toHaveTextContent(/Short/);
    expect(screen.getByTestId("banner-icon")).toHaveAttribute("src", "https://example.test/icon.svg");
  });

  it("does not render InfoBanner when params.HideBanner is truthy", () => {
    const params = { ...baseParams, HideBanner: true } as ComponentProps["params"];

    render(
      <DashboardInfoBannerDefaultVariant
        testId={TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER}
        fields={baseFields}
        params={params}
        page={basePage}
      />
    );

    expect(screen.queryByTestId("info-banner-mock")).not.toBeInTheDocument();
  });

  it("shows InfoBanner in editing mode when HideBanner is set", () => {
    const params = { ...baseParams, HideBanner: true } as ComponentProps["params"];
    const page = { mode: { isEditing: true } } as Page;

    render(
      <DashboardInfoBannerDefaultVariant
        testId={TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER}
        fields={baseFields}
        params={params}
        page={page}
      />
    );

    expect(screen.getByTestId("info-banner-mock")).toBeInTheDocument();
  });

  it("renders banner without icon when BannerIcon has no src", () => {
    const fields = {
      ...baseFields,
      BannerIcon: { value: { src: "", alt: "Info" } },
    };

    render(
      <DashboardInfoBannerDefaultVariant
        testId={TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.queryByTestId("banner-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("info-banner-mock")).toBeInTheDocument();
  });

  it("omits title slot when BannerTitle is empty", () => {
    const fields = { ...baseFields, BannerTitle: { value: "" } };

    render(
      <DashboardInfoBannerDefaultVariant
        testId={TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByTestId("info-banner-title")).toBeEmptyDOMElement();
  });

  it("omits description slot when BannerDescription is null", () => {
    const fields = { ...baseFields, BannerDescription: null as unknown as typeof baseFields.BannerDescription };

    render(
      <DashboardInfoBannerDefaultVariant
        testId={TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.getByTestId("info-banner-description")).toBeEmptyDOMElement();
  });

  it("tracks link clicks in banner description", () => {
    render(
      <DashboardInfoBannerDefaultVariant
        testId={TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    fireEvent.click(screen.getByRole("link", { name: "Read more" }));

    expect(dashboardAnalytics.trackDashboardInfoPanelLinkClick).toHaveBeenCalledWith(
      expect.objectContaining({
        linkText: "Read more",
        linkUrl: expect.stringContaining("intralox.com"),
      })
    );
  });

  it("does not track description link clicks in editing mode", () => {
    const page = { mode: { isEditing: true } } as Page;

    render(
      <DashboardInfoBannerDefaultVariant
        testId={TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER}
        fields={baseFields}
        params={baseParams}
        page={page}
      />
    );

    fireEvent.click(screen.getByRole("link", { name: "Read more" }));

    expect(dashboardAnalytics.trackDashboardInfoPanelLinkClick).not.toHaveBeenCalled();
  });

  it("tracks relative links using catch fallback when URL parsing fails", () => {
    const originalUrl = URL;
    // Force URL constructor to throw for this test only.
    vi.stubGlobal(
      "URL",
      class BrokenUrl {
        constructor() {
          throw new TypeError("Invalid URL");
        }
      } as unknown as typeof URL
    );

    render(
      <DashboardInfoBannerDefaultVariant
        testId={TEST_CASE_DATA_IDS.DASHBOARD_INFO_BANNER}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    fireEvent.click(screen.getByRole("link", { name: "Read more" }));

    expect(dashboardAnalytics.trackDashboardInfoPanelLinkClick).toHaveBeenCalledWith(
      expect.objectContaining({ linkUrl: "https://intralox.com/news" })
    );

    vi.stubGlobal("URL", originalUrl);
  });
});
