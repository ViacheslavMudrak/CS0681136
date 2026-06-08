import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock(
  "components/floating-action-button/partial/FloatingFabFooterAwareWrap",
  () => ({
    FloatingFabFooterAwareWrap: ({ children }: { children: ReactNode }) => (
      <div data-testid="fab-viewport-wrap">{children}</div>
    ),
  }),
);

vi.mock("@sitecore-content-sdk/nextjs", async () => {
  const { footerFloatingActionSitecoreSdkMock } =
    await import("src/test/mocks/viteSafeMocks");
  return footerFloatingActionSitecoreSdkMock();
});

import {
  Default as FloatingActionButton,
  FloatingActionButtonPill,
} from "components/floating-action-button/FloatingActionButton";
import type { FloatingActionButtonPresentationProps } from "components/floating-action-button/FloatingActionButton.type";

function createFabProps(
  overrides: Partial<FloatingActionButtonPresentationProps> = {},
): FloatingActionButtonPresentationProps {
  return {
    showFloatingButton: true,
    floatingButton: null,
    isEditing: false,
    ...overrides,
  };
}

describe("FloatingActionButton", () => {
  it("returns null when ShowFloatingButton is off", () => {
    const { container } = render(
      <FloatingActionButton
        {...createFabProps({ showFloatingButton: false })}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null for visitors when the floating button item is missing", () => {
    const { container } = render(
      <FloatingActionButton
        {...createFabProps({ floatingButton: null, isEditing: false })}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders authoring empty hint inside viewport wrap when editing without datasource", () => {
    render(
      <FloatingActionButton
        {...createFabProps({ floatingButton: null, isEditing: true })}
      />,
    );

    expect(screen.getByTestId("fab-viewport-wrap")).toBeInTheDocument();
    expect(screen.getByText("Floating action button")).toHaveClass(
      "is-empty-hint",
    );
    expect(
      document.getElementById("layout-floating-action-button"),
    ).toBeTruthy();
  });

  it("returns null for visitors when link field has no usable href", () => {
    const { container } = render(
      <FloatingActionButton
        {...createFabProps({
          floatingButton: {
            id: "fb-1",
            name: "FAB",
            displayName: "FAB",
            fields: {
              Heading: { value: "Need help?" },
              Text: { value: "Contact us" },
              Link: { value: { href: "", text: "Go" } },
            },
          },
          isEditing: false,
        })}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders an intralox SVG icon when Icon droplink is an unexpanded GUID", () => {
    const { container } = render(
      <FloatingActionButton
        {...createFabProps({
          floatingButton: {
            id: "fb-guid",
            fields: {
              Heading: { value: "Help" },
              Link: { value: { href: "/contact", text: "Contact" } },
              Icon: { value: "{4E8FAD49-EA87-464F-AC7D-54E924EF187D}" },
            },
          },
        })}
      />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders an intralox SVG icon when Icon CssClass is set", () => {
    const { container } = render(
      <FloatingActionButton
        {...createFabProps({
          floatingButton: {
            id: "fb-icon",
            fields: {
              Heading: { value: "Help" },
              Link: { value: { href: "/contact", text: "Contact" } },
              Icon: {
                fields: { CssClass: { value: "fa-solid fa-phone" } },
              },
            },
          },
        })}
      />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders an intralox SVG icon when Icon Value is fa-solid fa-phone-volume", () => {
    const { container } = render(
      <FloatingActionButton
        {...createFabProps({
          floatingButton: {
            id: "e23687a1-bd37-4be6-8c63-e80f4aaa63c1",
            name: "Solutions  Foodsafe",
            displayName: "Solutions  Foodsafe",
            fields: {
              Heading: { value: "Looking to safeguard your success?" },
              Text: { value: "Contact Customer Service" },
              Link: { value: { href: "/", text: "", target: "_blank" } },
              Icon: {
                id: "4e8fad49-ea87-464f-ac7d-54e924ef187d",
                name: "Phone",
                displayName: "Phone",
                fields: { Value: { value: "fa-solid fa-phone-volume" } },
              },
            },
          },
        })}
      />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders an intralox SVG icon when Icon uses intralox utility kit classes", () => {
    const { container } = render(
      <FloatingActionButton
        {...createFabProps({
          floatingButton: {
            id: "fb-utility",
            fields: {
              Heading: { value: "Help" },
              Link: { value: { href: "/contact", text: "Contact" } },
              Icon: {
                fields: {
                  CssClass: {
                    value: "fa-utility-fill fa-semibold fa-phone-volume",
                  },
                },
              },
            },
          },
        })}
      />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders a link with href, surface classes, and aria-label from field text", () => {
    render(
      <FloatingActionButton
        {...createFabProps({
          floatingButton: {
            id: "fb-1",
            name: "FAB",
            displayName: "FAB",
            fields: {
              Heading: { value: "Heading" },
              Text: { value: "Sub" },
              Link: {
                value: {
                  href: "/contact",
                  text: "Contact",
                },
              },
            },
          },
        })}
      />,
    );

    const link = screen.getByRole("link", { name: "Heading. Sub. Contact" });
    expect(link).toHaveAttribute("href", "/contact");
    expect(link.className).toMatch(/shadow-fab/);
  });

  it("sets rel noopener noreferrer when link target is _blank", () => {
    render(
      <FloatingActionButton
        {...createFabProps({
          floatingButton: {
            id: "fb-1",
            fields: {
              Heading: { value: "Open" },
              Link: {
                value: {
                  href: "https://example.com",
                  text: "External",
                  target: "_blank",
                },
              },
            },
          },
        })}
      />,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a grouping div with aria-label when editing without a link field", () => {
    render(
      <FloatingActionButton
        {...createFabProps({
          isEditing: true,
          floatingButton: {
            id: "fb-1",
            fields: {
              Heading: { value: "Only heading" },
            },
          },
        })}
      />,
    );

    expect(
      screen.getByRole("group", { name: "Only heading" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("FloatingActionButtonPill", () => {
  it("renders heading and sub text when flags and fields are set", () => {
    render(
      <FloatingActionButtonPill
        headingField={{ value: "Line 1" }}
        textField={{ value: "Line 2" }}
        iconResolved={null}
        showHeading
        showText
        showIcon={false}
      />,
    );

    expect(screen.getByText("Line 1")).toBeInTheDocument();
    expect(screen.getByText("Line 2")).toBeInTheDocument();
  });
});
