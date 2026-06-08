"use client";

import type { JSX } from "react";
import { useTranslations } from "next-intl";

import { I18N } from "lib/dictionary-keys";

export interface RelatedCaseStudyBaseCardKindLabelProps {
  /** When true and `companyName` is non-empty, shows the company name; otherwise the dictionary “case study” label. */
  showCompany: boolean;
  companyName: string;
}

/**
 * Base card footer line: company name when datasource **Show Company** is enabled, else localized “case study” (Sitecore dictionary).
 */
export function RelatedCaseStudyBaseCardKindLabel({
  showCompany,
  companyName,
}: RelatedCaseStudyBaseCardKindLabelProps): JSX.Element {
  const t = useTranslations();
  const trimmed = companyName.trim();
  const text = showCompany && trimmed.length > 0 ? trimmed : t(I18N.CASESTUDY);

  return (
    <p className="mb-0 ml-0 mr-0 mt-auto shrink-0 box-border block w-full max-w-full cursor-default border-0 px-0 pb-0 pt-[16px] text-left font-media-tile text-[length:12px] font-bold uppercase leading-[15px] text-ink-muted [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]">
      {text}
    </p>
  );
}
