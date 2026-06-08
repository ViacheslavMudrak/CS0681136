import { JSX } from "react";

import {
  ICaseStudyBannerFields,
  ICaseStudyPageFields,
} from "./CaseStudyBanner.type";
import { Container, ContainerWidth } from "components/shared/BaseContainer";
import { Section } from "components/shared/section/Section";
import { AppPlaceholder, ComponentMap } from "@sitecore-content-sdk/nextjs";
import { componentMap } from ".sitecore/component-map";
import { CaseStudyBannerClient } from "./partial/CaseStudyBannerClient";

const DefaultBase = ({
  page,
  rendering,
}: ICaseStudyPageFields): JSX.Element => {
  const { layout } = page;
  const { route } = layout.sitecore;
  const routeFields = route?.fields as ICaseStudyBannerFields | undefined;
  const containerWidth =
    routeFields?.ContainerWidth?.fields.Value.value.toLowerCase() as ContainerWidth;

  return (
    <Section
      removeBottomPadding
      className="case-study-banner [&_section]:pt-8 [&_section]:pb-0 [&_section_.container]:px-0 text-ink-primary [&_:is(.component.testimonial)]:!pt-8 [&_:is(.component.testimonial)_.component-content>div]:!px-0 [&_:is(.component.testimonial)_.component-content>div]:md:!px-0 [&_:is(.component.testimonial)_.component-content>div]:lg:!px-0 [&_:is(.component.testimonial)_blockquote_path]:!fill-[var(--color-accent-cyan)] [&_:is(.component.testimonial)_blockquote_svg]:!text-accent-cyan [&_:is(.component.testimonial)_blockquote_.testimonial-quote-open-icon]:!text-accent-cyan [&_:is(.component.testimonial)_blockquote_.testimonial-quote-close-icon]:!text-accent-cyan"
    >
      <Container width={containerWidth}>
        <AppPlaceholder
          name="breadbrumb-{*}"
          componentMap={componentMap as ComponentMap}
          rendering={rendering}
          page={page}
          disableSuspense
        />
        <CaseStudyBannerClient
          routeFields={routeFields}
          rendering={rendering}
          page={page}
          componentMap={componentMap as ComponentMap}
        />
      </Container>
    </Section>
  );
};

export const Default = DefaultBase;
