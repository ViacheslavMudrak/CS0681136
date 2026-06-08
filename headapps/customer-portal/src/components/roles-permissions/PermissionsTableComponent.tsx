"use client";

import Table from "@/components/ui/table/Table";
import { Checkbox } from "@laitram-l-l-c/intralox-ui-components";
import { useMemo } from "react";
import { RolePermissionsCheckmarkCell } from "@/components/core/RolePermissions/partial/CheckmarkCell";
import type { Permission, PermissionMatrix } from "./types";
import { TableColumn } from "../ui/table/Table.types";

interface PermissionsTableProps {
  data: PermissionMatrix;
  isEditMode: boolean;
}

export default function PermissionsTableComponent({ data, isEditMode }: PermissionsTableProps) {
  const { roles, permissions, matrix } = data;

  const columns: TableColumn<(typeof permissions)[0]>[] = useMemo(() => {
    return [
      {
        id: "permission",
        label: "PERMISSION NAME",
        key: "name",
        align: "left",
        width: "w-96",
        cellClassName: "font-medium text-gray-900 align-left",
        headerClassName: "font-bold uppercase tracking-wide text-gray-800",
      },
      ...roles.map((role) => ({
        id: role.id,
        label: role.name,
        align: "center" as const,
        headerClassName: "font-bold uppercase tracking-wide text-gray-800 align-center",
        render: (permission: (typeof permissions)[0]) =>
          isEditMode ? (
            <Checkbox
              className="inline-flex flex-row items-start py-px gap-[10px] w-4 h-[18px] flex-none cursor-pointer"
              isSelected={matrix[permission.id]?.[role.id] || false}
              aria-label={`Permission ${permission.name} for ${role.name}`}
            />
          ) : (
            <RolePermissionsCheckmarkCell hasPermission={matrix[permission.id]?.[role.id] || false} />
          ),
      })),
    ];
  }, [roles, matrix, isEditMode]);

  return (
    <div className="w-full bg-white rounded-md outline  outline-1 outline-gray-200 inline-flex flex-col justify-start items-center gap-3 p-0">
      <Table
        data={permissions}
        columns={columns}
        getRowKey={(permission: Permission) => permission.id}
        striped
        hoverable
        borderStyle="full"
        ariaLabel="Roles and Permissions"
        headerBgColor="bg-slate-50"
        headerTextColor="text-gray-800"
        rowBgColor={(index: number) => (index % 2 === 0 ? "bg-white" : "bg-[#F8FAFD]")}
        hoverColor="hover:bg-gray-100"
        className="rounded-[inherit]"
      />
    </div>
  );
}
