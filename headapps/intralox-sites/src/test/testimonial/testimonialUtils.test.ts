import { describe, it, expect } from "vitest";
import {
  getTextValue,
  getAriaLabel,
  getCompanyMetadataValue,
  getNormalizedTestimonialFields,
  getQuotePlainText,
  hasMeaningfulQuote,
  hasNonEmptyTextField,
  hasVisibleTestimonialContent,
  TESTIMONIAL_ARIA_FALLBACK,
  TESTIMONIAL_COMPANY_DATA_ATTR,
  TESTIMONIAL_SECTION_ARIA_FALLBACK,
  getTestimonialLinkAriaFallback,
  parseTestimonialAlignment,
  parseTestimonialImageDimension,
  getTestimonialAlignmentRawFromParams,
  getMergedTestimonialParams,
} from "components/testimonial/testimonialUtils";
import type { LinkField, TextField } from "@sitecore-content-sdk/nextjs";
import type {
  TestimonialFieldsFlat,
  TestimonialFieldsGraphQL,
} from "components/testimonial/Testimonial.type";

describe("testimonialUtils", () => {
  describe("getTextValue", () => {
    it("returns empty string when field is undefined", () => {
      expect(getTextValue(undefined)).toBe("");
    });

    it("returns empty string when field has no value", () => {
      expect(getTextValue({ value: undefined })).toBe("");
      expect(getTextValue({})).toBe("");
    });

    it("returns string value when field has string value", () => {
      expect(getTextValue({ value: "Hello" })).toBe("Hello");
      expect(getTextValue({ value: "Author Name" })).toBe("Author Name");
    });

    it("returns empty string when value is not a string", () => {
      expect(getTextValue({ value: 123 as unknown as string })).toBe("");
      expect(getTextValue({ value: null as unknown as string })).toBe("");
    });
  });

  describe("getAriaLabel", () => {
    it("returns quote when provided", () => {
      expect(getAriaLabel("Quote text", undefined, undefined)).toBe(
        "Quote text",
      );
    });

    it("returns attribution when quote is empty", () => {
      expect(getAriaLabel("", "Author Name", undefined)).toBe("Author Name");
    });

    it("returns fallback when quote and attribution are empty", () => {
      expect(getAriaLabel("", "", "Display Name")).toBe("Display Name");
    });

    it("returns TESTIMONIAL_ARIA_FALLBACK when all are empty", () => {
      expect(getAriaLabel(undefined, undefined, undefined)).toBe(
        TESTIMONIAL_ARIA_FALLBACK,
      );
      expect(getAriaLabel("", "", "")).toBe(TESTIMONIAL_ARIA_FALLBACK);
    });

    it("prefers quote over attribution over fallback", () => {
      expect(getAriaLabel("Q", "A", "F")).toBe("Q");
      expect(getAriaLabel("", "A", "F")).toBe("A");
      expect(getAriaLabel("", "", "F")).toBe("F");
    });
  });

  describe("constants", () => {
    it("exports expected aria fallback constants", () => {
      expect(TESTIMONIAL_ARIA_FALLBACK).toBe("Testimonial");
      expect(TESTIMONIAL_SECTION_ARIA_FALLBACK).toBe("Testimonial section");
      expect(TESTIMONIAL_COMPANY_DATA_ATTR).toBe("data-testimonial-company");
    });
  });

  describe("parseTestimonialAlignment", () => {
    it("returns left when undefined, empty, or unknown", () => {
      expect(parseTestimonialAlignment(undefined)).toBe("left");
      expect(parseTestimonialAlignment("")).toBe("left");
      expect(parseTestimonialAlignment("  ")).toBe("left");
      expect(parseTestimonialAlignment("Left")).toBe("left");
      expect(parseTestimonialAlignment("start")).toBe("left");
    });

    it("returns center for Center, center, or Centre", () => {
      expect(parseTestimonialAlignment("Center")).toBe("center");
      expect(parseTestimonialAlignment("center")).toBe("center");
      expect(parseTestimonialAlignment("Centre")).toBe("center");
    });
  });

  describe("parseTestimonialImageDimension", () => {
    it("parses numeric strings and caps large values", () => {
      expect(parseTestimonialImageDimension("1200", 64)).toBe(1200);
      expect(parseTestimonialImageDimension(9999, 64)).toBe(2048);
    });

    it("returns fallback for invalid input", () => {
      expect(parseTestimonialImageDimension(undefined, 64)).toBe(64);
      expect(parseTestimonialImageDimension("abc", 64)).toBe(64);
      expect(parseTestimonialImageDimension(0, 64)).toBe(64);
    });
  });

  describe("getTestimonialLinkAriaFallback", () => {
    it("prefers displayName, then link title, then href", () => {
      expect(getTestimonialLinkAriaFallback("Block", undefined)).toBe("Block");
      const withTitle = {
        value: { href: "/x", title: "Title" },
      } as LinkField;
      expect(getTestimonialLinkAriaFallback(undefined, withTitle)).toBe(
        "Title",
      );
      const hrefOnly = { value: { href: "/path" } } as LinkField;
      expect(getTestimonialLinkAriaFallback(undefined, hrefOnly)).toBe("/path");
      expect(
        getTestimonialLinkAriaFallback(undefined, undefined),
      ).toBeUndefined();
    });
  });

  describe("hasNonEmptyTextField", () => {
    it("returns false for empty or whitespace-only values", () => {
      expect(hasNonEmptyTextField(undefined)).toBe(false);
      expect(hasNonEmptyTextField({ value: "" })).toBe(false);
      expect(hasNonEmptyTextField({ value: "   " })).toBe(false);
    });

    it("returns true for non-empty trimmed text", () => {
      expect(hasNonEmptyTextField({ value: "Jane" })).toBe(true);
      expect(hasNonEmptyTextField({ value: "  Jane  " })).toBe(true);
    });
  });

  describe("getQuotePlainText / hasMeaningfulQuote", () => {
    it("strips HTML and collapses whitespace", () => {
      expect(
        getQuotePlainText({ value: "<p>Hello <strong>world</strong></p>" }),
      ).toBe("Hello world");
    });

    it("returns empty for blank rich text", () => {
      expect(getQuotePlainText({ value: "<p><br /></p>" })).toBe("");
      expect(hasMeaningfulQuote({ value: "   " })).toBe(false);
    });
  });

  describe("hasVisibleTestimonialContent", () => {
    it("returns false when no visible fields and not editing", () => {
      expect(hasVisibleTestimonialContent({}, false)).toBe(false);
    });

    it("returns true in editing mode even when empty", () => {
      expect(hasVisibleTestimonialContent({}, true)).toBe(true);
    });

    it("returns true when Company field has a resolved label (text or item reference)", () => {
      expect(
        hasVisibleTestimonialContent({ Company: { value: "Acme" } }, false),
      ).toBe(true);
      expect(
        hasVisibleTestimonialContent(
          {
            Company: {
              displayName: "Michelin",
              fields: { Name: { value: "Michelin & Giordano" } },
            },
          },
          false,
        ),
      ).toBe(true);
    });
  });

  describe("getCompanyMetadataValue", () => {
    it("returns trimmed string or empty for plain text Company", () => {
      expect(getCompanyMetadataValue(undefined)).toBe("");
      expect(getCompanyMetadataValue({ value: "  Acme Corp  " })).toBe(
        "Acme Corp",
      );
    });

    it("prefers referenced item Name field over displayName", () => {
      expect(
        getCompanyMetadataValue({
          displayName: "Michelin",
          fields: { Name: { value: "Michelin & Giordano" } },
        }),
      ).toBe("Michelin & Giordano");
    });

    it("falls back to displayName or name when Name subfield is empty", () => {
      expect(
        getCompanyMetadataValue({
          displayName: "Michelin",
          name: "Michelin",
          fields: { Name: { value: "" } },
        }),
      ).toBe("Michelin");
    });
  });

  describe("getNormalizedTestimonialFields", () => {
    it("returns null when fields is null or undefined", () => {
      expect(getNormalizedTestimonialFields(null)).toBeNull();
      expect(getNormalizedTestimonialFields(undefined)).toBeNull();
    });

    it("normalizes flat fields as-is", () => {
      const flat: TestimonialFieldsFlat = {
        Quote: { value: "Test quote" },
        Attribution: { value: "Jane Doe" },
        JobTitle: { value: "Engineer" },
        Image: { value: { src: "/img.jpg", alt: "Photo" } },
        Link: { value: { href: "/case", text: "Read more" } },
        Company: { value: "Contoso" },
      };
      const result = getNormalizedTestimonialFields(flat);
      expect(result).not.toBeNull();
      expect(result?.Quote).toBe(flat.Quote);
      expect(result?.Attribution).toBe(flat.Attribution);
      expect(result?.JobTitle).toBe(flat.JobTitle);
      expect(result?.Image).toBe(flat.Image);
      expect(result?.Link).toBe(flat.Link);
      expect(result?.Company).toBe(flat.Company);
    });

    it("normalizes GraphQL shape from data.datasource with jsonValue", () => {
      const graphql: TestimonialFieldsGraphQL = {
        data: {
          datasource: {
            quote: { jsonValue: { value: "GraphQL quote" } },
            attribution: { jsonValue: { value: "John Doe" } },
            jobTitle: { jsonValue: { value: "Designer" } },
            authorName: { jsonValue: { value: "Author Name" } },
            authorTitle: { jsonValue: { value: "Author Title" } },
            image: {
              jsonValue: { value: { src: "/avatar.jpg", alt: "Avatar" } },
            },
            link: { jsonValue: { value: { href: "/story", text: "Story" } } },
            company: { jsonValue: { value: "GraphQL Co" } },
          },
        },
      };
      const result = getNormalizedTestimonialFields(graphql);
      expect(result).not.toBeNull();
      expect(result?.Quote?.value).toBe("GraphQL quote");
      expect(result?.Attribution?.value).toBe("John Doe");
      expect(result?.JobTitle?.value).toBe("Designer");
      expect(result?.Image?.value?.src).toBe("/avatar.jpg");
      expect(result?.Link?.value?.href).toBe("/story");
      expect(getTextValue(result?.Company as TextField)).toBe("GraphQL Co");
    });

    it("prefers attribution over authorName and jobTitle over authorTitle in GraphQL", () => {
      const graphql: TestimonialFieldsGraphQL = {
        data: {
          datasource: {
            attribution: { jsonValue: { value: "Attribution" } },
            authorName: { jsonValue: { value: "Author Name" } },
            jobTitle: { jsonValue: { value: "Job Title" } },
            authorTitle: { jsonValue: { value: "Author Title" } },
          },
        },
      };
      const result = getNormalizedTestimonialFields(graphql);
      expect(result?.Attribution?.value).toBe("Attribution");
      expect(result?.JobTitle?.value).toBe("Job Title");
    });

    it("falls back to authorName when attribution missing in GraphQL", () => {
      const graphql: TestimonialFieldsGraphQL = {
        data: {
          datasource: {
            authorName: { jsonValue: { value: "Author Name" } },
          },
        },
      };
      const result = getNormalizedTestimonialFields(graphql);
      expect(result?.Attribution?.value).toBe("Author Name");
    });

    it("returns null for GraphQL shape when datasource is missing", () => {
      const graphql = { data: {} } as TestimonialFieldsGraphQL;
      expect(getNormalizedTestimonialFields(graphql)).toBeNull();
    });

    it("returns null for GraphQL shape when data.datasource is null", () => {
      const graphql = {
        data: { datasource: null },
      } as unknown as TestimonialFieldsGraphQL;
      expect(getNormalizedTestimonialFields(graphql)).toBeNull();
    });
  });

  describe("getTestimonialAlignmentRawFromParams", () => {
    it("prefers Alignment string over Position", () => {
      expect(
        getTestimonialAlignmentRawFromParams({
          Alignment: "Left",
          Position: { Value: { value: "Center" } },
        }),
      ).toBe("Left");
    });

    it("reads nested Position.Value.value from layout service", () => {
      expect(
        getTestimonialAlignmentRawFromParams({
          Position: { Value: { value: "Center" } },
        }),
      ).toBe("Center");
    });
  });

  describe("getMergedTestimonialParams", () => {
    it("overlays props params on rendering.params so Placeholder keys win", () => {
      const merged = getMergedTestimonialParams(
        {
          params: {
            HasBackgroundColor: "0",
            FieldNames: "Default",
            Position: { Value: { value: "Center" } },
          },
        },
        { styles: "row", RenderingIdentifier: "r1" },
      );
      expect(merged).toMatchObject({
        HasBackgroundColor: "0",
        styles: "row",
        RenderingIdentifier: "r1",
        FieldNames: "Default",
      });
    });

    it("merges HasBackgroundColor from rendering.params when props params omit it", () => {
      const merged = getMergedTestimonialParams(
        {
          params: {
            HasBackgroundColor: "1",
            Position: { Value: { value: "Full-Width" } },
            GridParameters: { Class: { value: "col-12" } },
          },
        },
        { styles: "", RenderingIdentifier: "test-rendering-id" },
      );
      expect(merged.HasBackgroundColor).toBe("1");
      expect(merged.Position).toEqual({ Value: { value: "Full-Width" } });
    });
  });
});
