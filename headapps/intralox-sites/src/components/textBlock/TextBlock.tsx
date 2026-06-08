import { JSX } from "react";

import { ITextBlockFields } from "./TextBlock.type";
import { IParams } from "src/utils/interface";
import { TextBlockClient } from "./partial/TextBlockClient";
import { Section } from "components/shared/section/Section";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import { Container } from "components/shared/BaseContainer";
import {
  AppPlaceholder,
  ComponentMap,
  ComponentRendering,
  Page,
} from "@sitecore-content-sdk/nextjs";
import { ICaseStudyBannerFields } from "components/caseStudyBanner/CaseStudyBanner.type";

interface ITextBlockProps extends IParams {
  fields: ITextBlockFields;
  componentMap: ComponentMap;
  rendering: ComponentRendering;
  page: Page;
}

const DefaultBase = ({
  fields,
  params,
  componentMap,
  rendering,
  page,
}: ITextBlockProps): JSX.Element => {
  const { layout } = page;
  const { route } = layout.sitecore;
  const routeFields = route?.fields as ICaseStudyBannerFields | undefined;
  const containerWidth =
    params?.ContainerWidth?.Value?.value?.toLowerCase() ??
    routeFields?.ContainerWidth?.fields.Value.value.toLowerCase();
  return (
    <Section
      className="w-full mb-4 [&_.container_.container]:px-0 [&_.container_.container]:mb-2"
      removeBottomPadding
      {...renderingAnchorIdProps(params?.RenderingIdentifier)}
    >
      <Container width={containerWidth}>
        <AppPlaceholder
          name="breadbrumb-{*}"
          componentMap={componentMap as ComponentMap}
          rendering={rendering}
          page={page}
          disableSuspense
        />
        <TextBlockClient fields={fields} params={params} />
      </Container>
    </Section>
  );
};

export const Default = DefaultBase;
