import {
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text as ContentSdkText,
  SitecoreProviderReactContext,
} from "@sitecore-content-sdk/nextjs";
import React from "react";
import { IParams } from "src/helpers/interface";
import { IFeaturedContentFields } from "../FeaturedContent.type";
import FeaturedContentCardSection from "./components/FeaturedContentCardSection";
import FullHeightBackground from "./components/FullHeightBackground";

interface IFeaturedContentVariantProps {
  testId: string;
  fields: IFeaturedContentFields;
  params: IParams;
}

const FeaturedContentDefaultVariantBase = ({ testId, fields }: IFeaturedContentVariantProps) => {
  if (!fields) {
    return (
      <div
        data-testid={testId}
        className="z-[9] flex h-full w-full flex-col items-center justify-center gap-[30px] bg-[var(--color-portal-bg)]"
      />
    );
  }

  const contentCards = fields.ContentCards || [];
  const hasBackground = Boolean(fields.BackgroundImage?.value?.src);
  const imageUrl = fields.BackgroundImage?.value?.src || "";

  return (
    <section
      data-testid={testId}
      className="z-[9] flex h-full w-full flex-col items-center justify-center gap-[30px] bg-[var(--color-portal-bg)]"
      aria-labelledby="featured-content-heading"
      aria-describedby="featured-content-description"
    >
      {hasBackground && (
        <FullHeightBackground imageUrl={imageUrl}>
          <div className="flex h-full w-full flex-col">
            <div
              className="absolute start-0 top-0 z-10 h-[73px] w-[120px] overflow-hidden lg:max-h-[108px] lg:max-w-[180px]"
              role="img"
              aria-label={String(fields.Logo?.value?.alt || "Logo")}
            >
              {fields.Logo?.value?.src ? (
                <ContentSdkImage
                  field={fields.Logo}
                  className="h-full w-full object-contain"
                  loading="lazy"
                  alt={String(fields.Logo?.value?.alt || "")}
                />
              ) : null}
            </div>

            <div className="inset-0 z-10 flex w-full items-start justify-start md:items-center md:justify-center md:px-[100px] md:pb-8 lg:px-[100px] lg:py-0 lg:pb-[75px]">
              <div className="flex flex-col gap-[40px]">
                <div className="mb-[50px] flex w-full flex-col items-start gap-4 lg:mb-0 lg:items-center lg:gap-6">
                  <div className="flex w-full items-start justify-center lg:items-center lg:justify-start">
                    <div className="whitespace-pre-wrap text-[32px] leading-[40px] tracking-[-0.5px] text-white md:text-[38px] md:leading-[40px] lg:text-start lg:text-[52px] lg:leading-[68px] lg:tracking-[-1px]">
                      <ContentSdkText
                        field={fields.PrimaryTitle}
                        tag="div"
                        className="block px-4 text-center text-[30px] leading-[40px] md:text-[36px] lg:px-0 lg:text-start lg:text-[48px] lg:font-normal lg:leading-[1.1]"
                        id="featured-content-heading"
                      />

                      <ContentSdkText
                        field={fields.SecondaryTitle}
                        tag="div"
                        className="block px-4 text-center text-[30px] leading-[40px] md:text-[36px] lg:px-0 lg:text-start lg:text-[48px] lg:font-normal lg:leading-[1.1]"
                        id="featured-content-heading-secondary"
                      />
                    </div>
                  </div>

                  <div className="flex w-full items-start justify-start px-6 text-center text-white md:items-start lg:items-start lg:justify-start lg:px-0 lg:text-start md:text-[20px] md:font-[400] md:leading-[1.5]">
                    <ContentSdkRichText
                      field={fields.Description}
                      className="w-full"
                      id="featured-content-description"
                    />
                  </div>
                </div>

                <FeaturedContentCardSection contentCards={contentCards} fields={fields} />
              </div>
            </div>
          </div>
        </FullHeightBackground>
      )}
    </section>
  );
};

export const FeaturedContentDefaultVariant = React.memo(FeaturedContentDefaultVariantBase);
