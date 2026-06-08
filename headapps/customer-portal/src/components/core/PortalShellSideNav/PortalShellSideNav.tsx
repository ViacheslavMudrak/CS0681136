import React from "react";
import { IParams } from "src/helpers/interface";
import type { PortalShellSideNavFields } from "./PortalShellSideNav.type";
import PortalShellSideNavDefault from "./variants/PortalShellSideNavDefault.variant";
import { TEST_CASE_DATA_IDS } from "@/helpers/enums";

interface PortalShellSideNavProps extends IParams {
  fields: PortalShellSideNavFields | null;
  params: IParams;
}

/**
 * Portal side navigation: account context, nav sections (with expandable sub-menus),
 * footer with logo, copyright, and website link. Renders inside PortalShell SideNav placeholder.
 */
const PortalShellSideNav = (props: PortalShellSideNavProps): React.ReactElement => {
  return (
    <PortalShellSideNavDefault
      fields={props.fields}
      testId={TEST_CASE_DATA_IDS.PORTAL_SHELL_SIDE_NAV}
    />
  );
};

export default PortalShellSideNav;
