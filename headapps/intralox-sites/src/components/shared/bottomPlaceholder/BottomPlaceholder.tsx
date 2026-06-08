"use client";
import type { JSX } from "react";
import { Field, RichText } from "@sitecore-content-sdk/nextjs";
import LinkView from "components/callToAction/partial/LinkVIew";
import { cmsIconToFontAwesome } from "lib/cms-icon-to-fontawesome";
import type { IAuthorFields } from "src/components/articleBanner/ArticleBanner.type";
import type { IFields } from "src/utils/interface";
import { cn } from "lib/utils";
import { Container, type ContainerWidth } from "../BaseContainer";
import { ImageView } from "../ImageView/ImageView";

/** Static back chevron for parent-page link — computed once at module load. */
const PARENT_PAGE_BACK_ICON = cmsIconToFontAwesome("chevron-left", "solid");

export interface IBottomPlaceholderProps {
  ShowParentPage?: Field<boolean>;
  HasDarkTheme?: Field<boolean>;
  author?: IAuthorFields;
  title?: string;
  url?: string;
  containerWidth?: IFields;
  ShowTopBorder?: Field<boolean>;
}

const BottomPlaceholder = ({
  ShowParentPage,
  HasDarkTheme,
  title,
  url,
  author,
  containerWidth,
  ShowTopBorder,
}: IBottomPlaceholderProps): JSX.Element | null => {
  const authorFields = author?.fields;
  const showAuthorBio = Boolean(authorFields?.Bio?.value);
  const showParentPageLink = ShowParentPage?.value;
  const showTopBorder = ShowTopBorder?.value;
  const resolvedWidth = containerWidth?.fields?.Value?.value as
    | ContainerWidth
    | undefined;

  if (!showAuthorBio && !showParentPageLink) {
    return null;
  }

  const prefersDarkTheme = HasDarkTheme?.value;

  return (
    <>
      {showAuthorBio && authorFields && (
        <Container width={resolvedWidth}>
          <div className="mt-12 mb-12 border-b border-l-0 border-r-0 border-t border-solid border-stroke-default py-6">
            <div className="flex items-center gap-6">
              {authorFields?.Image?.value?.src && (
                <div className="rounded-full overflow-hidden w-[100px] shrink-0">
                  <ImageView image={authorFields.Image} />
                </div>
              )}
              <div className="text-sm text-ink-primary leading-snug pr-6">
                {authorFields?.Bio?.value && (
                  <RichText field={authorFields.Bio} />
                )}
              </div>
            </div>
          </div>
        </Container>
      )}
      {showParentPageLink && (
        <section
          className={cn(
            "w-full [&_i]:relative [&_i]:top-[3px] [&_i]:h-2.5 [&_i]:w-2.5 [&_i]:text-xs [&_svg]:relative [&_svg]:top-[3px] [&_svg]:size-2.5",
            showTopBorder ? "pb-12 md:pb-20" : "pb-8",
          )}
        >
          <Container width={resolvedWidth}>
            {!showAuthorBio && showTopBorder ? (
              <hr className="border-stroke-default border-t my-12" />
            ) : (
              <></>
            )}
            <LinkView
              link={{ value: { href: url } }}
              buttonType="pill"
              buttonTheme={prefersDarkTheme ? "default" : "muted"}
              icon={PARENT_PAGE_BACK_ICON}
              iconPosition="Before label"
              className={cn(showTopBorder ? "" : "mt-12")}
            >
              {title}
            </LinkView>
          </Container>
        </section>
      )}
    </>
  );
};

export default BottomPlaceholder;
