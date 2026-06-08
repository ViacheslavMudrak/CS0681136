import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RolePermissionsSaveModal } from "@/components/core/RolePermissions/partial/RolePermissionsSaveModal";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/shared/modal/Modal", () => ({
  default: ({
    isOpen,
    children,
    onClose,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-modal="true">
        <button type="button" aria-label="Close modal" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  Text: ({ field, tag: Tag = "span" }: { field?: { value?: string }; tag?: string }) => (
    <Tag>{field?.value ?? ""}</Tag>
  ),
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    onClick,
    onPress,
    isDisabled,
    ...rest
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    onPress?: () => void;
    isDisabled?: boolean;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      type="button"
      onClick={onPress ?? onClick}
      disabled={isDisabled}
      {...rest}
    >
      {children}
    </button>
  ),
}));

describe("RolePermissionsSaveModal", () => {
  it("renders CMS title and description when provided", () => {
    render(
      <RolePermissionsSaveModal
        isOpen
        saveTitle={{ value: "Save permissions?" }}
        saveDescription={{ value: "This cannot be undone." }}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Save permissions?" })).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("invokes cancel and confirm handlers", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <RolePermissionsSaveModal isOpen onClose={onClose} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole("button", { name: "edit_cancel_role" }));
    await user.click(screen.getByRole("button", { name: "edit_save" }));

    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalled();
  });

  it("disables actions while saving", () => {
    render(
      <RolePermissionsSaveModal
        isOpen
        isSaving
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "edit_cancel_role" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "edit_save" })).toBeDisabled();
  });
});
