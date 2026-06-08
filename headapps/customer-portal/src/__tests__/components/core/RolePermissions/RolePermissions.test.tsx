import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import RolePermissions from "components/core/RolePermissions/RolePermissions";
import type { IRolePermissionsFields } from "components/core/RolePermissions/RolePermissions.type";
import { TEST_CASE_DATA_IDS } from "src/helpers/enums";
import type { ComponentRendering, Page } from "@sitecore-content-sdk/nextjs";

vi.mock("next/dynamic", () => ({
  default: () => {
    const React = require("react");
    return function DynamicRolePermissionsStub(props: { testId?: string; fields?: { Title?: { value?: string } } }) {
      return React.createElement("div", {
        "data-testid": props.testId,
        "data-has-title": props.fields?.Title?.value ?? "",
      });
    };
  },
}));

vi.mock("components/core/RolePermissions/variants/RolePermissionsDefault.variant", () => ({
  RolePermissionsDefaultVariant: ({
    testId,
    fields,
  }: {
    testId: string;
    fields: IRolePermissionsFields | null;
  }) => (
    <div data-testid={testId} data-has-title={fields?.Title?.value ?? ""} />
  ),
}));

const minimalRendering = {} as ComponentRendering;

const minimalPage = { mode: { isEditing: false } } as Page;

const minimalParams = {
  styles: "",
  RenderingIdentifier: "rp-render",
} as const;

const minimalFields: IRolePermissionsFields = {
  Title: { value: "Roles" },
};

describe("RolePermissions", () => {
  it("renders default variant with ROLE_PERMISSIONS test id and passes fields", () => {
    render(
      <RolePermissions
        rendering={minimalRendering}
        params={minimalParams}
        page={minimalPage}
        fields={minimalFields}
      />
    );

    const root = screen.getByTestId(TEST_CASE_DATA_IDS.ROLE_PERMISSIONS);
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("data-has-title", "Roles");
  });
});
