import type { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";

/** Multilist item under ServicesSelection (maps ServiceKey to a profile API contact role). */
export interface ContactSupportServiceSelectionItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    ServiceKey?: Field<string>;
  };
}

/**
 * Sitecore fields for the Contact Support header link and contact panel.
 */
export interface IContactSupportFields {
  /** Title for the "Your Account Contacts" section in the popup */
  PopupTitle: Field<string>;
  /** Label for the Contact trigger button (e.g. "Contact") */
  Title: Field<string>;
  /** Icon shown next to the Contact trigger */
  Icon: ImageField;
  /** General support phone link (href, text) */
  SupportLink: LinkField;
  /** Icon for the "Call us for support" section */
  SupportIcon: ImageField;
  /** Label for the call support section (e.g. "Call us for general support") */
  SupportTitle: Field<string>;
  /** Label for the no contact panel title (e.g. "No account contacts found") */
  NoContactPanelTitle: Field<string>;
  /** Which account roles to show; each item's ServiceKey must match a profile API contact role. */
  ServicesSelection?: ContactSupportServiceSelectionItem[];
}
