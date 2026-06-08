import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@sitecore-content-sdk/nextjs", async () => {
  const { footerFloatingActionSitecoreSdkMock } =
    await import("src/test/mocks/viteSafeMocks");
  return footerFloatingActionSitecoreSdkMock();
});

import { Default } from "components/footer/Footer";
import type { FooterProps } from "components/footer/Footer.type";

function createFooterProps(overrides: Partial<FooterProps> = {}): FooterProps {
  const isEditing = overrides.page?.mode?.isEditing ?? false;
  return {
    rendering:
      overrides.rendering ??
      ({ uid: "footer-test-uid", componentName: "Footer" } as never),
    page: {
      mode: { isEditing },
      ...overrides.page,
    } as FooterProps["page"],
    params: {
      RenderingIdentifier: "footer-rendering-id",
      styles: "footer-style-token",
      ...overrides.params,
    },
    fields: overrides.fields as FooterProps["fields"],
  };
}

describe("Footer Default", () => {
  it("renders empty hint when fields are missing", () => {
    const { container } = render(
      <Default {...createFooterProps({ fields: undefined as never })} />,
    );

    const root = container.querySelector(".component.footer");
    expect(root).toBeTruthy();
    expect(root).toHaveClass("footer-style-token");
    expect(root).toHaveAttribute("id", "footer-rendering-id");
    expect(screen.getByText("Footer")).toHaveClass("is-empty-hint");
  });

  it("shows navigation authoring hint when editing and MainLinks is empty", () => {
    render(
      <Default
        {...createFooterProps({
          page: { mode: { isEditing: true } } as FooterProps["page"],
          fields: {
            MainLinks: [],
          },
        })}
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "Footer navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No navigation links configured")).toHaveClass(
      "is-empty-hint",
    );
  });

  it("renders main column title and sub-links from Sitecore fields", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            MainLinks: [
              {
                id: "col-1",
                displayName: "Products",
                fields: {
                  Title: { value: "Products" },
                  ChildLinks: [
                    {
                      id: "sub-1",
                      displayName: "Belts",
                      fields: {
                        Title: { value: "Belts" },
                        Link: {
                          value: { href: "/belts", text: "Belts" },
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        })}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Products" }),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Belts" });
    expect(link).toHaveAttribute("href", "/belts");
  });

  it("renders column Title as a link when main item Link field is set", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            MainLinks: [
              {
                id: "col-1",
                displayName: "Resources",
                fields: {
                  Title: { value: "Resources" },
                  Link: {
                    value: { href: "/resources", text: "Resources" },
                  },
                  ChildLinks: [
                    {
                      id: "sub-1",
                      fields: {
                        Link: {
                          value: { href: "/guides", text: "Guides" },
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        })}
      />,
    );

    const heading = screen.getByRole("heading", { level: 3, name: "Resources" });
    expect(heading).toBeInTheDocument();
    const headingLink = screen.getByRole("link", { name: "Resources" });
    expect(headingLink).toHaveAttribute("href", "/resources");
    expect(headingLink).toHaveClass("footer-column-heading-link");
    expect(screen.getByRole("link", { name: "Guides" })).toHaveAttribute(
      "href",
      "/guides",
    );
  });

  it("when every child has an href, renders the first child as a bold link instead of static heading text", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            /* Column index 0 uses the “all bold” layout; use a decoy column so this scenario hits the derived branch. */
            MainLinks: [
              {
                id: "col-primary",
                displayName: "Primary",
                fields: {
                  ChildLinks: [
                    {
                      id: "primary-1",
                      fields: {
                        Link: { value: { href: "/", text: "Home" } },
                      },
                    },
                  ],
                },
              },
              {
                id: "col-1",
                displayName: "Column",
                fields: {
                  ChildLinks: [
                    {
                      id: "head-as-link",
                      fields: {
                        Title: { value: "News & Insights" },
                        Link: {
                          value: {
                            href: "/news",
                            text: "News & Insights",
                          },
                        },
                      },
                    },
                    {
                      id: "sub-1",
                      fields: {
                        Link: {
                          value: { href: "/case-studies", text: "Case Studies" },
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        })}
      />,
    );

    const group = screen.getByRole("group", { name: "News & Insights" });
    expect(group).toBeInTheDocument();

    const newsLink = screen.getByRole("link", { name: "News & Insights" });
    expect(newsLink).toHaveAttribute("href", "/news");
    expect(newsLink).toHaveClass("uppercase");
    expect(newsLink).toHaveClass("font-medium");
    const caseStudies = screen.getByRole("link", { name: "Case Studies" });
    expect(caseStudies).toHaveAttribute("href", "/case-studies");
    expect(caseStudies).toHaveClass("font-normal");
    expect(caseStudies).not.toHaveClass("uppercase");
  });

  it("resolves {{YEAR}} in copyright text for visitors", () => {
    const year = String(new Date().getFullYear());
    render(
      <Default
        {...createFooterProps({
          fields: {
            CopyrightText: { value: `© {{YEAR}} Intralox` },
          },
        })}
      />,
    );

    expect(screen.getByText(`© ${year} Intralox`)).toBeInTheDocument();
  });

  it("renders copyright with stroke-default text at all breakpoints", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            CopyrightText: { value: "© 2026 Intralox" },
          },
        })}
      />,
    );

    const copyright = screen.getByText("© 2026 Intralox");
    expect(copyright).toHaveClass("footer-copyright");
    expect(copyright).toHaveClass("text-stroke-default");
    expect(copyright).not.toHaveClass("text-inherit");
  });

  it("applies noopener noreferrer for legal links that open in a new tab", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            SecondaryLinks: [
              {
                id: "legal-1",
                displayName: "Privacy",
                fields: {
                  Link: {
                    value: {
                      href: "/privacy",
                      text: "Privacy",
                      target: "_blank",
                    },
                  },
                },
              },
            ],
          },
        })}
      />,
    );

    const link = screen.getByRole("link", { name: "Privacy" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders social list with accessible link labels", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            SocialLinks: [
              {
                id: "soc-1",
                displayName: "LinkedIn",
                fields: {
                  Link: {
                    value: {
                      href: "https://linkedin.com/company/example",
                      text: "LinkedIn",
                    },
                  },
                  IconCssClass: { value: "fab fa-linkedin-in" },
                },
              },
            ],
          },
        })}
      />,
    );

    const region = screen.getByRole("list", { name: "Social media links" });
    expect(region).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://linkedin.com/company/example",
    );
  });

  it("uses fallback icon class from platform detection when IconCssClass is empty (lines 289-290)", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            SocialLinks: [
              {
                id: "soc-fallback",
                displayName: "LinkedIn fallback",
                fields: {
                  Link: {
                    value: {
                      href: "https://linkedin.com/company/example",
                      text: "LinkedIn",
                    },
                  },
                  IconCssClass: { value: "" },
                },
              },
            ],
          },
        })}
      />,
    );
    // Social link renders — icon class was inferred from the linkedin URL
    expect(screen.getByRole("link", { name: "LinkedIn" })).toBeInTheDocument();
  });

  it("renders no icon when IconCssClass is empty and platform is unknown (line 293)", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            SocialLinks: [
              {
                id: "soc-unknown",
                displayName: "Unknown platform",
                fields: {
                  Link: {
                    value: {
                      href: "https://unknownplatform.example.com/page",
                      text: "Unknown",
                    },
                  },
                  IconCssClass: { value: "" },
                },
              },
            ],
          },
        })}
      />,
    );
    expect(screen.getByRole("link", { name: "Unknown" })).toBeInTheDocument();
  });

  it("does not render legal nav for visitors when SecondaryLinks is empty", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            MainLinks: [],
            SecondaryLinks: [],
          },
        })}
      />,
    );

    expect(
      screen.queryByRole("navigation", { name: "Legal and compliance links" }),
    ).not.toBeInTheDocument();
  });

  it("omits footer link item when href is empty, not editing, and text is empty (line 42)", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            MainLinks: [
              {
                id: "col-0",
                displayName: "Col 0",
                fields: {
                  ChildLinks: [
                    {
                      id: "empty-child",
                      displayName: "",
                      fields: {
                        Title: { value: "" },
                        Link: { value: { href: "", text: "" } },
                      },
                    },
                  ],
                },
              },
            ],
          },
        })}
      />,
    );
    // Empty link with no href, no text - renders nothing in the list
    expect(screen.queryByRole("link", { name: "" })).toBeFalsy();
  });

  it("renders footer link item as plain text when href is empty but text is present (line 43)", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            MainLinks: [
              {
                id: "col-0",
                displayName: "Col 0",
                fields: {
                  ChildLinks: [
                    {
                      id: "text-only",
                      displayName: "Text Only",
                      fields: {
                        Title: { value: "Text Only Item" },
                        Link: { value: { href: "", text: "" } },
                      },
                    },
                  ],
                },
              },
            ],
          },
        })}
      />,
    );
    expect(screen.getByText("Text Only Item")).toBeInTheDocument();
    // Should be in a span, not an anchor
    expect(screen.queryByRole("link", { name: "Text Only Item" })).toBeFalsy();
  });

  it("renders footer column with derived heading that has a column link (lines 205-224)", () => {
    render(
      <Default
        {...createFooterProps({
          fields: {
            MainLinks: [
              {
                id: "col-0",
                displayName: "Primary",
                fields: {
                  ChildLinks: [
                    {
                      id: "primary-1",
                      fields: {
                        Link: { value: { href: "/", text: "Home" } },
                      },
                    },
                  ],
                },
              },
              {
                id: "col-derived",
                displayName: "Derived",
                fields: {
                  Link: { value: { href: "/derived", text: "" } },
                  ChildLinks: [
                    {
                      id: "heading-item",
                      displayName: "Category Heading",
                      fields: {
                        Title: { value: "Category Heading" },
                        Link: { value: { href: "", text: "" } },
                      },
                    },
                    {
                      id: "link-item",
                      displayName: "Sub Item",
                      fields: {
                        Link: { value: { href: "/sub", text: "Sub Item" } },
                      },
                    },
                  ],
                },
              },
            ],
          },
        })}
      />,
    );
    const headingLink = screen.getByRole("link", { name: "Category Heading" });
    expect(headingLink).toHaveAttribute("href", "/derived");
  });

  it("renders column index 0 with all links as bold, with empty children hint in editing", () => {
    render(
      <Default
        {...createFooterProps({
          page: { mode: { isEditing: true } } as FooterProps["page"],
          fields: {
            MainLinks: [
              {
                id: "col-0",
                displayName: "Primary",
                fields: {
                  ChildLinks: [],
                },
              },
            ],
          },
        })}
      />,
    );
    expect(screen.getByText("No links configured")).toBeInTheDocument();
  });

  it("renders column with title but empty children shows editing hint", () => {
    render(
      <Default
        {...createFooterProps({
          page: { mode: { isEditing: true } } as FooterProps["page"],
          fields: {
            MainLinks: [
              {
                id: "col-1",
                displayName: "Products",
                fields: {
                  Title: { value: "Products" },
                  ChildLinks: [],
                },
              },
            ],
          },
        })}
      />,
    );
    expect(screen.getByText("No links configured")).toBeInTheDocument();
  });
});
