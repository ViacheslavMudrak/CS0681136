import type { Field, ImageField, TextField } from "@sitecore-content-sdk/nextjs";

/**
 * Sitecore field definitions for RolePermissions (Manage Roles & Permissions).
 */
export interface IRolePermissionsFields {
  Title?: TextField;
  AuditLogLabel?: TextField;
  EditLinkLabel?: TextField;
  PermissionIcon?: ImageField;
  PermissionEditIcon?: ImageField;
  EditIconChecked?: ImageField;
  EditIconUnchecked?: ImageField;
  SaveTitle?: TextField;
  SaveDescription?: Field<string>;
  HideAuditLog?: Field<boolean>;
}

/** Role column (profile) in the permissions matrix. */
export interface RolePermissionsRole {
  id: string;
  name: string;
}

/** Permission row in the matrix. */
export interface RolePermissionsPermission {
  id: string;
  name: string;
}

/** Matrix: permissionId -> profileId -> enabled */
export interface RolePermissionsMatrix {
  roles: RolePermissionsRole[];
  permissions: RolePermissionsPermission[];
  matrix: Record<string, Record<string, boolean>>;
}
