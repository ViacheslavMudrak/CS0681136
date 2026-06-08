import type { Field, LinkField, TextField } from "@sitecore-content-sdk/nextjs";

/** CMS-driven icon resolved to a Font Awesome class string for {@link ChromeIconFromCms}. */
export type FloatingFabResolvedIcon = { kind: "fa-class"; className: string };

/**
 * Referenced icon item under Floating Button (e.g. Phone, Mail).
 */
export interface FloatingButtonIconReference {
  id?: string;
  displayName?: string;
  name?: string;
  /** Sitecore content path; used when droplink item fields are not expanded. */
  url?: string;
  fields?: {
    Value?: TextField;
    /** Font Awesome class list from CMS (header/footer parity), e.g. `fa-solid fa-phone`. */
    IconCssClass?: TextField;
    /** Alternate Sitecore field name for the same FA class string. */
    CssClass?: TextField;
  };
}

export interface FloatingButtonItemFields {
  Heading?: TextField;
  Text?: TextField;
  Icon?: FloatingButtonIconReference;
  Link?: LinkField;
}

/**
 * Item reference from route.fields.FloatingButton.
 */
export interface FloatingButtonReference {
  id: string;
  displayName?: string;
  name?: string;
  fields?: FloatingButtonItemFields;
}

export interface FloatingActionButtonPresentationProps {
  showFloatingButton: boolean;
  floatingButton: FloatingButtonReference | null | undefined;
  isEditing: boolean;
}

/**
 * Route-level flag for FAB visibility.
 */
export type ShowFloatingButtonField = Field | { value?: boolean };

export interface FloatingActionButtonPillProps {
  headingField?: TextField;
  textField?: TextField;
  iconResolved: FloatingFabResolvedIcon | null;
  showHeading: boolean;
  showText: boolean;
  showIcon: boolean;
}
