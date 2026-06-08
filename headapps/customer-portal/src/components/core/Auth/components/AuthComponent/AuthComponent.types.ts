import type { LinkField } from "@sitecore-content-sdk/nextjs";
import { AuthTypeValue } from "@/helpers/enums";

export interface RenderAuthComponentProps extends IRenderAuthComponentProps {
  onResetPasswordSuccess?: () => void;
  onRegisterSuccess?: () => void;
  contactSupportLink?: LinkField;
}

export interface IRenderAuthComponentProps {
  authType: AuthTypeValue;
}
