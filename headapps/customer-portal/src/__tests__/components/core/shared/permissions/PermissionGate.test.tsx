import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import PermissionGate from "@/components/shared/permissions/PermissionGate";

const { mockUsePermissionGuard } = vi.hoisted(() => ({
  mockUsePermissionGuard: vi.fn(),
}));

vi.mock("@/lib/permission-context", () => ({
  usePermissionGuard: mockUsePermissionGuard,
}));

function renderGate(children: ReactNode, fallback?: ReactNode) {
  return render(
    <PermissionGate required={["internal:manage:users"]} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

describe("PermissionGate", () => {
  it("renders children when access is allowed", () => {
    mockUsePermissionGuard.mockReturnValue({
      isAllowed: true,
      isProtected: true,
      requiredCodes: ["internal:manage:users"],
      isLoading: false,
      error: null,
    });

    renderGate(<span>Allowed content</span>);
    expect(screen.getByText("Allowed content")).toBeInTheDocument();
  });

  it("renders fallback when access is denied", () => {
    mockUsePermissionGuard.mockReturnValue({
      isAllowed: false,
      isProtected: true,
      requiredCodes: ["internal:manage:users"],
      isLoading: false,
      error: null,
    });

    renderGate(<span>Allowed content</span>, <span>Denied content</span>);
    expect(screen.queryByText("Allowed content")).not.toBeInTheDocument();
    expect(screen.getByText("Denied content")).toBeInTheDocument();
  });
});
