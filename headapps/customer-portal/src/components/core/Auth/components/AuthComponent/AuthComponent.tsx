import { AUTH_TYPES } from "@/helpers/enums";
import AuthRegister from "../AuthRegister";
import AuthResetPassword from "../AuthResetPassword";
import AuthLogin from "../AuthLogin";
import { RenderAuthComponentProps } from "./AuthComponent.types";

export const RenderAuthComponent = (props: RenderAuthComponentProps): React.ReactNode => {
  const { authType, onResetPasswordSuccess, onRegisterSuccess, contactSupportLink } = props;
  if (authType === AUTH_TYPES.REGISTER) {
    return <AuthRegister onSuccess={onRegisterSuccess} />;
  }

  if (authType === AUTH_TYPES.RESET) {
    return (
      <AuthResetPassword onSuccess={onResetPasswordSuccess} contactSupportLink={contactSupportLink} />
    );
  }

  return <AuthLogin />;
};
