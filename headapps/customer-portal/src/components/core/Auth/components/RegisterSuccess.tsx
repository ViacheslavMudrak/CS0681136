"use client";

import { RichText as ContentSdkRichText, RichTextField } from "@sitecore-content-sdk/nextjs";
import { AUTH_SUCCESS_MESSAGES } from "@/helpers/enums";
import SuccessMessage from "@/components/shared/success-message/SuccessMessage";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { I18N } from "@/lib/dictionary-keys";
import { useRouter } from "next/navigation";

interface IRegisterSuccessProps {
  successType?: string;
}
export const RegisterSuccess = (props: IRegisterSuccessProps) => {
  const { successType } = props;
  const t = useTranslations();
  const router = useRouter();

  const handleBackToLogin = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("okta_forgot_password_flow");
      localStorage.removeItem("okta_forgot_password_email_sent");
      localStorage.removeItem("okta_reset_password_success");
      localStorage.removeItem("okta_register_success");
      router.push("/login");
      return;
    }

    router.push("/login");
  };

  return (
    <div
      className="w-full [&_h2]:text-center [&_h2]:text-[24px] [&_h2]:font-[400] [&_h2]:leading-normal [&_h2]:tracking-[-0.5px] md:[&_h2]:text-[30px] [&_h2]:text-[#222] [&_p]:text-center [&_p]:text-[14px] [&_p]:font-normal [&_p]:leading-[125%] [&_p]:tracking-[-0.16px] [&_p]:text-[#4D4D4F] md:[&_p]:text-[16px]"
      role="region"
      aria-label="Authentication header"
    >
      <ContentSdkRichText
        field={
          {
            value: `<div class="ck-content"><h2>${
              successType === "register-activated"
                ? AUTH_SUCCESS_MESSAGES.REGISTER_ACTIVATED_TITLE
                : AUTH_SUCCESS_MESSAGES.REGISTER_TITLE
            }</h2></div>`,
          } as RichTextField
        }
      />

      <SuccessMessage
        message={
          successType === "register-activated"
            ? AUTH_SUCCESS_MESSAGES.REGISTER_ACTIVATED_MESSAGE
            : AUTH_SUCCESS_MESSAGES.REGISTER_MESSAGE
        }
        actionButton={
          <Button
            onPress={handleBackToLogin}
            variant="primary"
            aria-label="Go to login"
            className="w-full"
          >
            {t(I18N.ResetBackToLoginText)}
          </Button>
        }
      />
    </div>
  );
};
