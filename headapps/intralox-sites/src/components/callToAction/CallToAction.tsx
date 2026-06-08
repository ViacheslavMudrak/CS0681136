import { ICallToActionFields } from "./CallToAction.type";
import { JSX } from "react";
import { IParams } from "src/utils/interface";
import { CallToActionClient } from "./partial/CallToActionClient";
import { Container } from "components/shared/BaseContainer";
import { Section } from "components/shared/section/Section";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import { Page } from "@sitecore-content-sdk/nextjs";
import { ICaseStudyBannerFields } from "components/caseStudyBanner/CaseStudyBanner.type";

interface ICallToActionProps extends IParams {
  fields: ICallToActionFields;
  page: Page;
}

const DefaultBase = ({
  fields,
  params,
  page,
}: ICallToActionProps): JSX.Element => {
  const { layout } = page;
  const { route } = layout.sitecore;
  const routeFields = route?.fields as ICaseStudyBannerFields | undefined;
  const containerWidth =
    params?.ContainerWidth?.Value?.value?.toLowerCase() ??
    routeFields?.ContainerWidth?.fields.Value.value.toLowerCase();
  return (
    <Section
      className="w-full"
      {...renderingAnchorIdProps(params?.RenderingIdentifier)}
    >
      <Container width={containerWidth ?? "lg"}>
        <CallToActionClient fields={fields} params={params} />
      </Container>
    </Section>
  );
};

export const Default = DefaultBase;
