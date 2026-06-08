import type {
  DxpPermission,
  DxpProfileWithPermissions,
  UpdateProfilePermissionsPayload,
} from "@/lib/apis/permissions-api";

import type {
  RolePermissionsMatrix,
  RolePermissionsPermission,
  RolePermissionsRole,
} from "@/components/core/RolePermissions/RolePermissions.type";

/**
 * Builds the UI matrix from DXP catalog and profile permission payloads.
 */
export function buildRolePermissionsMatrix(
  catalog: DxpPermission[],
  profiles: DxpProfileWithPermissions[]
): RolePermissionsMatrix {
  const roles: RolePermissionsRole[] = profiles.map((p) => ({
    id: String(p.profileId),
    name: p.profileName.toUpperCase(),
  }));

  const permissions: RolePermissionsPermission[] = catalog.map((p) => ({
    id: String(p.permissionId),
    name: p.permissionName,
  }));

  const matrix: Record<string, Record<string, boolean>> = {};
  for (const perm of permissions) {
    matrix[perm.id] = {};
    for (const role of roles) {
      matrix[perm.id][role.id] = false;
    }
  }

  for (const profile of profiles) {
    const roleId = String(profile.profileId);
    for (const pp of profile.permissions) {
      const pid = String(pp.permissionId);
      if (matrix[pid] && matrix[pid][roleId] !== undefined) {
        matrix[pid][roleId] = pp.isEnabled;
      }
    }
  }

  return { roles, permissions, matrix };
}

/**
 * Deep-clones the boolean matrix for local edit state.
 */
export function cloneRolePermissionsMatrix(
  matrix: Record<string, Record<string, boolean>>
): Record<string, Record<string, boolean>> {
  const next: Record<string, Record<string, boolean>> = {};
  for (const [permId, row] of Object.entries(matrix)) {
    next[permId] = { ...row };
  }
  return next;
}

/**
 * Builds the PATCH payload from the current matrix (full snapshot per profile).
 */
export function buildUpdatePayloadFromMatrix(
  data: RolePermissionsMatrix
): UpdateProfilePermissionsPayload {
  return data.roles.map((role) => ({
    profileId: role.id,
    updatedPermissions: data.permissions.map((perm) => ({
      permissionId: perm.id,
      enabled: data.matrix[perm.id]?.[role.id] ?? false,
    })),
  }));
}
