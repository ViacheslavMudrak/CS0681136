import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WidgetBackButton } from "components/core/Auth/components/WidgetBackButton/WidgetBackButton";

describe("WidgetBackButton", () => {
  const handleClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children inside a button", () => {
    render(
      <WidgetBackButton handleClick={handleClick}>
        Back to sign in
      </WidgetBackButton>
    );

    expect(
      screen.getByRole("button", { name: "Back to sign in" })
    ).toBeInTheDocument();
  });

  it("calls handleClick when the button is pressed", async () => {
    const user = userEvent.setup();
    render(
      <WidgetBackButton handleClick={handleClick}>
        Go back
      </WidgetBackButton>
    );

    await user.click(screen.getByRole("button", { name: "Go back" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
