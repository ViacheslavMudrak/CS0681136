import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { TestimonialCard } from "components/testimonial/partial/TestimonialPartials";
import type { TestimonialNormalizedFields } from "components/testimonial/Testimonial.type";

vi.mock("@sitecore-content-sdk/nextjs", async () => {
  const { testimonialCardSitecoreSdkMock } =
    await import("src/test/mocks/viteSafeMocks");
  return testimonialCardSitecoreSdkMock();
});

describe("TestimonialCard", () => {
  it("returns null when no content and not editing", () => {
    const fields: TestimonialNormalizedFields = {};
    const { container } = render(
      <TestimonialCard fields={fields} isEditing={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders figure with quote when Quote is provided", () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "Great product." },
    };
    render(<TestimonialCard fields={fields} isEditing={false} />);
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByTestId("sdk-richtext")).toHaveTextContent(
      "Great product.",
    );
  });

  it("uses basic white when figureSurface is white (no HasBackgroundColor flag)", () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "Plain surface." },
    };
    render(
      <TestimonialCard
        fields={fields}
        isEditing={false}
        figureSurface="white"
      />,
    );
    const figure = screen.getByRole("group");
    expect(figure).toHaveClass("bg-surface");
    expect(figure).not.toHaveClass("bg-surface-subtle");
  });

  it("uses Media Tile section gray when figureSurface is transparent (flag checked)", () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "Gray strip." },
    };
    render(
      <TestimonialCard
        fields={fields}
        isEditing={false}
        figureSurface="transparent"
      />,
    );
    const figure = screen.getByRole("group");
    expect(figure).toHaveClass("bg-surface-subtle");
  });

  it("uses transparent figure when figureSurface is inherit (gray carousel chrome)", () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "Inherit band." },
    };
    render(
      <TestimonialCard
        fields={fields}
        isEditing={false}
        figureSurface="inherit"
      />,
    );
    const figure = screen.getByRole("group");
    expect(figure).toHaveClass("bg-transparent");
    expect(figure).not.toHaveClass("bg-surface");
    expect(figure).not.toHaveClass("bg-surface-subtle");
  });

  it("applies text-center on figure when alignment is center", () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "Q" },
    };
    render(
      <TestimonialCard fields={fields} isEditing={false} alignment="center" />,
    );
    expect(screen.getByRole("group")).toHaveClass("text-center");
  });

  it("preview quote body uses text-left for left alignment", () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "<p>Left quote</p>" },
    };
    const { container } = render(
      <TestimonialCard fields={fields} isEditing={false} alignment="left" />,
    );
    const quoteBody = container.querySelector(
      "blockquote .text-left",
    );
    expect(quoteBody).toBeTruthy();
    expect(quoteBody).not.toHaveClass("text-center");
  });

  it("preview center quote body uses 600px column from lg and theme mask tokens", () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "<p>Center quote</p>" },
    };
    const { container } = render(
      <TestimonialCard fields={fields} isEditing={false} alignment="center" />,
    );
    const quoteBody = container.querySelector("blockquote .text-center");
    expect(quoteBody).toHaveClass("lg:w-[600px]");
    expect(quoteBody?.className).toContain("before:bg-accent-cyan");
    const style = quoteBody?.getAttribute("style") ?? "";
    expect(style).toContain("--testimonial-open-mask");
    expect(style).toContain("--testimonial-close-mask");
  });

  it("renders attribution and link when provided", () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "Quote" },
      Attribution: { value: "Jane Doe" },
      JobTitle: { value: "Engineer" },
      Link: { value: { href: "/case-study", text: "View case study" } },
    };
    render(<TestimonialCard fields={fields} isEditing={false} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "View case study" });
    expect(link).toHaveAttribute("href", "/case-study");
  });

  it("uses href as aria-label when link has no text and no displayName", () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "Q" },
      Link: { value: { href: "/more" } },
    };
    render(<TestimonialCard fields={fields} isEditing={false} />);
    const link = screen.getByRole("link", { name: "/more" });
    expect(link).toHaveAttribute("aria-label", "/more");
  });

  it("uses displayName for link aria-label when link has no text", () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "Q" },
      Link: { value: { href: "/more" } },
    };
    render(
      <TestimonialCard
        fields={fields}
        isEditing={false}
        displayName="Testimonial Block"
      />,
    );
    const link = screen.getByRole("link", { name: "Testimonial Block" });
    expect(link).toBeInTheDocument();
  });

  it("renders figure with aria-label from quote, attribution, or displayName", () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "My quote" },
      Attribution: { value: "Author" },
    };
    render(<TestimonialCard fields={fields} isEditing={false} />);
    const figure = screen.getByRole("group", { name: "My quote" });
    expect(figure).toBeInTheDocument();
  });

  it('adds rel="noopener noreferrer" when link target is _blank', () => {
    const fields: TestimonialNormalizedFields = {
      Quote: { value: "Q" },
      Link: {
        value: {
          href: "https://example.com",
          target: "_blank",
          text: "External",
        },
      },
    };
    render(<TestimonialCard fields={fields} isEditing={false} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders figure in editing mode even when fields are empty", () => {
    const fields: TestimonialNormalizedFields = {};
    render(
      <TestimonialCard
        fields={fields}
        isEditing={true}
        displayName="Testimonial"
      />,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
    const blockquote = document.querySelector("blockquote");
    expect(blockquote).toBeInTheDocument();
  });

  it("renders figure when only Company field has text", () => {
    const fields: TestimonialNormalizedFields = {
      Company: { value: "Solo Brand" },
    };
    render(
      <TestimonialCard fields={fields} isEditing={false} displayName="Block" />,
    );
    expect(screen.getByRole("group", { name: "Block" })).toBeInTheDocument();
    expect(screen.getByText("Solo Brand")).toBeInTheDocument();
  });
});
