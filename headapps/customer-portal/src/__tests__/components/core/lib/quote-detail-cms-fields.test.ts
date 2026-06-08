import { describe, expect, it } from "vitest";

import { resolveQuoteDetailFields } from "@/lib/quote-detail-blank-data";
import { normalizeQuoteDetailCmsFields, normalizeSectionTitleItemCountToken } from "@/lib/quote-detail-cms-fields";

describe("normalizeQuoteDetailCmsFields", () => {
  it("maps Sitecore alias keys onto IQuoteDetailFields", () => {
    const out = normalizeQuoteDetailCmsFields({
      SectionTitle: { value: "Pricing from CMS" },
      SubtotalLabel: { value: "Sub" },
      CostPanelHeading: { value: "Cost H" },
      CostPanelBodyText: { value: "Cost body" },
      CostPanelLinkLabel: { value: "Link" },
      CostPanelPostLinkText: { value: "Post" },
      InfoPanelMessageText: { value: "Info msg" },
      InfoPanelLink: {
        value: {
          href: "mailto:from-cms@example.com",
          text: "CMS link text",
        },
      },
      InfoPanelLinkLabel: { value: "Info link fallback" },
      RequestUpdateButtonLabel: { value: "Update btn" },
      RequestDocumentLabel: { value: "Doc kebab" },
      RequestQuoteLabel: { value: "Quote kebab" },
      CustomerPartPrefixLabel: { value: "Cust" },
      IntraloxPartPrefixLabel: { value: "Intra" },
      APIErrorMessage: { value: "API err" },
      EmptyStateBodyText: { value: "Empty body" },
    });
    expect(out.PricingSectionTitle?.value).toBe("Pricing from CMS");
    expect(out.SubTotalLabel?.value).toBe("Sub");
    expect(out.CostExpiredPanelHeading?.value).toBe("Cost H");
    expect(out.CostExpiredPanelBody?.value).toBe("Cost body");
    expect(out.CostExpiredPanelLinkLabel?.value).toBe("Link");
    expect(out.CostExpiredPanelPostLinkText?.value).toBe("Post");
    expect(out.SupportInfoMessage?.value).toBe("Info msg");
    expect(out.SupportInfoLink?.value?.text).toBe("CMS link text");
    expect(out.SupportInfoLink?.value?.href).toBe("mailto:from-cms@example.com");
    expect(out.SupportInfoLinkLabel?.value).toBe("Info link fallback");
    expect(out.RequestUpdatedQuoteButtonLabel?.value).toBe("Update btn");
    expect(out.KebabRequestDocumentLabel?.value).toBe("Doc kebab");
    expect(out.KebabRequestQuoteLabel?.value).toBe("Quote kebab");
    expect(out.CustomerPartLabel?.value).toBe("Cust");
    expect(out.IntraloxPartLabel?.value).toBe("Intra");
    expect(out.ApiErrorMessage?.value).toBe("API err");
    expect(out.EmptyStateBody?.value).toBe("Empty body");
  });

  it("prefers canonical SupportInfoLink over InfoPanelLink alias", () => {
    const out = normalizeQuoteDetailCmsFields({
      SupportInfoLink: {
        value: { href: "/canonical", text: "Canonical" },
      },
      InfoPanelLink: {
        value: { href: "/alias", text: "Alias" },
      },
    });
    expect(out.SupportInfoLink?.value?.text).toBe("Canonical");
  });

  it("prefers canonical keys when both canonical and alias exist", () => {
    const out = normalizeQuoteDetailCmsFields({
      SectionTitle: { value: "Alias" },
      PricingSectionTitle: { value: "Canonical" },
    });
    expect(out.PricingSectionTitle?.value).toBe("Canonical");
  });

  it("maps integrated-query field list jsonValue entries onto flat fields", () => {
    const out = normalizeQuoteDetailCmsFields({
      data: {
        item: {
          fields: [
            { name: "ExpiresLabel", jsonValue: { value: "Expires" } },
            { name: "ExpiredLabel", jsonValue: { value: "Expired" } },
          ],
        },
      },
    });

    expect(out.ExpiresLabel?.value).toBe("Expires");
    expect(out.ExpiredLabel?.value).toBe("Expired");
  });
});

describe("normalizeSectionTitleItemCountToken", () => {
  it("inserts missing closing paren after ITEM_COUNT when token is not followed by )", () => {
    expect(normalizeSectionTitleItemCountToken("Quoted Items ({ITEM_COUNT}")).toBe("Quoted Items ({ITEM_COUNT})");
  });

  it("does not duplicate ) when pattern is already well-formed", () => {
    expect(normalizeSectionTitleItemCountToken("Quoted Items ({ITEM_COUNT})")).toBe("Quoted Items ({ITEM_COUNT})");
  });
});

describe("resolveQuoteDetailFields", () => {
  it("returns normalized fields only when not editing (no merged English blanks)", () => {
    const raw = { SectionTitle: { value: "P" } };
    const out = resolveQuoteDetailFields(raw, false);
    expect(out.PricingSectionTitle?.value).toBe("P");
    expect(out.BackLinkLabel).toBeUndefined();
  });

  it("merges editor placeholders under normalized CMS when editing", () => {
    const raw = { SectionTitle: { value: "P" } };
    const out = resolveQuoteDetailFields(raw, true);
    expect(out.PricingSectionTitle?.value).toBe("P");
    expect(out.BackLinkLabel?.value).toBe("Back");
    expect(out.EmptyStateRetryButtonLabel?.value).toBe("Retry");
  });
});
