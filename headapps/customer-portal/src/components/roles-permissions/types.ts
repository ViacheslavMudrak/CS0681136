export interface Role {
  id: string;
  name: string;
}

export interface Permission {
  id: string;
  name: string;
}

export interface PermissionMatrix {
  roles: Role[];
  permissions: Permission[];
  matrix: Record<string, Record<string, boolean>>; // permissionId -> roleId -> hasPermission
}
