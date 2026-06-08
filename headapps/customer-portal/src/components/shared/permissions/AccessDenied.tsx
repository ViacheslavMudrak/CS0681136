"use client";
import Button from "@/components/ui/Button";
import { I18N } from "@/lib/dictionary-keys";
import { redirectToLogin } from "@/lib/okta-auth-client";
import { useOktaAuth } from "@okta/okta-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { JSX } from "react";

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

export default function AccessDenied({
  title = "Access denied",
  description = "You do not have permission to view this page.",
}: AccessDeniedProps): JSX.Element {
  const t = useTranslations();
  const router = useRouter();
  const oktaAuth = useOktaAuth();

  const handleBackToLogin = () => {
    redirectToLogin(router, oktaAuth?.oktaAuth);
  };

  return (
    <section className="mx-auto w-full max-w-[960px] px-6 py-12" role="alert" aria-live="polite">
      <div className="flex flex-col items-center gap-[12px] rounded-md border border-border-gray bg-bg-basic-color p-8">
        <h1 className="text-2xl font-bold text-heading-color !my-[0px]">{title}</h1>
        <p className="text-text-basic my-[0px]">{description}</p>

        <Button
          variant="primary"
          className="!px-[20px] !py-[12px] mt-[12px]"
          onClick={handleBackToLogin}
        >
          {t(I18N.ResetBackToLoginText)}
        </Button>
      </div>
    </section>
  );
}
