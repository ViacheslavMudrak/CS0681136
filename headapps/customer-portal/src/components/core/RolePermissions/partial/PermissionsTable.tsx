"use client";

import type { ReactElement } from "react";

import ChevronDownIcon from "@/components/shared/icons/ChevronDownIcon";
import Table from "@/components/ui/table/Table";
import { NextImage as ContentSdkImage } from "@sitecore-content-sdk/nextjs";
import type { ImageField } from "@sitecore-content-sdk/nextjs";
import { useEffect, useMemo, useState } from "react";

import type { RolePermissionsMatrix, RolePermissionsPermission } from "../RolePermissions.type";
import { RolePermissionsCheckmarkCell } from "./CheckmarkCell";
import { cn } from "@/lib/utils";
import { TableColumn } from "@/components/ui/table/Table.types";

export interface RolePermissionsTableProps {
  data: RolePermissionsMatrix;
  matrix: Record<string, Record<string, boolean>>;
  isEditMode: boolean;
  permissionColumnLabel: string;
  permissionIcon?: ImageField;
  editIconChecked?: ImageField;
  editIconUnchecked?: ImageField;
  onToggle: (permissionId: string, roleId: string, enabled: boolean) => void;
}

/** Figma table header typography (node 2318:61189). */
const headerCellPermission =
  "!text-[11px] !font-bold !uppercase !tracking-[0.5px] !leading-[1.375] !text-[var(--color-role-permissions-header-label)] !px-[12px] !py-[12px] !border-b !border-[var(--color-role-permissions-header-border)]";

const headerCellRole =
  "!text-[11px] !font-bold !uppercase !tracking-[0.5px] !leading-[15px] !text-[var(--color-role-permissions-header-label)] !px-[12px] !py-[12px] !border-b !border-[var(--color-role-permissions-header-border)]";

const bodyCellPermission =
  "!text-[14px] !font-medium !leading-[1.375] !text-[var(--color-text-black)] !px-[12px] !py-[12px]";

const bodyCellRole = "!px-[12px] !py-[12px] align-middle";

function renderPermissionCell(
  checked: boolean,
  permissionName: string,
  roleName: string,
  isEditMode: boolean,
  editIconChecked: ImageField | undefined,
  editIconUnchecked: ImageField | undefined,
  permissionIcon: ImageField | undefined,
  onToggle: (enabled: boolean) => void,
  layout: "table" | "mobile" = "table"
): ReactElement {
  const cellWrapClass =
    layout === "mobile"
      ? "flex min-h-4 min-w-4 w-4 shrink-0 items-center justify-center"
      : "role-permission-cell-center flex h-full min-h-[16px] w-full items-center justify-center";

  const cellWrapViewClass =
    layout === "mobile"
      ? "flex min-h-4 min-w-4 w-4 shrink-0 items-center justify-center"
      : "role-permission-cell-center flex h-full w-full items-center justify-center";

  if (isEditMode) {
    const checkedSrc = editIconChecked?.value?.src;
    const uncheckedSrc = editIconUnchecked?.value?.src;
    return (
      <div className={cellWrapClass}>
        <label className="inline-flex h-[18px] w-4 shrink-0 cursor-pointer flex-row items-center justify-center">
          <input
            type="checkbox"
            className="absolute -m-px h-px w-px overflow-hidden border-0 p-0 [clip:rect(0,0,0,0)]"
            checked={checked}
            onChange={(e) => onToggle(e.target.checked)}
            aria-label={`${permissionName} — ${roleName}`}
          />
          {checkedSrc && uncheckedSrc ? (
            <ContentSdkImage
              field={checked ? editIconChecked : editIconUnchecked}
              width={16}
              height={16}
              alt=""
              className="object-contain"
              loading="lazy"
              aria-hidden
            />
          ) : (
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded border border-[var(--color-role-permissions-checkbox-border)] bg-[var(--color-bg-basic-color)]"
              aria-hidden
            />
          )}
        </label>
      </div>
    );
  }

  return (
    <div className={cellWrapViewClass}>
      <RolePermissionsCheckmarkCell hasPermission={checked} iconField={permissionIcon} />
    </div>
  );
}

/**
 * Roles × permissions matrix table with view or edit (checkbox) cells.
 */
export function RolePermissionsTable({
  data,
  matrix,
  isEditMode,
  permissionColumnLabel,
  permissionIcon,
  editIconChecked,
  editIconUnchecked,
  onToggle,
}: RolePermissionsTableProps): ReactElement {
  const { roles, permissions } = data;
  const [expandedPermissionIds, setExpandedPermissionIds] = useState<string[]>([]);

  useEffect(() => {
    if (!permissions.length) {
      setExpandedPermissionIds([]);
      return;
    }
    setExpandedPermissionIds([permissions[0].id]);
  }, [permissions]);

  const toggleExpanded = (permissionId: string) => {
    setExpandedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const columns: TableColumn<RolePermissionsPermission>[] = useMemo(() => {
    return [
      {
        id: "col-permission",
        label: permissionColumnLabel,
        key: "name",
        align: "left",
        width: "min-w-[240px] max-w-[432px] shrink-0",
        cellClassName: bodyCellPermission,
        headerClassName: headerCellPermission,
      },
      ...roles.map((role) => ({
        id: `col-role-${role.id}`,
        label: role.name,
        align: "center" as const,
        headerClassName: headerCellRole,
        render: (permission: RolePermissionsPermission) => {
          const checked = matrix[permission.id]?.[role.id] ?? false;
          return renderPermissionCell(
            checked,
            permission.name,
            role.name,
            isEditMode,
            editIconChecked,
            editIconUnchecked,
            permissionIcon,
            (enabled: boolean) => onToggle(permission.id, role.id, enabled),
            "table"
          );
        },
        cellClassName: bodyCellRole,
      })),
    ];
  }, [
    roles,
    matrix,
    isEditMode,
    permissionColumnLabel,
    permissionIcon,
    editIconChecked,
    editIconUnchecked,
    onToggle,
  ]);

  return (
    <div className="flex w-full max-w-full flex-col items-center justify-start gap-3 rounded-md border border-[var(--color-role-permissions-shell-border)] bg-[var(--color-bg-basic-color)] p-0">
      <div className="block w-full sm:hidden">
        <div className="w-full rounded border border-[var(--color-border-gray-300)] bg-[var(--color-bg-basic-color)] px-[13px] py-px">
          {permissions.map((permission) => {
            const isExpanded = expandedPermissionIds.includes(permission.id);
            return (
              <div
                key={permission.id}
                className="w-full border-b border-[var(--color-border-gray-300)] last:border-b-0"
              >
                <button
                  type="button"
                  className="m-0 flex w-full min-h-0 min-w-0 cursor-pointer items-center gap-8 border-0 bg-transparent px-0 py-3 text-start"
                  onClick={() => toggleExpanded(permission.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`role-perm-mobile-${permission.id}`}
                >
                  <span className="min-w-0 flex-1 text-left text-[16px] font-[500] leading-[1.5] text-[var(--color-text-black)]">
                    {permission.name}
                  </span>
                  <span
                    className={cn(
                      "inline-flex size-[18px] shrink-0 items-center justify-center text-[var(--color-text-black)] transition-transform",
                      isExpanded && "rotate-180"
                    )}
                    aria-hidden
                  >
                    <ChevronDownIcon width={18} height={18} />
                  </span>
                </button>

                {isExpanded ? (
                  <div
                    id={`role-perm-mobile-${permission.id}`}
                    className="w-full bg-[var(--color-bg-basic-color)] pb-0 pt-0"
                  >
                    {roles.map((role) => {
                      const checked = matrix[permission.id]?.[role.id] ?? false;
                      return (
                        <div
                          key={`${permission.id}-${role.id}`}
                          className="flex w-full min-w-0 items-center gap-2.5 py-4"
                        >
                          <span className="min-w-0 flex-1 text-left text-[14px] font-[400] uppercase leading-[1.5] tracking-[0.5px] text-[var(--color-role-permissions-header-label)]">
                            {role.name}
                          </span>
                          {renderPermissionCell(
                            checked,
                            permission.name,
                            role.name,
                            isEditMode,
                            editIconChecked,
                            editIconUnchecked,
                            permissionIcon,
                            (enabled: boolean) => onToggle(permission.id, role.id, enabled),
                            "mobile"
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden w-full overflow-hidden rounded-[var(--color-role-permissions-table-inner-radius)] sm:block">
        <div className="w-full [&_[role=columnheader]]:!border-e-0 [&_[role=gridcell]]:!border-0 [&_[role=gridcell]]:!border-b-0 [&_[role=gridcell]]:!border-e-0">
          <Table
            data={permissions}
            columns={columns}
            getRowKey={(permission: RolePermissionsPermission) => `row-perm-${permission.id}`}
            striped
            hoverable
            borderStyle="none"
            ariaLabel="Roles and Permissions"
            size="md"
            rowClassName="min-h-[43px]"
            headerBgColor="!bg-[var(--color-role-permissions-header-bg)]"
            headerTextColor="!text-[var(--color-role-permissions-header-label)]"
            rowBgColor={(index: number) =>
              index % 2 === 0
                ? "bg-[var(--color-bg-basic-color)]"
                : "bg-[var(--color-role-permissions-table-stripe)]"
            }
            hoverColor="hover:bg-[var(--color-role-permissions-header-bg)]"
            className="w-full rounded-none border-0 shadow-none [&_table]:border-0"
          />
        </div>
      </div>
    </div>
  );
}
