import type { Field, LinkField, TextField } from '@sitecore-content-sdk/nextjs';

export interface AlertInfoBoxItemFields {
  Text?: TextField;
  Link?: LinkField;
}

export interface AlertInfoBoxReference {
  id: string;
  displayName?: string;
  name?: string;
  fields?: AlertInfoBoxItemFields;
}

export type EnableAlertField = Field | { value?: boolean };

export interface AlertBoxPresentationProps {
  enableAlert: boolean;
  alertInfoBox: AlertInfoBoxReference | null | undefined;
  isEditing: boolean;
}

export interface AlertBoxStripProps {
  textField?: TextField;
  linkField?: LinkField;
  showText: boolean;
  showLink: boolean;
  hasClickableLink: boolean;
  isEditing: boolean;
  ariaLabel: string;
}