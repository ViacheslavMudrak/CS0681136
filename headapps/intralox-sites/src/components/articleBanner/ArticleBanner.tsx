import { JSX } from "react";
import { IArticleBannerFields, IArticlePageFields } from "./ArticleBanner.type";
import { ContainerWidth } from "components/shared/BaseContainer";
import { ArticleBannerClient } from "./partial/ArticleBannerClient";
import { Section } from "components/shared/section/Section";
import { Container } from "components/shared/BaseContainer";
import { AppPlaceholder, ComponentMap } from "@sitecore-content-sdk/nextjs";
import componentMap from ".sitecore/component-map";

const DefaultBase = ({ page, rendering }: IArticlePageFields): JSX.Element => {
  const { layout } = page;
  const { route } = layout.sitecore;
  const routeFields = route?.fields as IArticleBannerFields | undefined;
  const containerWidth =
    routeFields?.ContainerWidth?.fields?.Value?.value?.toLowerCase() as ContainerWidth;
  const postDateRaw = routeFields?.PostDate?.value;
  const hideDate = routeFields?.HideDate?.value;
  return (
    <Section
      removeBottomPadding={true}
      className="article-banner [&_section]:pt-8 [&_section]:pb-0
      [&_section_.container]:px-0 text-ink-primary [&_~section:not(:last-of-type)]:py-0
      [&_~section:not(:last-of-type,.divider,.rich-text)]:mt-8 [&_~section:not(:last-of-type)]:mb-0
      [&_.eUuRZt]:mt-8 [&_.prose>h2:first-of-type]:mt-8 [&_.prose>p:first-of-type]:mt-4
       [&_.eUuRZt_img]:w-full
     "
    >
      <Container width={containerWidth}>
        <AppPlaceholder
          name="breadbrumb-{*}"
          componentMap={componentMap as ComponentMap}
          rendering={rendering}
          page={page}
          disableSuspense
        />
        <ArticleBannerClient
          routeFields={routeFields}
          postDate={postDateRaw}
          hideDate={hideDate}
        />
      </Container>
    </Section>
  );
};

export const Default = DefaultBase;
