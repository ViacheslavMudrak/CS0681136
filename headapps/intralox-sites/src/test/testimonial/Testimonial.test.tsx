import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import type { ComponentRendering, Page } from "@sitecore-content-sdk/nextjs";
import { Default } from "components/testimonial/Testimonial";
import type {
  TestimonialFieldsFlat,
  TestimonialFieldsGraphQL,
  TestimonialProps,
} from "components/testimonial/Testimonial.type";
import { TESTIMONIAL_ARIA_FALLBACK } from "components/testimonial/testimonialUtils";

vi.mock("@sitecore-content-sdk/nextjs", async () => {
  const { testimonialSitecoreSdkMock } =
    await import("src/test/mocks/viteSafeMocks");
  return testimonialSitecoreSdkMock();
});

const defaultParams = {
  styles: "",
  RenderingIdentifier: "test-rendering-id",
};
const defaultPage = { mode: { isEditing: false } } as unknown as Page;
const defaultRendering = {
  displayName: "Testimonial",
} as unknown as ComponentRendering;

describe("Testimonial Default", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty-hint when fields is null", () => {
    render(
      <Default
        fields={null as unknown as TestimonialFieldsFlat}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    const hint = screen.getByText(TESTIMONIAL_ARIA_FALLBACK);
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveClass("is-empty-hint");
  });

  it("renders empty-hint when fields is undefined", () => {
    render(
      <Default
        fields={undefined as unknown as TestimonialFieldsFlat}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    expect(screen.getByText(TESTIMONIAL_ARIA_FALLBACK)).toBeInTheDocument();
  });

  it("renders empty-hint for GraphQL shape with no datasource", () => {
    const graphqlEmpty = { data: {} } as TestimonialFieldsGraphQL;
    render(
      <Default
        fields={graphqlEmpty}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    expect(screen.getByText(TESTIMONIAL_ARIA_FALLBACK)).toBeInTheDocument();
  });

  it("applies params.styles and params.RenderingIdentifier to wrapper", () => {
    render(
      <Default
        fields={null as unknown as TestimonialFieldsFlat}
        params={{
          ...defaultParams,
          styles: "custom-class",
          RenderingIdentifier: "my-id",
        }}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    const wrapper = document.getElementById("my-id");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("custom-class");
    expect(wrapper).toHaveClass("component", "testimonial", "mx-auto", "max-w-[80rem]");
  });

  it("renders section with aria-label from Attribution when flat fields have content", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "A great product." },
      Attribution: { value: "Jane Doe" },
    };
    render(
      <Default
        fields={flat}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    const section = screen.getByRole("region", { name: "Jane Doe" });
    expect(section).toBeInTheDocument();
  });

  it("renders section with aria-label from displayName when Attribution is empty", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "Quote only." },
    };
    render(
      <Default
        fields={flat}
        params={defaultParams}
        page={defaultPage}
        rendering={
          { displayName: "My Testimonial" } as unknown as ComponentRendering
        }
      />,
    );
    const section = screen.getByRole("region", { name: "My Testimonial" });
    expect(section).toBeInTheDocument();
  });

  it("uses page surface on figure when ShowBackgroundColor is off", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "No gray." },
    };
    render(
      <Default
        fields={flat}
        params={{ ...defaultParams, ShowBackgroundColor: "0" }}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    const figure = screen.getByRole("group", { name: "No gray." });
    expect(figure).toHaveClass("bg-surface");
    expect(figure).not.toHaveClass("bg-surface-subtle");
  });

  it("keeps white figure when BackgroundColor is Gray but HasBackgroundColor is omitted", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "White surface." },
    };
    render(
      <Default
        fields={flat}
        params={{ ...defaultParams, BackgroundColor: "Gray" }}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    const figure = screen.getByRole("group", { name: "White surface." });
    expect(figure).toHaveClass("bg-surface");
    expect(figure).not.toHaveClass("bg-surface-subtle");
  });

  it("renders testimonial content when flat fields are provided", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "Test quote text." },
      Attribution: { value: "John Doe" },
      JobTitle: { value: "Engineer" },
    };
    render(
      <Default
        fields={flat}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    expect(screen.getByTestId("sdk-richtext")).toHaveTextContent(
      "Test quote text.",
    );
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
  });

  it("applies center alignment when params.Alignment is Center", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "Centered quote." },
    };
    render(
      <Default
        fields={flat}
        params={{ ...defaultParams, Alignment: "Center" }}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    const figure = screen.getByRole("group", { name: "Centered quote." });
    expect(figure).toHaveClass("text-center");
  });

  it("applies center alignment when params.Position uses layout service droplist shape", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "From Position param." },
    };
    render(
      <Default
        fields={flat}
        params={
          {
            ...defaultParams,
            Position: { Value: { value: "Center" } },
          } as TestimonialProps["params"]
        }
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    expect(
      screen.getByRole("group", { name: "From Position param." }),
    ).toHaveClass("text-center");
  });

  it("uses Media Tile section gray when HasBackgroundColor is checked (transparent token)", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "Transparent bg." },
    };
    render(
      <Default
        fields={flat}
        params={{ ...defaultParams, HasBackgroundColor: "1" }}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    const figure = screen.getByRole("group", { name: "Transparent bg." });
    expect(figure).toHaveClass("bg-surface-subtle");
    expect(figure).not.toHaveClass("bg-surface");
  });

  it("uses Media Tile section gray when hasBackgroundColor is camelCase", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "CamelCase param." },
    };
    render(
      <Default
        fields={flat}
        params={{ ...defaultParams, hasBackgroundColor: "1" }}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    const figure = screen.getByRole("group", { name: "CamelCase param." });
    expect(figure).toHaveClass("bg-surface-subtle");
  });

  it("uses Media Tile section gray when HasBackgroundColor is only on rendering.params (partial props params)", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "Layout params only." },
    };
    render(
      <Default
        fields={flat}
        params={defaultParams}
        page={defaultPage}
        rendering={
          {
            ...defaultRendering,
            params: { HasBackgroundColor: "1" },
          } as unknown as ComponentRendering
        }
      />,
    );
    const figure = screen.getByRole("group", { name: "Layout params only." });
    expect(figure).toHaveClass("bg-surface-subtle");
  });

  it("uses white figure by default when background params are omitted", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "Default surface." },
    };
    render(
      <Default
        fields={flat}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    const figure = screen.getByRole("group", { name: "Default surface." });
    expect(figure).toHaveClass("bg-surface");
    expect(figure).not.toHaveClass("bg-surface-subtle");
  });

  it("renders empty-hint when flat fields have no visible content", () => {
    render(
      <Default
        fields={{}}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    expect(screen.getByText(TESTIMONIAL_ARIA_FALLBACK)).toBeInTheDocument();
    expect(screen.getByText(TESTIMONIAL_ARIA_FALLBACK)).toHaveClass(
      "is-empty-hint",
    );
  });

  it("renders empty-hint when GraphQL datasource has no visible fields", () => {
    const graphql: TestimonialFieldsGraphQL = {
      data: { datasource: {} },
    };
    render(
      <Default
        fields={graphql}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    expect(screen.getByText(TESTIMONIAL_ARIA_FALLBACK)).toBeInTheDocument();
  });

  it("sets data-testimonial-company and renders Company from a text field", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "Great work." },
      Company: { value: "  Acme Industries  " },
    };
    render(
      <Default
        fields={flat}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    const section = document.querySelector("section.component.testimonial");
    expect(section).toHaveAttribute(
      "data-testimonial-company",
      "Acme Industries",
    );
    expect(screen.getByText("Acme Industries")).toBeInTheDocument();
  });

  it("sets data-testimonial-company from item reference (Name field) like layout JSON", () => {
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "Quote text." },
      Company: {
        id: "353daac9-81d2-4c3f-a7e9-d2e810d2adbe",
        displayName: "Michelin",
        name: "Michelin",
        fields: {
          Name: { value: "Michelin & Giordano" },
        },
      },
    };
    render(
      <Default
        fields={flat}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    const section = document.querySelector("section.component.testimonial");
    expect(section).toHaveAttribute(
      "data-testimonial-company",
      "Michelin & Giordano",
    );
    expect(screen.getByText("Michelin & Giordano")).toBeInTheDocument();
  });

  it("renders testimonial content when GraphQL fields are provided", () => {
    const graphql: TestimonialFieldsGraphQL = {
      data: {
        datasource: {
          quote: { jsonValue: { value: "GraphQL quote" } },
          attribution: { jsonValue: { value: "Jane Smith" } },
          jobTitle: { jsonValue: { value: "Designer" } },
        },
      },
    };
    render(
      <Default
        fields={graphql}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    expect(screen.getByTestId("sdk-richtext")).toHaveTextContent(
      "GraphQL quote",
    );
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
  });

  it("renders company-only content when no quote, attribution, or link", () => {
    const flat: TestimonialFieldsFlat = {
      Company: { value: "Company Only LLC" },
    };
    render(
      <Default
        fields={flat}
        params={defaultParams}
        page={defaultPage}
        rendering={defaultRendering}
      />,
    );
    expect(screen.getByText("Company Only LLC")).toBeInTheDocument();
    const section = document.querySelector("section.component.testimonial");
    expect(section).toHaveAttribute(
      "data-testimonial-company",
      "Company Only LLC",
    );
    /* Figure aria-label uses displayName when quote/attribution are empty */
    expect(
      screen.getByRole("group", { name: "Testimonial" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Testimonial" }),
    ).toBeInTheDocument();
  });

  it("in editing mode renders section and quote block when fields are empty", () => {
    const editingPage = { mode: { isEditing: true } } as unknown as Page;
    render(
      <Default
        fields={{}}
        params={defaultParams}
        page={editingPage}
        rendering={defaultRendering}
      />,
    );
    expect(
      screen.getByRole("region", { name: "Testimonial" }),
    ).toBeInTheDocument();
    expect(document.querySelector("blockquote")).toBeInTheDocument();
  });

  it("in editing mode still surfaces RichText when quote has value", () => {
    const editingPage = { mode: { isEditing: true } } as unknown as Page;
    const flat: TestimonialFieldsFlat = {
      Quote: { value: "Editable quote." },
    };
    render(
      <Default
        fields={flat}
        params={defaultParams}
        page={editingPage}
        rendering={defaultRendering}
      />,
    );
    expect(screen.getByTestId("sdk-richtext")).toHaveTextContent(
      "Editable quote.",
    );
  });
});
