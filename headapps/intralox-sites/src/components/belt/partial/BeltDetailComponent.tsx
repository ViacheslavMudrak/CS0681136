"use client";

import { IBeltCommonFields } from "../Belt.type";
import { BeltComponentType } from "src/utils/enum";
import BeltCardAccordion from "./BeltCardAccordion";
import { ImageField } from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import { I18N } from "lib/dictionary-keys";

interface IBeltComponentProps {
  beltComponent: IBeltCommonFields[];
  sprocketsViewAllLink: string;
  otherComponentsViewAllLink: string;
  pageTitle?: string;
  defaultImage?: ImageField;
}

const BeltDetailComponent = ({
  beltComponent,
  sprocketsViewAllLink,
  otherComponentsViewAllLink,
  pageTitle,
  defaultImage,
}: IBeltComponentProps) => {
  const t = useTranslations();
  const sprockets = beltComponent?.filter((component: IBeltCommonFields) =>
    component.Component?.includes(BeltComponentType.SPROCKETS),
  );
  const otherComponents = beltComponent?.filter(
    (component: IBeltCommonFields) =>
      !component.Component?.includes(BeltComponentType.SPROCKETS),
  );
  return (
    <>
      {sprockets?.length > 0 && (
        <BeltCardAccordion
          id="sprockets"
          title={t(I18N.SPROCKETS)}
          items={sprockets}
          viewAllLink={sprocketsViewAllLink}
          viewAllText={`View All ${pageTitle} ${t(I18N.SPROCKETS)}`}
          pageTitle={pageTitle}
          defaultImage={defaultImage}
        />
      )}
      {otherComponents?.length > 0 && (
        <BeltCardAccordion
          id="accessories"
          title={t(I18N.ACCESSORIES)}
          items={otherComponents}
          viewAllLink={otherComponentsViewAllLink}
          viewAllText={`View All ${pageTitle} ${t(I18N.ACCESSORIES)}`}
          pageTitle={pageTitle}
          defaultImage={defaultImage}
        />
      )}
    </>
  );
};

export default BeltDetailComponent;
