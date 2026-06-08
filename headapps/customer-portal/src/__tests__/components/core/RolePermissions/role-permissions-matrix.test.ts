import { describe, it, expect } from "vitest";

import {
  buildRolePermissionsMatrix,
  buildUpdatePayloadFromMatrix,
  cloneRolePermissionsMatrix,
} from "@/lib/role-permissions-matrix";

describe("role-permissions-matrix", () => {
  const catalog = [
    { permissionId: 1, permissionName: "View Orders", permissionCode: "orders.view" },
    { permissionId: 2, permissionName: "Edit Profile", permissionCode: "profile.edit" },
  ];

  const profiles = [
    {
      profileId: 10,
      profileName: "Corporate",
      permissions: [
        {
          permissionId: 1,
          permissionName: "View Orders",
          permissionCode: "orders.view",
          isEnabled: true,
        },
        {
          permissionId: 2,
          permissionName: "Edit Profile",
          permissionCode: "profile.edit",
          isEnabled: false,
        },
      ],
    },
    {
      profileId: 20,
      profileName: "Engineering",
      permissions: [
        {
          permissionId: 1,
          permissionName: "View Orders",
          permissionCode: "orders.view",
          isEnabled: false,
        },
        {
          permissionId: 2,
          permissionName: "Edit Profile",
          permissionCode: "profile.edit",
          isEnabled: true,
        },
      ],
    },
  ];

  it("buildRolePermissionsMatrix maps roles, permissions, and enabled flags", () => {
    const result = buildRolePermissionsMatrix(catalog, profiles);

    expect(result.roles).toEqual([
      { id: "10", name: "CORPORATE" },
      { id: "20", name: "ENGINEERING" },
    ]);
    expect(result.permissions).toEqual([
      { id: "1", name: "View Orders" },
      { id: "2", name: "Edit Profile" },
    ]);
    expect(result.matrix["1"]["10"]).toBe(true);
    expect(result.matrix["1"]["20"]).toBe(false);
    expect(result.matrix["2"]["10"]).toBe(false);
    expect(result.matrix["2"]["20"]).toBe(true);
  });

  it("cloneRolePermissionsMatrix returns a deep copy of rows", () => {
    const built = buildRolePermissionsMatrix(catalog, profiles);
    const clone = cloneRolePermissionsMatrix(built.matrix);
    clone["1"]["10"] = false;
    expect(built.matrix["1"]["10"]).toBe(true);
  });

  it("buildUpdatePayloadFromMatrix builds one entry per profile with all permissions", () => {
    const data = buildRolePermissionsMatrix(catalog, profiles);
    const payload = buildUpdatePayloadFromMatrix(data);

    expect(payload).toHaveLength(2);
    expect(payload[0]).toEqual({
      profileId: "10",
      updatedPermissions: [
        { permissionId: "1", enabled: true },
        { permissionId: "2", enabled: false },
      ],
    });
    expect(payload[1].profileId).toBe("20");
    expect(payload[1].updatedPermissions).toHaveLength(2);
  });
});
