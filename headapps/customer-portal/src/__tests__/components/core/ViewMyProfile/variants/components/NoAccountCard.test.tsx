import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoAccountCard } from "components/core/ViewMyProfile/variants/components/NoAccountCard";

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field, alt, width, height, className }: any) =>
    field?.value?.src ? (
      <img
        src={field.value.src}
        alt={(alt ?? field.value.alt ?? "") as string}
        width={width}
        height={height}
        className={className}
        data-testid="no-account-icon"
      />
    ) : null,
  RichText: ({ field }: any) =>
    field?.value ? <div data-testid="no-account-rich-text">{field.value}</div> : null,
  Link: ({ field, className, children }: any) => {
    const href = field?.value?.href ?? "#";
    const text = children ?? field?.value?.text ?? "";
    return (
      <a href={href} className={className} data-testid="no-account-cta">
        {text}
      </a>
    );
  },
}));

describe("NoAccountCard", () => {
  it("renders shell without rich text when noAccountText is missing", () => {
    render(<NoAccountCard />);

    expect(screen.getByTestId("view-my-profile-no-account")).toBeInTheDocument();
    expect(screen.queryByTestId("no-account-rich-text")).not.toBeInTheDocument();
  });

  it("renders custom text from noAccountText field", () => {
    render(<NoAccountCard noAccountText={{ value: "Nothing here" }} />);

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders icon when noAccountIcon has src", () => {
    render(
      <NoAccountCard
        noAccountIcon={{
          value: { src: "/empty.svg", alt: "Empty state", width: 36, height: 32 },
        }}
      />
    );

    const img = screen.getByTestId("no-account-icon");
    expect(img).toHaveAttribute("src", "/empty.svg");
    expect(img).toHaveAttribute("alt", "Empty state");
  });

  it("does not render icon when noAccountIcon has no src", () => {
    render(<NoAccountCard noAccountIcon={{ value: {} }} />);

    expect(screen.queryByTestId("no-account-icon")).not.toBeInTheDocument();
  });

  it("renders CTA link when noAccountCTA has href and text", () => {
    render(
      <NoAccountCard
        noAccountCTA={{
          value: { href: "/support", text: "Get help" },
        }}
      />
    );

    const cta = screen.getByRole("link", { name: "Get help" });
    expect(cta).toHaveAttribute("href", "/en/support");
    expect(cta).toHaveTextContent("Get help");
  });

  it("does not render CTA when link has no href or text", () => {
    render(
      <NoAccountCard
        noAccountCTA={{
          value: { href: "", text: "" },
        }}
      />
    );

    expect(screen.queryByRole("link", { name: "Get help" })).not.toBeInTheDocument();
  });
});
