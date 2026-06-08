"use client";
import {
  RichText as ContentSdkRichText,
  Text as ContentSdkText,
  LayoutServicePageState,
  SitecoreProviderReactContext,
} from "@sitecore-content-sdk/nextjs";
import React from "react";

import { IFeaturedContentCard, IFeaturedContentFields } from "../../FeaturedContent.type";
import FeaturedContentCard from "./FeaturedContentCard";

interface IFeaturedContentCardSection {
  fields: IFeaturedContentFields;
  contentCards: IFeaturedContentCard[];
}

const FeaturedContentCardSection: React.FC<IFeaturedContentCardSection> = ({
  fields,
  contentCards,
}) => {
  const { page } = React.useContext(SitecoreProviderReactContext);
  const { pageState } = page.layout.sitecore.context;

  return (
    <>
      <div
        id="featuredContentCards"
        className="hidden w-full flex-col items-start gap-4 lg:flex lg:w-full lg:gap-[30px] xl:flex [&>*]:w-full"
        role="list"
        aria-label="Featured content cards"
      >
        {contentCards.map((card) => {
          const iconField = card.fields.Icon;
          const iconValue = iconField?.value;
          return (
            <FeaturedContentCard
              key={card.id}
              icon={iconField}
              iconAlt={String(iconValue?.alt ?? card.displayName ?? "")}
              title={<ContentSdkText field={card.fields.Title} tag="p" />}
              description={<ContentSdkRichText field={card.fields.Description} />}
              link={card.fields.Link}
              isSitecoreEditMode={pageState === LayoutServicePageState.Edit}
            />
          );
        })}
      </div>

      {fields.Content?.value ? (
        <div role="region" aria-label="Additional content">
          <ContentSdkRichText field={fields.Content} />
        </div>
      ) : null}
    </>
  );
};

export default FeaturedContentCardSection;
