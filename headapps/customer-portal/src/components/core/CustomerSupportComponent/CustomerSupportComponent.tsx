import React from "react";
import type { JSX } from "react";

import type { CustomerSupportComponentProps } from "./CustomerSupportComponent.type";
import { CustomerSupportComponentClient } from "./partial/CustomerSupportComponentClient";
import {
  CUSTOMER_SUPPORT_COMPONENT_NAME,
  CUSTOMER_SUPPORT_EMPTY_HINT,
} from "./customerSupportComponentUtils";

/**
 * Renders the CMS-driven blocked contact support page.
 *
 * @param props - Sitecore rendering props and flat CustomerSupportComponent fields.
 * @returns The standalone blocked access support page rendering.
 */
const DefaultBase = ({ fields, params, page }: CustomerSupportComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier: id } = params;
  const isEditing = Boolean(page?.mode?.isEditing || page?.mode?.isPreview);

  if (!fields) {
    return (
      <div
        className={`component customer-support-component ${styles ?? ""} !m-0 !p-0`.trim()}
        id={id}
      >
        <div className="component-content">
          <span className="is-empty-hint">{CUSTOMER_SUPPORT_EMPTY_HINT}</span>
        </div>
      </div>
    );
  }

  return (
    <CustomerSupportComponentClient fields={fields} isEditing={isEditing} />
  );
};

export const Default = React.memo(DefaultBase);
export default Default;
