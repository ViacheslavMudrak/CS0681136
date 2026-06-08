import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { RolePermissionsDefaultVariant } from "components/core/RolePermissions/variants/RolePermissionsDefault.variant";
import type { IRolePermissionsFields } from "components/core/RolePermissions/RolePermissions.type";
import { I18N } from "src/lib/dictionary-keys";

const {
  mockGetAllPermissions,
  mockGetProfilePermissions,
  mockGetPermissionAuditLogs,
  mockUpdateProfilePermissions,
  mockPermissionRefresh,
} = vi.hoisted(() => ({
  mockGetAllPermissions: vi.fn(),
  mockGetProfilePermissions: vi.fn(),
  mockGetPermissionAuditLogs: vi.fn(),
  mockUpdateProfilePermissions: vi.fn(),
  mockPermissionRefresh: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/apis/permissions-api", () => ({
  getAllPermissions: mockGetAllPermissions,
  getProfilePermissions: mockGetProfilePermissions,
  getPermissionAuditLogs: mockGetPermissionAuditLogs,
  updateProfilePermissions: mockUpdateProfilePermissions,
}));

vi.mock("@/lib/permission-context", () => ({
  usePermissionContext: () => ({
    grantedCodes: new Set<string>(),
    isLoading: false,
    hasResolved: true,
    error: null,
    refresh: mockPermissionRefresh,
    can: () => true,
    canAny: () => true,
    canAll: () => true,
    sitecoreEditingPermissionBypass: false,
  }),
}));

const mockT = vi.fn((key: string) => {
  const map: Record<string, string> = {
    [I18N.PermissionNameColumn]: "PERMISSION NAME",
    [I18N.PermissionCancel]: "Cancel",
    [I18N.PermissionSave]: "Save",
    [I18N.EditCancel]: "Modal Cancel",
    [I18N.EditSave]: "Modal Save",
  };
  return map[key] ?? key;
});

vi.mock("next-intl", () => ({
  useTranslations: () => mockT,
}));

vi.mock("@sitecore-content-sdk/nextjs", () => ({
  NextImage: ({ field, alt, width, height, className }: Record<string, unknown> & {
    field?: { value?: { src?: string; alt?: string } };
  }) => {
    const src = field?.value?.src;
    if (!src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={(alt ?? field?.value?.alt ?? "") as string}
        width={width as number}
        height={height as number}
        className={className as string}
        data-testid="permission-edit-icon"
      />
    );
  },
  Text: ({
    field,
    tag = "span",
    className,
  }: {
    field?: { value?: string };
    tag?: "span" | "h2" | "p";
    className?: string;
  }) => {
    if (field?.value === undefined || field?.value === null) return null;
    const Tag = tag;
    return <Tag className={className}>{field.value}</Tag>;
  },
}));

vi.mock("@/components/shared/icons/ChevronRightIcon", () => ({
  default: () => <span data-testid="chevron-right" />,
}));

vi.mock("@/components/shared/permissions/PermissionGate", () => ({
  default: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/Button", () => ({
  default: ({
    children,
    onClick,
    onPress,
    type,
    className,
    isDisabled,
    ...rest
  }: {
    children?: ReactNode;
    onClick?: () => void;
    onPress?: () => void;
    type?: "button" | "submit" | "reset";
    className?: string;
    isDisabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button
      type={type ?? "button"}
      onClick={() => {
        onClick?.();
        onPress?.();
      }}
      className={className}
      disabled={isDisabled}
      data-testid="ui-button"
      {...rest}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/shared/modal/Modal", () => ({
  default: ({
    isOpen,
    children,
    title,
  }: {
    isOpen: boolean;
    children: ReactNode;
    title?: ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal-shell" role="dialog">
        <div data-testid="modal-title-slot">{title}</div>
        {children}
      </div>
    ) : null,
}));

vi.mock("@/components/core/RolePermissions/partial/PermissionsTable", () => ({
  RolePermissionsTable: ({
    data,
    permissionColumnLabel,
  }: {
    data: { permissions: { id: string; name: string }[] };
    permissionColumnLabel: string;
  }) => (
    <div
      data-testid="role-permissions-table"
      aria-label="Roles and Permissions"
    >
      <span data-testid="column-label">{permissionColumnLabel}</span>
      {data.permissions.map((p) => (
        <div key={p.id} data-testid={`perm-row-${p.id}`}>
          {p.name}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/core/RolePermissions/partial/RolePermissionsAuditLog", () => ({
  RolePermissionsAuditLog: ({
    isOpen,
    title,
  }: {
    isOpen: boolean;
    title: string;
  }) =>
    isOpen ? (
      <div data-testid="audit-log-panel" data-audit-title={title} />
    ) : null,
}));

const baseParams = {
  styles: "",
  RenderingIdentifier: "rp-1",
} as const;

const baseFields: IRolePermissionsFields = {
  Title: { value: "Manage Roles & Permissions" },
  AuditLogLabel: { value: "Audit Log" },
  EditLinkLabel: { value: "Edit" },
  SaveTitle: { value: "Save changes?" },
  SaveDescription: { value: "Changes apply immediately." },
};

const successfulCatalog = {
  success: true,
  statusCode: 200,
  methodName: "GetAllPermissions",
  message: "",
  data: [
    { permissionId: 1, permissionName: "View Orders", permissionCode: "o" },
  ],
  totalRecords: 1,
  errors: null,
};

const successfulProfiles = {
  success: true,
  statusCode: 200,
  methodName: "GetProfilePermissions",
  message: "",
  data: {
    profiles: [
      {
        profileId: 10,
        profileName: "Corporate",
        permissions: [
          {
            permissionId: 1,
            permissionName: "View Orders",
            permissionCode: "o",
            isEnabled: true,
          },
        ],
      },
    ],
  },
  totalRecords: 1,
  errors: null,
};

function renderVariant(
  overrides?: Partial<{
    fields: IRolePermissionsFields | null;
    page: { mode: { isEditing: boolean } };
  }>
) {
  return render(
    <RolePermissionsDefaultVariant
      testId="role-permissions-variant"
      fields={overrides?.fields ?? baseFields}
      params={{ ...baseParams }}
      page={overrides?.page as never}
    />
  );
}

describe("RolePermissionsDefaultVariant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllPermissions.mockResolvedValue(successfulCatalog);
    mockGetProfilePermissions.mockResolvedValue(successfulProfiles);
    mockGetPermissionAuditLogs.mockResolvedValue({
      success: true,
      statusCode: 200,
      methodName: "GetPermissionAuditLogs",
      message: "",
      data: {
        page: 1,
        pageSize: 10,
        totalRecords: 0,
        logs: [],
      },
      totalRecords: null,
      errors: null,
    });
    mockUpdateProfilePermissions.mockResolvedValue({
      success: true,
      statusCode: 200,
      methodName: "Update",
      message: "",
      data: null,
      totalRecords: null,
      errors: null,
    });
  });

  it("shows loading skeleton then renders title and permission rows after API success", async () => {
    renderVariant();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("role-permissions-table")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "Manage Roles & Permissions" })).toBeInTheDocument();
    expect(screen.getByTestId("role-permissions-table")).toBeInTheDocument();
    expect(screen.getByTestId("column-label")).toHaveTextContent("PERMISSION NAME");
    expect(screen.getByTestId("perm-row-1")).toHaveTextContent("View Orders");
    expect(mockT).toHaveBeenCalledWith(I18N.PermissionNameColumn);
  });

  it("renders empty state when catalog has no permissions", async () => {
    mockGetAllPermissions.mockResolvedValue({
      ...successfulCatalog,
      data: [],
    });
    mockGetProfilePermissions.mockResolvedValue(successfulProfiles);

    renderVariant();

    await waitFor(() => {
      expect(screen.getByText("No permissions available.")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("role-permissions-table")).not.toBeInTheDocument();
  });

  it("shows load error when getAllPermissions throws", async () => {
    mockGetAllPermissions.mockRejectedValue(new Error("Network down"));

    renderVariant();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network down");
    });
  });

  it("enters edit mode and shows toolbar Save/Cancel labels", async () => {
    const user = userEvent.setup();
    renderVariant();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const buttons = screen.getAllByRole("button", { name: "Cancel" });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: "Save" }).length).toBeGreaterThanOrEqual(1);
  });

  it("opens save modal from Save and shows modal action labels", async () => {
    const user = userEvent.setup();
    renderVariant();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "Edit" }));

    const saveButtons = screen.getAllByRole("button", { name: "Save" });
    await user.click(saveButtons[0]);

    const modal = await screen.findByTestId("modal-shell");
    expect(within(modal).getByText("Modal Cancel")).toBeInTheDocument();
    expect(within(modal).getByText("Modal Save")).toBeInTheDocument();
    expect(within(modal).getByText("Save changes?")).toBeInTheDocument();
    expect(within(modal).getByText("Changes apply immediately.")).toBeInTheDocument();
  });

  it("calls updateProfilePermissions when modal save is confirmed", async () => {
    const user = userEvent.setup();
    renderVariant();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getAllByRole("button", { name: "Save" })[0]);

    const modal = await screen.findByTestId("modal-shell");
    await user.click(within(modal).getByRole("button", { name: "Modal Save" }));

    await waitFor(() => {
      expect(mockUpdateProfilePermissions).toHaveBeenCalled();
    });
    const payload = mockUpdateProfilePermissions.mock.calls[0][0];
    expect(Array.isArray(payload)).toBe(true);
    expect(payload[0]).toMatchObject({
      profileId: "10",
      updatedPermissions: expect.arrayContaining([
        expect.objectContaining({ permissionId: "1", enabled: true }),
      ]),
    });
  });

  it("opens audit log panel when Audit Log is clicked", async () => {
    const user = userEvent.setup();
    renderVariant();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Audit Log/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /Audit Log/i }));

    expect(screen.getByTestId("audit-log-panel")).toHaveAttribute(
      "data-audit-title",
      "Audit Log"
    );
  });
});
