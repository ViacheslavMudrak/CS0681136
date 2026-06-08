import { JSX, type ReactNode } from "react";

import { Container, type ContainerWidth } from "components/shared/BaseContainer";
import { cn } from "lib/utils";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import { getRouteContainerWidth } from "src/utils/routeContainerWidth";

import { TestimonialCard } from "./partial/TestimonialPartials";
import type { TestimonialProps } from "./Testimonial.type";
import {
  getCompanyMetadataValue,
  getMergedTestimonialParams,
  getNormalizedTestimonialFields,
  getTestimonialAlignmentRawFromParams,
  hasNonEmptyTextField,
  hasVisibleTestimonialContent,
  parseTestimonialAlignment,
  TESTIMONIAL_ARIA_FALLBACK,
  TESTIMONIAL_COMPANY_DATA_ATTR,
  TESTIMONIAL_SECTION_ARIA_FALLBACK,
} from "./testimonialUtils";

function getRenderingDisplayName(
  rendering: TestimonialProps["rendering"],
): string | undefined {
  const record = rendering as unknown as Record<string, unknown>;
  const name = record.displayName;
  return typeof name === "string" ? name : undefined;
}

function testimonialContentWrap(
  children: ReactNode,
  innerWrapClass: string,
  routeContainerWidth?: ContainerWidth,
): JSX.Element {
  return (
    <div className="component-content">
      {routeContainerWidth ? (
        <Container width={routeContainerWidth} className={innerWrapClass}>
          {children}
        </Container>
      ) : (
        <div className={innerWrapClass}>{children}</div>
      )}
    </div>
  );
}

/** Testimonial quote, attribution, optional image/link; supports flat and GraphQL fields and `Alignment` / `HasBackgroundColor` params. */
export const Default = ({
  fields,
  params,
  page,
  rendering,
}: TestimonialProps): JSX.Element => {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);
  const routeContainerWidth = getRouteContainerWidth(page);
  const displayName = getRenderingDisplayName(rendering);
  const paramsRecord = getMergedTestimonialParams(
    rendering,
    params as Record<string, unknown>,
  );
  const textAlignment = parseTestimonialAlignment(
    getTestimonialAlignmentRawFromParams(paramsRecord),
  );

  if (!fields) {
    return (
      <div
        className={cn(
          'component',
          'testimonial',
          'relative box-border block mx-auto w-full min-w-0 max-w-[80rem] shrink-0 !p-0',
          styles,
        )}
        {...anchorId}
      >
        {testimonialContentWrap(
          <span className="is-empty-hint">{TESTIMONIAL_ARIA_FALLBACK}</span>,
          "relative box-border w-full [unicode-bidi:isolate] md:mx-auto md:max-w-[var(--width-media-tile-split-max)] md:max-[768px]:mx-0 md:max-[768px]:w-full md:max-[768px]:max-w-full md:min-[769px]:tablet-only:mx-[72px] md:min-[769px]:tablet-only:w-[calc(100%-144px)] md:min-[769px]:tablet-only:max-w-[768px] md:tablet-only:px-4 lg:mx-auto lg:max-w-[var(--width-media-tile-split-max)] lg:px-4",
          routeContainerWidth,
        )}
      </div>
    );
  }

  const normalized = getNormalizedTestimonialFields(fields);
  const hasDatasource = !!normalized;
  const isGraphQL = "data" in fields && fields?.data != null;
  if (isGraphQL && !hasDatasource) {
    return (
      <div
        className={cn(
          'component',
          'testimonial',
          'relative box-border block mx-auto w-full min-w-0 max-w-[80rem] shrink-0 !p-0',
          styles,
        )}
        {...anchorId}
      >
        {testimonialContentWrap(
          <span className="is-empty-hint">{TESTIMONIAL_ARIA_FALLBACK}</span>,
          "relative box-border w-full [unicode-bidi:isolate] md:mx-auto md:max-w-[var(--width-media-tile-split-max)] md:max-[768px]:mx-0 md:max-[768px]:w-full md:max-[768px]:max-w-full md:min-[769px]:tablet-only:mx-[72px] md:min-[769px]:tablet-only:w-[calc(100%-144px)] md:min-[769px]:tablet-only:max-w-[768px] md:tablet-only:px-4 lg:mx-auto lg:max-w-[var(--width-media-tile-split-max)] lg:px-4",
          routeContainerWidth,
        )}
      </div>
    );
  }

  if (!normalized) {
    return (
      <div
        className={cn(
          'component',
          'testimonial',
          'relative box-border block mx-auto w-full min-w-0 max-w-[80rem] shrink-0 !p-0',
          styles,
        )}
        {...anchorId}
      >
        {testimonialContentWrap(
          <span className="is-empty-hint">{TESTIMONIAL_ARIA_FALLBACK}</span>,
          "relative box-border w-full [unicode-bidi:isolate] md:mx-auto md:max-w-[var(--width-media-tile-split-max)] md:max-[768px]:mx-0 md:max-[768px]:w-full md:max-[768px]:max-w-full md:min-[769px]:tablet-only:mx-[72px] md:min-[769px]:tablet-only:w-[calc(100%-144px)] md:min-[769px]:tablet-only:max-w-[768px] md:tablet-only:px-4 lg:mx-auto lg:max-w-[var(--width-media-tile-split-max)] lg:px-4",
          routeContainerWidth,
        )}
      </div>
    );
  }

  if (!hasVisibleTestimonialContent(normalized, isEditing)) {
    return (
      <div
        className={cn(
          'component',
          'testimonial',
          'relative box-border block mx-auto w-full min-w-0 max-w-[80rem] shrink-0 !p-0',
          styles,
        )}
        {...anchorId}
      >
        {testimonialContentWrap(
          <span className="is-empty-hint">{TESTIMONIAL_ARIA_FALLBACK}</span>,
          "relative box-border w-full [unicode-bidi:isolate] md:mx-auto md:max-w-[var(--width-media-tile-split-max)] md:max-[768px]:mx-0 md:max-[768px]:w-full md:max-[768px]:max-w-full md:min-[769px]:tablet-only:mx-[72px] md:min-[769px]:tablet-only:w-[calc(100%-144px)] md:min-[769px]:tablet-only:max-w-[768px] md:tablet-only:px-4 lg:mx-auto lg:max-w-[var(--width-media-tile-split-max)] lg:px-4",
          routeContainerWidth,
        )}
      </div>
    );
  }

  const companyMeta = getCompanyMetadataValue(normalized.Company);
  const isCenterAlignment = textAlignment === "center";

  return (
    <section
      className={cn(
        'component',
        'testimonial',
        'relative box-border block mx-auto w-full min-w-0 max-w-[80rem] shrink-0 !p-0',
        'lg:box-border lg:block lg:font-media-tile lg:leading-6 lg:text-ink-primary lg:border-0 lg:border-solid lg:border-stroke-default lg:[-webkit-tap-highlight-color:transparent]',
        styles,
      )}
      {...anchorId}
      aria-label={
        hasNonEmptyTextField(normalized.Attribution)
          ? String(normalized.Attribution?.value).trim()
          : (displayName ?? TESTIMONIAL_SECTION_ARIA_FALLBACK)
      }
      {...(companyMeta ? { [TESTIMONIAL_COMPANY_DATA_ATTR]: companyMeta } : {})}
    >
      {testimonialContentWrap(
        <TestimonialCard
          fields={normalized}
          isEditing={isEditing}
          displayName={displayName}
          alignment={textAlignment}
          params={paramsRecord}
        />,
        cn(
          "relative box-border w-full [unicode-bidi:isolate] md:mx-auto md:max-w-[var(--width-media-tile-split-max)] md:max-[768px]:mx-0 md:max-[768px]:w-full md:max-[768px]:max-w-full md:min-[769px]:tablet-only:mx-[72px] md:min-[769px]:tablet-only:w-[calc(100%-144px)] md:min-[769px]:tablet-only:max-w-[768px] md:tablet-only:px-4 lg:mx-auto lg:max-w-[var(--width-media-tile-split-max)] lg:px-4",
          "md:tablet-only:!mx-0 md:tablet-only:!w-full md:tablet-only:!max-w-full md:min-[769px]:tablet-only:!mx-0 md:min-[769px]:tablet-only:!w-full md:min-[769px]:tablet-only:!max-w-full",
          'lg:py-1',
          isCenterAlignment && 'lg:!px-0 lg:flex lg:w-full lg:justify-center',
        ),
        routeContainerWidth,
      )}
    </section>
  );
};
