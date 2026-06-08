import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentRendering, Page } from "@sitecore-content-sdk/nextjs";

import UtilityLinks from "components/core/UtilityLinks/UtilityLinks";
import { UtilityLinksDefaultVariant } from "components/core/UtilityLinks/variants/UtilityLinksDefault.variant";
import type { IUtilityLinksFields } from "components/core/UtilityLinks/UtilityLinks.type";
import type { ComponentProps } from "@/lib/component-props";
import { TEST_CASE_DATA_IDS } from "../../../../helpers/enums";
import * as dashboardAnalytics from "@/lib/dashboardAnalytics";

vi.mock("@/lib/dashboardAnalytics", () => ({
  trackDashboardUtilityLinkClick: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/dashboard",
}));

vi.mock("@/components/image/LocalizedImageFieldLink", () => ({
  LocalizedImageFieldLink: ({
    children,
    className,
    field,
  }: {
    children: ReactNode;
    className?: string;
    field?: { value?: { href?: string; target?: string } };
  }) => (
    <a
      data-testid="utility-link"
      className={className}
      href={field?.value?.href}
      target={field?.value?.target}
      rel={field?.value?.target === "_blank" ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
}));

vi.mock("@laitram-l-l-c/intralox-ui-components", () => ({
  Icon: () => <span data-testid="chevron-icon" aria-hidden />,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field, className }: { field?: { value?: { src?: string } }; className?: string }) =>
    field?.value?.src ? <img src={field.value.src} alt="" data-testid="link-icon" className={className} /> : null,
  Text: ({ field, tag: Tag = "span" }: { field?: { value?: string }; tag?: keyof JSX.IntrinsicElements }) => (
    <Tag>{field?.value ?? ""}</Tag>
  ),
  RichText: ({ field, tag: Tag = "div" }: { field?: { value?: string }; tag?: keyof JSX.IntrinsicElements }) =>
    field?.value ? <Tag data-testid="rich-description">{field.value}</Tag> : null,
}));

const rendering = {} as ComponentRendering;
const basePage = { mode: { isEditing: false } } as Page;
const baseParams = { styles: "", RenderingIdentifier: "ul-test" } as ComponentProps["params"];

const baseFields: IUtilityLinksFields = {
  Icon: { value: { src: "https://example.test/i.svg", alt: "" } },
  Label: { value: "CalcLab" },
  Description: { value: "Optional short description space." },
  Visible: { value: true },
  SortOrder: { value: 1 },
  URL: {
    value: {
      href: "/en/profile-setting",
      linktype: "internal",
    },
  },
};

describe("UtilityLinks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with utility-links test id", () => {
    render(
      <UtilityLinks fields={baseFields} params={baseParams} page={basePage} rendering={rendering} />
    );
    expect(screen.getByTestId(TEST_CASE_DATA_IDS.UTILITY_LINKS)).toBeInTheDocument();
    expect(screen.getByText("CalcLab")).toBeInTheDocument();
  });

  it("shows empty hint when fields are null", () => {
    render(
      <UtilityLinksDefaultVariant
        testId={TEST_CASE_DATA_IDS.UTILITY_LINKS}
        fields={null}
        params={baseParams}
        page={basePage}
      />
    );
    expect(screen.getByText("Utility links")).toBeInTheDocument();
  });

  it("returns null when HideTile is 1", () => {
    const params = { ...baseParams, HideTile: "1" } as ComponentProps["params"];
    const { container } = render(
      <UtilityLinksDefaultVariant
        testId={TEST_CASE_DATA_IDS.UTILITY_LINKS}
        fields={baseFields}
        params={params}
        page={basePage}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("still renders when Visible is false", () => {
    const fields: IUtilityLinksFields = {
      ...baseFields,
      Visible: { value: false },
    };
    render(
      <UtilityLinksDefaultVariant
        testId={TEST_CASE_DATA_IDS.UTILITY_LINKS}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );
    expect(screen.getByTestId(TEST_CASE_DATA_IDS.UTILITY_LINKS)).toBeInTheDocument();
    expect(screen.getByText("CalcLab")).toBeInTheDocument();
  });

  it("wraps card in link with href from URL field", () => {
    render(
      <UtilityLinksDefaultVariant
        testId={TEST_CASE_DATA_IDS.UTILITY_LINKS}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );
    const a = screen.getByTestId("utility-link");
    expect(a).toHaveAttribute("href", "/en/profile-setting");
  });

  it("renders link when URL field exists even if href is empty", () => {
    const fields: IUtilityLinksFields = {
      ...baseFields,
      URL: { value: {} },
    };
    render(
      <UtilityLinksDefaultVariant
        testId={TEST_CASE_DATA_IDS.UTILITY_LINKS}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );
    const a = screen.getByTestId("utility-link");
    expect(a).toBeInTheDocument();
    expect(a.getAttribute("href")).toBeFalsy();
    expect(screen.getByText("CalcLab")).toBeInTheDocument();
  });

  it("still renders in editing mode when HideTile is set", () => {
    const params = { ...baseParams, HideTile: "1" } as ComponentProps["params"];
    const page = { mode: { isEditing: true } } as Page;

    render(
      <UtilityLinksDefaultVariant
        testId={TEST_CASE_DATA_IDS.UTILITY_LINKS}
        fields={baseFields}
        params={params}
        page={page}
      />
    );

    expect(screen.getByTestId(TEST_CASE_DATA_IDS.UTILITY_LINKS)).toBeInTheDocument();
  });

  it("renders static card when URL field is missing", () => {
    const fields = { ...baseFields, URL: undefined };

    render(
      <UtilityLinksDefaultVariant
        testId={TEST_CASE_DATA_IDS.UTILITY_LINKS}
        fields={fields}
        params={baseParams}
        page={basePage}
      />
    );

    expect(screen.queryByTestId("utility-link")).not.toBeInTheDocument();
    expect(screen.getByText("CalcLab")).toBeInTheDocument();
  });

  it("tracks utility link clicks", () => {
    render(
      <UtilityLinksDefaultVariant
        testId={TEST_CASE_DATA_IDS.UTILITY_LINKS}
        fields={baseFields}
        params={baseParams}
        page={basePage}
      />
    );

    fireEvent.click(screen.getByTestId("utility-link"));

    expect(dashboardAnalytics.trackDashboardUtilityLinkClick).toHaveBeenCalledWith(
      expect.objectContaining({
        linkLabel: "CalcLab",
        linkUrl: expect.stringContaining("profile-setting"),
      })
    );
  });
});
