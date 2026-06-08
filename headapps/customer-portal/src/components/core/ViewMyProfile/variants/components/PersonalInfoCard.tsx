"use client";

import Heading from "@/components/ui/Heading";
import type { Field } from "@sitecore-content-sdk/nextjs";
import { Text as ContentSdkText } from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import React from "react";
import { I18N } from "src/lib/dictionary-keys";

interface PersonalInfoCardProps {
  profileSectionTitle?: Field<string>;
  fullName?: string;
  email?: string;
  isVerified?: boolean;
}

export function PersonalInfoCard({
  profileSectionTitle,
  fullName = "",
  email = "",
  isVerified = true,
}: PersonalInfoCardProps): React.ReactElement {
  const t = useTranslations();
  const sectionTitle = profileSectionTitle?.value ?? "Personal Information";
  const titleClassName =
    "m-0 shrink-0 text-[16px] lg:text-[18px] font-[500] leading-[1.25] text-[var(--color-text-black)]   lg:text-lg";

  return (
    <div className="box-border flex h-[258px] w-full shrink-0 flex-col items-start gap-6 border border-[#D7D9DA] bg-white p-[22px] md:w-[210px] lg:w-[398px]">
      <div className="flex min-h-6 w-full flex-row flex-nowrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {profileSectionTitle ? (
            <>
              <ContentSdkText
                field={profileSectionTitle}
                tag="h2"
                className={`${titleClassName} hidden md:block`}
              />
            <ContentSdkText
              field={profileSectionTitle}
              tag="h2"
              className={`${titleClassName} md:hidden`}
            />
            </>
          ) : (
            <Heading level={2} className={titleClassName}>
              {sectionTitle}
            </Heading>
          )}
        </div>
        {isVerified && (
          <div className="inline-flex shrink-0 items-end gap-[3px] rounded bg-[var(--color-bg-green-light)] px-1.5 py-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 3L4.5 8.5L2 6"
                stroke="#25803F"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="shrink-0 text-[10.5px] font-bold leading-[14px] text-[var(--color-text-verified)]">
              {t(I18N.ProfileVerification)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 lg:gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-[700] leading-[1.25] md:text-[14px] md:font-[500] md:leading-[1.38] text-[var(--color-gray-700)]">
            {t(I18N.ProfileName)}
          </span>
          <div className="break-all py-2 text-[14px] font-[400] leading-[1.5] text-wrap text-[var(--color-bg-black)] lg:text-[16px] lg:font-[400] lg:leading-[1.25] md:text-[14px] md:font-[400] md:leading-[1.25]">
            {fullName || "—"}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-[700] leading-[1.25] md:text-[14px] md:font-[500] md:leading-[1.38] text-[var(--color-gray-700)]">
            {t(I18N.ProfileEmail)}
          </span>
          <div className="break-all py-2 text-[14px] font-[400] leading-[1.5] text-wrap text-[var(--color-bg-black)] lg:text-[16px] lg:font-[400] lg:leading-[1.25] md:text-[14px] md:font-[400] md:leading-[1.25]">
            {email || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
