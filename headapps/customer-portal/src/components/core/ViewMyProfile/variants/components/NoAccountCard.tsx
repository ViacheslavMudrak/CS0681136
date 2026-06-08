"use client";

import React from "react";

import type { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";
import { NextImage as ContentSdkImage, RichText } from "@sitecore-content-sdk/nextjs";

import { LinkRender } from "@/components/shared/link-render/LinkRender";

interface NoAccountCardProps {
  noAccountIcon?: ImageField;
  noAccountText?: Field<string>;
  noAccountCTA?: LinkField;
  hideCTA?: boolean;
}

export function NoAccountCard({
  noAccountIcon,
  noAccountText,
  noAccountCTA,
  hideCTA,
}: NoAccountCardProps): React.ReactElement {
  const cta = noAccountCTA?.value;
  const hasCta = Boolean(cta?.href && cta?.text) && !hideCTA;

  return (
    <div
      className="box-border flex h-[193px] w-full shrink-0 flex-col items-center justify-center border border-dashed border-[#C4D0E1] bg-white px-5 py-6"
      data-testid="view-my-profile-no-account"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {noAccountIcon?.value?.src && (
          <div className="flex items-center justify-center">
            <ContentSdkImage
              field={noAccountIcon}
              width={36}
              height={32}
              alt={(noAccountIcon.value.alt ?? "No account icon") as string}
              loading="lazy"
              className="h-8 w-9 object-contain text-[var(--color-icon-cyan)]"
            />
          </div>
        )}
        {noAccountText && <RichText field={noAccountText} />}
        {hasCta && noAccountCTA && cta && (
          <LinkRender
            field={noAccountCTA}
            className="min-w-[112px] rounded-full border border-[var(--color-action-primary)] bg-[var(--color-bg-basic-color)] px-3 py-3 text-center text-xs font-normal leading-normal text-[var(--color-action-primary)] no-underline focus:outline-none focus:ring-2 focus-visible:ring-[var(--color-action-primary)] hover:bg-[var(--color-action-primary-hover)]"
          >
            {cta?.text}
          </LinkRender>
        )}
      </div>
    </div>
  );
}
