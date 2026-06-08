import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { TestimonialAttribution } from "components/testimonial/partial/TestimonialPartials";
import type { TestimonialNormalizedFields } from "components/testimonial/Testimonial.type";

vi.mock("@sitecore-content-sdk/nextjs", async () => {
  const { testimonialAttributionSitecoreSdkMock } =
    await import("src/test/mocks/viteSafeMocks");
  return testimonialAttributionSitecoreSdkMock();
});

describe("TestimonialAttribution", () => {
  it("returns null when no attribution content and not editing", () => {
    const fields: TestimonialNormalizedFields = {};
    const { container } = render(
      <TestimonialAttribution fields={fields} isEditing={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders figcaption with attribution and job title", () => {
    const fields: TestimonialNormalizedFields = {
      Attribution: { value: "Jane Doe" },
      JobTitle: { value: "Senior Engineer" },
    };
    render(<TestimonialAttribution fields={fields} isEditing={false} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    const figcaption = document.querySelector("figcaption");
    expect(figcaption).toBeInTheDocument();
  });

  it("renders image when Image field has src", () => {
    const fields: TestimonialNormalizedFields = {
      Attribution: { value: "John" },
      Image: { value: { src: "/avatar.jpg", alt: "John" } },
    };
    render(<TestimonialAttribution fields={fields} isEditing={false} />);
    const img = screen.getByTestId("sdk-image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/avatar.jpg");
    expect(img).toHaveAttribute("alt", "John");
  });

  it("uses text-left layout when image is present", () => {
    const fields: TestimonialNormalizedFields = {
      Attribution: { value: "Author" },
      Image: { value: { src: "/a.jpg", alt: "Alt" } },
    };
    render(<TestimonialAttribution fields={fields} isEditing={false} />);
    const textBlock = screen.getByText("Author").closest("div");
    expect(textBlock).toHaveClass("text-left");
  });

  it("uses text-left layout when no image (aligned with quote block)", () => {
    const fields: TestimonialNormalizedFields = {
      Attribution: { value: "Author" },
    };
    render(<TestimonialAttribution fields={fields} isEditing={false} />);
    const textBlock = screen.getByText("Author").closest("div");
    expect(textBlock).toHaveClass("text-left");
    const figcaption = document.querySelector("figcaption");
    expect(figcaption).toHaveClass("items-start");
  });

  it("renders in editing mode even when all fields are empty", () => {
    const fields: TestimonialNormalizedFields = {};
    render(<TestimonialAttribution fields={fields} isEditing={true} />);
    const figcaption = document.querySelector("figcaption");
    expect(figcaption).toBeInTheDocument();
  });

  it("handles null/undefined fields safely", () => {
    const { container } = render(
      <TestimonialAttribution
        fields={null as unknown as TestimonialNormalizedFields}
        isEditing={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders company Name from item reference (layout JSON shape)", () => {
    const fields: TestimonialNormalizedFields = {
      Attribution: { value: "Mark Costanzo" },
      JobTitle: { value: "Inventor" },
      Company: {
        displayName: "Michelin",
        fields: { Name: { value: "Michelin & Giordano" } },
      },
    };
    render(<TestimonialAttribution fields={fields} isEditing={false} />);
    expect(screen.getByText("Michelin & Giordano")).toBeInTheDocument();
  });
});
