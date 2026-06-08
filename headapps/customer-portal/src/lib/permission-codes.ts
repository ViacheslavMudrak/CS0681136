/**
 * DXP permission catalog: constant names map to permissionCode strings returned by the API.
 * Use these keys with {@link usePermissionContext}.`can` / `canAny` / `canAll`.
 */
export const PERMISSION_CODES = {
  MANAGE_USERS_ROLES_PERMISSIONS: "internal:manage:users",
  VIEW_ORDER_HISTORY: "orders:view:historylist",
  VIEW_INVOICES: "orders:view:invoices",
  INITIATE_RFQ: "orders:initiate:rfq",
  REQUEST_DOCUMENTATION: "support:request:documentation",
  VIEW_TECHNICAL_DOCS: "resources:view:technicaldocs",
  ACCESS_TOOLS_CALCULATOR: "tools:access:calculator",
} as const;

export type PermissionCode = (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];
