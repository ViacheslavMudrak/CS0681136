"use client";

import { API_ROUTES } from "@/lib/apis/api-routes";
import { request } from "@/lib/apis/api-service";

/** Single permission in the global catalog (GET /permissions). */
export interface DxpPermission {
  permissionId: number;
  permissionName: string;
  permissionCode: string;
}

/** Wrapped DXP response for GET /permissions. */
export interface GetAllPermissionsResponse {
  success: boolean;
  statusCode: number;
  methodName: string;
  message: string;
  data: DxpPermission[] | null;
  totalRecords: number | null;
  errors: unknown;
}

/** Permission row under a profile (includes enabled flag). */
export interface DxpProfilePermission {
  permissionId: number;
  permissionName: string;
  permissionCode: string;
  isEnabled: boolean;
}

export interface DxpProfileWithPermissions {
  profileId: number;
  profileName: string;
  permissions: DxpProfilePermission[];
}

/** Wrapped DXP response for GET /profiles/permissions. */
export interface GetProfilePermissionsResponse {
  success: boolean;
  statusCode: number;
  methodName: string;
  message: string;
  data: {
    profiles: DxpProfileWithPermissions[];
  } | null;
  totalRecords: number | null;
  errors: unknown;
}

/** One permission toggle for PATCH /profiles/permissions. */
export interface UpdateProfilePermissionItem {
  permissionId: string | number;
  enabled: boolean;
}

/**
 * Permission updates for a single profile.
 * PATCH body is an array of these (one entry per profile being updated).
 */
export interface ProfilePermissionsUpdate {
  profileId: string | number;
  updatedPermissions: UpdateProfilePermissionItem[];
}

/** PATCH body: multiple profiles, each with its own permission toggles. */
export type UpdateProfilePermissionsPayload = ProfilePermissionsUpdate[];

/** Wrapped DXP response for PATCH /profiles/permissions. */
export interface UpdateProfilePermissionsResponse {
  success: boolean;
  statusCode: number;
  methodName: string;
  message: string;
  data: unknown;
  totalRecords: number | null;
  errors: unknown;
}

/** One user-specific permission item from GET /users/permissions. */
export interface DxpUserSpecificPermission {
  permissionId: number;
  permissionName: string;
  permissionCode: string;
  isEnabled: boolean;
}

/** Wrapped DXP response for GET /users/permissions. */
export interface GetUserSpecificPermissionsResponse {
  success: boolean;
  statusCode: number;
  methodName: string;
  message: string;
  data: DxpUserSpecificPermission[] | null;
  totalRecords: number | null;
  errors: unknown;
}

/** One audit row from GET /permission-logs. */
export interface PermissionAuditLogItem {
  auditLogId: string;
  description: string;
  permissionId: number;
  permissionName: string;
  permissionCode: string;
  profileId: number;
  profileName: string;
  oldValue: string;
  newValue: string;
  updatedByUserId: string;
  updatedByUserName: string;
  updatedAt: string;
}

export interface PermissionAuditLogsData {
  page: number;
  pageSize: number;
  totalRecords: number;
  logs: PermissionAuditLogItem[];
}

/** Wrapped DXP response for GET /permission-logs. */
export interface GetPermissionAuditLogsResponse {
  success: boolean;
  statusCode: number;
  methodName: string;
  message: string;
  data: PermissionAuditLogsData | null;
  totalRecords: number | null;
  errors: unknown;
}

export interface GetPermissionAuditLogsParams {
  page?: number | string;
  pageSize?: number | string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

/**
 * GET /permissions — full permission catalog (GetAllPermissions).
 * @returns API envelope or null if base URL missing or request fails
 */
export async function getAllPermissions(): Promise<GetAllPermissionsResponse | null> {
  try {
    return await request<GetAllPermissionsResponse>({
      method: "GET",
      path: API_ROUTES.PERMISSIONS,
    });
  } catch (err) {
    console.warn("[permissions-api] getAllPermissions failed:", err);
    return null;
  }
}

/**
 * GET /profiles/permissions — permissions grouped by profile (GetProfilePermissions).
 * @returns API envelope or null if base URL missing or request fails
 */
export async function getProfilePermissions(): Promise<GetProfilePermissionsResponse | null> {
  try {
    return await request<GetProfilePermissionsResponse>({
      method: "GET",
      path: API_ROUTES.PROFILES_PERMISSIONS,
    });
  } catch (err) {
    console.warn("[permissions-api] getProfilePermissions failed:", err);
    return null;
  }
}

/**
 * GET /users/permissions — user-specific permissions filtered by email/accountId.
 * @returns API envelope or null if URL missing, invalid input, or request fails
 */
export async function getUserSpecificPermissions(
  email: string,
  accountId: string | number
): Promise<GetUserSpecificPermissionsResponse | null> {
  if (!email || !String(accountId)) {
    console.warn("[permissions-api] getUserSpecificPermissions: email and accountId are required");
    return null;
  }
  try {
    return await request<GetUserSpecificPermissionsResponse>({
      method: "GET",
      path: API_ROUTES.USER_PERMISSIONS,
      params: {
        email,
        accountId: String(accountId),
      },
      options: {
        headers: {
          requestId: "1",
        },
      },
    });
  } catch (err) {
    console.warn("[permissions-api] getUserSpecificPermissions failed:", err);
    return null;
  }
}

/**
 * GET /permission-logs — paged/sorted audit log for permission changes.
 * @returns API envelope or null if URL missing or request fails
 */
export async function getPermissionAuditLogs(
  params: GetPermissionAuditLogsParams = {}
): Promise<GetPermissionAuditLogsResponse | null> {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "updatedAt",
    sortDirection = "desc",
  } = params;

  try {
    return await request<GetPermissionAuditLogsResponse>({
      method: "GET",
      path: API_ROUTES.PERMISSION_LOGS,
      params: {
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortDirection,
      },
      options: {
        headers: {
          requestId: "1",
        },
      },
    });
  } catch (err) {
    console.warn("[permissions-api] getPermissionAuditLogs failed:", err);
    return null;
  }
}

/**
 * PATCH /profiles/permissions — update enabled flags for one or more profiles (UpdateProfilePermissions).
 * Sends an array payload: each item is `{ profileId, updatedPermissions }`.
 * String ids are normalized for the wire format.
 */
export async function updateProfilePermissions(
  payload: UpdateProfilePermissionsPayload
): Promise<UpdateProfilePermissionsResponse | null> {
  if (!Array.isArray(payload) || payload.length === 0) {
    console.warn("[permissions-api] updateProfilePermissions: payload must be a non-empty array");
    return null;
  }
  const body = payload.map((entry) => ({
    profileId: String(entry.profileId),
    updatedPermissions: entry.updatedPermissions.map((p) => ({
      permissionId: String(p.permissionId),
      enabled: p.enabled,
    })),
  }));
  try {
    return await request<UpdateProfilePermissionsResponse>({
      method: "PATCH",
      path: API_ROUTES.PROFILES_PERMISSIONS,
      body,
    });
  } catch (err) {
    console.warn("[permissions-api] updateProfilePermissions failed:", err);
    return null;
  }
}
