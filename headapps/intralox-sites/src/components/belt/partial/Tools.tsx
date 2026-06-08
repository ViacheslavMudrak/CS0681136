"use client";

import { I18N } from "lib/dictionary-keys";
import { IBeltCommonFields } from "../Belt.type";
import BeltCardAccordion from "./BeltCardAccordion";
import { useTranslations } from "next-intl";

interface IToolsProps {
  tools: IBeltCommonFields[];
  ViewAllToolsLink: string;
  pageTitle?: string;
}

const Tools = ({ tools, ViewAllToolsLink, pageTitle }: IToolsProps) => {
  const t = useTranslations();
  return (
    <BeltCardAccordion
      id="tools"
      title={t(I18N.TOOLS)}
      items={tools}
      viewAllLink={ViewAllToolsLink}
      viewAllText={`View All ${pageTitle} ${t(I18N.TOOLS)}`}
      pageTitle={pageTitle}
    />
  );
};

export default Tools;
