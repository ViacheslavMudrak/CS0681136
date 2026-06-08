"use client";

import {
  RichText as ContentSdkRichText,
  LinkField,
  Link as ContentSdkLink,
} from "@sitecore-content-sdk/nextjs";
import { useMemo } from "react";

import type { Field } from "@sitecore-content-sdk/nextjs";
import ChevronRightIcon from "@/components/shared/icons/ChevronRightIcon";
import { getCopyrightWithYear } from "@/lib/copyright-utils";
import { cn } from "@/lib/utils";

interface IBackToLoginProps {
  WebsiteURL: LinkField;
  CopyRightText: Field<string>;
}

export const AuthFooterInfo = (props: IBackToLoginProps) => {
  const { WebsiteURL, CopyRightText } = props;

  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const copyrightField = useMemo(
    () =>
      CopyRightText
        ? { ...CopyRightText, value: getCopyrightWithYear(CopyRightText.value) }
        : CopyRightText,
    [CopyRightText]
  );

  if (!CopyRightText) {
    return <></>;
  }
  return (
    <div
      className="mb-[35px] flex w-full flex-row items-center justify-center gap-2 rounded-none p-0 text-center font-sans text-xs font-normal leading-[100%] tracking-normal !text-[#374151]"
      role="contentinfo"
      aria-label="Additional information"
    >
      <ContentSdkRichText
        className="text-[12px] font-[400] leading-[1.38] text-black"
        field={copyrightField}
      />
      <div>|</div>
      <div className="flex items-center gap-[5px]">
        <ContentSdkLink
          className="text-[12px] font-[400] leading-[1.38] !text-[var(--color-link-text)]"
          field={WebsiteURL as LinkField}
        />

        <div
          className="text-[var(--color-link-text)] [&_svg]:h-[9px] [&_svg]:w-[6px]"
          aria-hidden="true"
        >
          <ChevronRightIcon
            stroke="#0377BA"
            width={6}
            height={9}
            decorative={true}
            className={cn(isRtl && "rotate-180")}
          />
        </div>
      </div>
    </div>
  );
};
