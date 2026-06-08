import { JSX } from "react";
import { cn } from "lib/utils";
import {
  Link,
  NextImage,
  RichText,
  Text,
  type TextField,
} from "@sitecore-content-sdk/nextjs";

import { getCheckboxValue } from "components/divider/dividerUtils";
import { UI_ICONS } from "../../navigation/partial/NavigationIcons";
import type {
  TestimonialFigureSurface,
  TestimonialNormalizedFields,
  TestimonialTextAlignment,
} from "../Testimonial.type";
import {
  getAriaLabel,
  getCompanyItemFallbackLabel,
  getCompanyMetadataValue,
  getCompanyTextFieldForSdk,
  getQuotePlainText,
  getTestimonialLinkAriaFallback,
  hasMeaningfulQuote,
  hasNonEmptyTextField,
  parseTestimonialImageDimension,
} from '../testimonialUtils';

const quoteMarkPathD =
  "M10.66 24.07H0V12.59C-.22 6 4.43.83 10.66 0v4.95c-3.82 1.27-4.95 3.9-4.95 7.57h4.95v11.55zm15.97 0H15.98V12.59C15.75 5.99 20.4.82 26.63-.01v4.95c-3.82 1.27-4.95 3.9-4.95 7.57h4.95v11.55z";

const quoteSvgViewBox = "0 0 27.99 25.3";
const quoteSvgRotateCenterY = 25.3 / 2;
const quoteSvgCenterX = 27.99 / 2;

const quoteCloseMaskUrl = ((): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27.99 25.3"><g transform="rotate(180 13.995 12.65)"><path fill="black" d="${quoteMarkPathD}"/></g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

const quoteOpenMaskUrl = ((): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27.99 25.3"><path fill="black" d="${quoteMarkPathD}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

const quoteCloseMaskVars: Record<string, string> = {
  "--testimonial-close-mask": quoteCloseMaskUrl,
  "--testimonial-open-mask": quoteOpenMaskUrl,
};

export interface TestimonialQuoteIconOpenProps {
  className?: string;
}

export const TestimonialQuoteIconOpen = ({
  className,
}: TestimonialQuoteIconOpenProps = {}): JSX.Element => (
  <span
    className={cn(
      'text-accent-cyan font-bold text-navigation-font-basic leading-[27px] shrink-0 inline-flex h-[25.3px] w-[27.99px] overflow-hidden align-middle',
      'items-start self-start -translate-y-2',
      className,
    )}
    aria-hidden="true"
  >
    <svg
      className="block h-full w-full shrink-0 overflow-hidden fill-accent-cyan"
      viewBox={quoteSvgViewBox}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
    >
      <path d={quoteMarkPathD} />
    </svg>
  </span>
);

/** Decorative closing quote mark (180° from {@link TestimonialQuoteIconOpen}). */
export const TestimonialQuoteIconClose = (): JSX.Element => (
  <span
    className="text-accent-cyan font-bold text-navigation-font-basic leading-[27px] shrink-0 inline-flex h-[25.3px] w-[27.99px] overflow-hidden align-middle items-end align-text-bottom translate-y-1 ltr:translate-x-2 rtl:-translate-x-2"
    aria-hidden="true"
  >
    <svg
      className="block h-full w-full shrink-0 overflow-hidden fill-accent-cyan"
      viewBox={quoteSvgViewBox}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
    >
      <g
        transform={`rotate(180 ${quoteSvgCenterX} ${quoteSvgRotateCenterY})`}
      >
        <path d={quoteMarkPathD} />
      </g>
    </svg>
  </span>
);

interface TestimonialAttributionProps {
  fields: TestimonialNormalizedFields;
  isEditing: boolean;
  alignment?: TestimonialTextAlignment;
}

/** Attribution block (cite, job title, headshot, company) under the quote. */
export const TestimonialAttribution = ({
  fields,
  isEditing,
  alignment = "left",
}: TestimonialAttributionProps): JSX.Element | null => {
  const { Attribution, JobTitle, Image, Company } = fields ?? {};
  const hasAttribution = hasNonEmptyTextField(Attribution);
  const hasJobTitle = hasNonEmptyTextField(JobTitle);
  const hasImage = !!Image?.value?.src;
  const companySdkField = getCompanyTextFieldForSdk(Company);
  const companyFallbackLabel = getCompanyItemFallbackLabel(Company);
  const showCompanyBlock =
    Company != null &&
    (isEditing ||
      getCompanyMetadataValue(Company).length > 0 ||
      (companySdkField != null &&
        hasNonEmptyTextField(companySdkField as TextField)));

  if (
    !hasAttribution &&
    !hasJobTitle &&
    !hasImage &&
    !showCompanyBlock &&
    !isEditing
  )
    return null;

  const showImage = (hasImage || isEditing) && Image;
  const isCenter = alignment === "center";

  const textBlock = (
    <div className={cn('mb-0 flex min-w-0 flex-col gap-0', isCenter ? 'text-center' : 'text-left')}>
      {(hasAttribution || isEditing) && (
        <Text
          field={Attribution}
          tag="cite"
          className="mb-0 inline m-0 p-0 text-ink-muted font-media-tile font-bold not-italic text-navigation-font-basic-submenu leading-[19.25px]"
        />
      )}
      {(hasJobTitle || isEditing) && (
        <Text
          field={JobTitle}
          tag="div"
          className="m-0 min-w-0 p-0 text-ink-muted font-media-tile font-normal not-italic text-navigation-font-basic-submenu leading-[19.25px] [unicode-bidi:isolate]"
        />
      )}
      {showCompanyBlock &&
        companySdkField != null &&
        (hasNonEmptyTextField(companySdkField as TextField) || isEditing) && (
          <Text
            field={companySdkField}
            tag="div"
            className="m-0 min-w-0 p-0 text-ink-muted font-media-tile font-normal not-italic text-navigation-font-basic-submenu leading-[19.25px] [unicode-bidi:isolate]"
          />
        )}
      {showCompanyBlock &&
        companySdkField != null &&
        !isEditing &&
        !hasNonEmptyTextField(companySdkField as TextField) &&
        companyFallbackLabel && (
          /* Item displayName/name only — no Sitecore field to bind for inline edit in Pages */
          <div className="m-0 min-w-0 p-0 text-ink-muted font-media-tile font-normal not-italic text-navigation-font-basic-submenu leading-[19.25px] [unicode-bidi:isolate]">
            {companyFallbackLabel}
          </div>
        )}
      {showCompanyBlock && companySdkField == null && companyFallbackLabel && (
        <div className="m-0 min-w-0 p-0 text-ink-muted font-media-tile font-normal not-italic text-navigation-font-basic-submenu leading-[19.25px] [unicode-bidi:isolate]">
          {companyFallbackLabel}
        </div>
      )}
    </div>
  );

  if (showImage) {
    return (
      <figcaption
        className={cn(
          'flex w-full m-0 pt-2',
          isCenter ? 'justify-center' : 'justify-start',
        )}
      >
        <div className="inline-flex w-fit max-w-full flex-row items-center gap-2 min-[768px]:gap-2.5">
          <div className="shrink-0">
            <NextImage
              field={Image}
              width={parseTestimonialImageDimension(Image?.value?.width, 64)}
              height={parseTestimonialImageDimension(Image?.value?.height, 64)}
              sizes="(max-width: 767px) 48px, 64px"
              className="h-12 w-12 min-[768px]:h-16 min-[768px]:w-16 rounded-full object-cover"
            />
          </div>
          {textBlock}
        </div>
      </figcaption>
    );
  }

  return (
    <figcaption
      className={cn(
        'flex w-full m-0 pt-2 flex-col gap-0',
        isCenter ? 'items-center' : 'items-start',
      )}
    >
      {textBlock}
    </figcaption>
  );
};

interface TestimonialCardProps {
  fields: TestimonialNormalizedFields;
  isEditing: boolean;
  displayName?: string;
  alignment?: TestimonialTextAlignment;
  /** Carousel override: white card, Media Tile gray (`transparent`), or `inherit` on gray chrome. */
  figureSurface?: TestimonialFigureSurface;
  /** Sitecore rendering params; `HasBackgroundColor` drives figure background when `figureSurface` is omitted. */
  params?: Record<string, unknown>;
}

/** Testimonial figure: quote, attribution, and optional link. */
export const TestimonialCard = ({
  fields,
  isEditing,
  displayName,
  alignment = "left",
  figureSurface: figureSurfaceProp,
  params,
}: TestimonialCardProps): JSX.Element | null => {
  const { Quote, Attribution, JobTitle, Image, Link: linkField } = fields ?? {};
  const linkTarget = linkField?.value?.target;
  const linkHref = linkField?.value?.href;
  const hasQuote = hasMeaningfulQuote(Quote);
  const hasAttribution = hasNonEmptyTextField(Attribution);
  const hasJobTitle = hasNonEmptyTextField(JobTitle);
  const hasImage = !!Image?.value?.src;
  const hasLink =
    linkHref != null &&
    typeof linkHref === "string" &&
    linkHref.trim().length > 0;
  const hasCompanyContent = getCompanyMetadataValue(fields.Company).length > 0;
  const hasContent =
    hasQuote ||
    hasAttribution ||
    hasJobTitle ||
    hasImage ||
    hasLink ||
    hasCompanyContent;

  if (!hasContent && !isEditing) return null;

  const linkTextRaw = linkField?.value?.text;
  const hasLinkLabel =
    linkTextRaw != null && String(linkTextRaw).trim().length > 0;
  const linkAriaFallback = getTestimonialLinkAriaFallback(
    displayName,
    linkField,
  );

  const ariaLabel = getAriaLabel(
    getQuotePlainText(Quote),
    Attribution?.value ? String(Attribution.value).trim() : undefined,
    displayName,
  );

  const isCenter = alignment === "center";

  let figureSurface: TestimonialFigureSurface = figureSurfaceProp ?? "white";
  if (figureSurfaceProp == null && params) {
    for (const key of Object.keys(params)) {
      if (key.toLowerCase() !== "hasbackgroundcolor") continue;
      const backgroundColorValue = params[key];
      figureSurface =
        backgroundColorValue == null || backgroundColorValue === "" ? "white"
        : getCheckboxValue(backgroundColorValue) ? "transparent"
        : "white";
      break;
    }
  }

  return (
    <figure
      className={cn(
        (figureSurface === 'tint' || figureSurface === 'transparent') &&
          'bg-surface-subtle',
        figureSurface === "inherit" && "bg-transparent",
        figureSurface === "white" && "bg-surface",
        "box-border m-0 border-0 p-0 text-ink-primary font-media-tile",
        isCenter ? "text-center lg:w-fit lg:max-w-full lg:mx-auto" : "text-left",
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-full min-[992px]:max-w-4xl min-[1920px]:max-w-5xl flex-col gap-0",
          isCenter && "lg:w-fit lg:max-w-full lg:min-w-0 items-center",
          !isCenter && "items-start",
        )}
      >
        {(hasQuote || isEditing) && (
          <blockquote
            className="mb-0 w-full border-none py-0 text-ink-primary flow-root [&_small:before]:hidden"
          >
            {isCenter ? (
              <div
                className={cn(
                  isCenter &&
                    "flex w-full max-w-full flex-row justify-center items-start",
                )}
              >
                {isEditing ? (
                  <div
                    className={cn(
                      isCenter &&
                        "flex w-full max-w-full flex-nowrap gap-x-0 text-[0] max-sm:flex-col max-sm:items-center max-sm:gap-y-0 sm:flex-row sm:items-start sm:gap-x-0 max-lg:w-full max-lg:max-w-full lg:w-fit lg:max-w-full lg:mx-auto",
                    )}
                  >
                    <TestimonialQuoteIconOpen
                      className="ltr:translate-x-2.5 rtl:-translate-x-2.5 sm:ltr:translate-x-6 sm:rtl:-translate-x-6 sm:-me-3 max-sm:!translate-x-0"
                    />
                    <div
                      className={cn(
                        'inline-flex max-w-full flex-col gap-0 text-lg',
                        isCenter &&
                          'max-sm:ms-0 max-sm:w-full max-sm:max-w-full sm:ms-1.5 sm:flex-none max-lg:w-full max-lg:max-w-full max-lg:min-w-0 lg:shrink-0 items-center lg:min-w-[600px] lg:w-[600px] lg:max-w-[600px]',
                        !isCenter && 'items-stretch',
                      )}
                    >
                      <RichText
                        field={Quote}
                        className={cn(
                          'mb-0 relative font-media-tile font-bold text-ink-primary text-lg leading-[27px]',
                          alignment === "center" ? "text-center" : "text-left",
                        )}
                      />
                      <div className="mt-1 flex justify-end">
                        <TestimonialQuoteIconClose />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      alignment === "center" &&
                        "max-sm:ms-0 max-sm:w-full max-sm:max-w-full sm:ms-1.5 sm:flex-none relative max-lg:w-full max-lg:max-w-full max-lg:min-w-0 lg:shrink-0 lg:min-w-[600px] lg:w-[600px] lg:max-w-[600px]",
                      alignment !== "center" && "min-w-0",
                      alignment === "center"
                        ? "text-center [&_p]:text-center text-pretty"
                        : "text-left text-pretty",
                      "font-media-tile font-bold text-ink-primary text-lg leading-[27px]",
                      "[&>div]:contents [&>div>div]:contents [&_p]:inline [&_p]:m-0 [&_p:not(:last-child)]:after:block [&_p:not(:last-child)]:after:h-0 [&_p:not(:last-child)]:after:w-full [&_p:not(:last-child)]:after:content-[''] [&_ul]:my-1 [&_ol]:my-1 [&_ul]:block [&_ol]:block",
                      "[&_p:first-of-type]:before:content-[''] [&_p:first-of-type]:before:inline-block [&_p:first-of-type]:before:h-[25.3px] [&_p:first-of-type]:before:w-[27.99px] [&_p:first-of-type]:before:shrink-0 [&_p:first-of-type]:before:align-middle [&_p:first-of-type]:before:-translate-y-1 [&_p:first-of-type]:before:me-[2px] [&_p:first-of-type]:before:bg-accent-cyan [&_p:first-of-type]:before:[mask-image:var(--testimonial-open-mask)] [&_p:first-of-type]:before:[-webkit-mask-image:var(--testimonial-open-mask)] [&_p:first-of-type]:before:[mask-size:100%_100%] [&_p:first-of-type]:before:[-webkit-mask-size:100%_100%] [&_p:first-of-type]:before:[mask-repeat:no-repeat] [&_p:first-of-type]:before:[mask-position:center] [&_p:first-of-type]:before:[-webkit-mask-position:center]",
                      "[&_p:last-of-type]:after:content-[''] [&_p:last-of-type]:after:inline-block [&_p:last-of-type]:after:h-[25.3px] [&_p:last-of-type]:after:w-[27.99px] [&_p:last-of-type]:after:shrink-0 [&_p:last-of-type]:after:align-middle [&_p:last-of-type]:after:translate-y-0 [&_p:last-of-type]:after:ltr:translate-x-0.5 [&_p:last-of-type]:after:rtl:-translate-x-0.5 [&_p:last-of-type]:after:bg-accent-cyan [&_p:last-of-type]:after:[mask-image:var(--testimonial-close-mask)] [&_p:last-of-type]:after:[-webkit-mask-image:var(--testimonial-close-mask)] [&_p:last-of-type]:after:[mask-size:100%_100%] [&_p:last-of-type]:after:[-webkit-mask-size:100%_100%] [&_p:last-of-type]:after:[mask-repeat:no-repeat] [&_p:last-of-type]:after:[mask-position:center] [&_p:last-of-type]:after:[-webkit-mask-position:center]",
                      "[&:has(p)]:[&_.testimonial-quote-open-icon]:hidden [&:has(p)]:[&_.testimonial-quote-close-icon]:hidden",
                    )}
                    style={quoteCloseMaskVars}
                  >
                    <span className="testimonial-quote-open-icon me-[2px] inline-flex align-middle">
                      <TestimonialQuoteIconOpen />
                    </span>
                    <RichText
                      field={Quote}
                      className="contents mb-0 relative text-ink-primary [&_p]:leading-[27px]"
                    />
                    <span className="testimonial-quote-close-icon inline-flex align-middle">
                      <TestimonialQuoteIconClose />
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {isEditing && (
                  <span className="float-left mr-0">
                    <TestimonialQuoteIconOpen />
                  </span>
                )}
                {isEditing ? (
                  <div className="flex min-h-0 min-w-0 flex-col gap-0">
                    <RichText
                      field={Quote}
                      className={cn(
                        'mb-0 relative font-media-tile font-bold text-ink-primary text-lg leading-[27px]',
                        'text-left',
                      )}
                    />
                    <div className="mt-1 text-end">
                      <TestimonialQuoteIconClose />
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'relative min-w-0 text-left text-pretty',
                      'font-media-tile font-bold text-ink-primary text-lg leading-[27px]',
                      "[&>div]:contents [&>div>div]:contents [&_p]:inline [&_p]:m-0 [&_p:not(:last-child)]:after:block [&_p:not(:last-child)]:after:h-0 [&_p:not(:last-child)]:after:w-full [&_p:not(:last-child)]:after:content-[''] [&_ul]:my-1 [&_ol]:my-1 [&_ul]:block [&_ol]:block",
                      "[&_p:first-of-type]:before:content-[''] [&_p:first-of-type]:before:inline-block [&_p:first-of-type]:before:h-[25.3px] [&_p:first-of-type]:before:w-[27.99px] [&_p:first-of-type]:before:shrink-0 [&_p:first-of-type]:before:align-middle [&_p:first-of-type]:before:-translate-y-1 [&_p:first-of-type]:before:me-[2px] [&_p:first-of-type]:before:bg-accent-cyan [&_p:first-of-type]:before:[mask-image:var(--testimonial-open-mask)] [&_p:first-of-type]:before:[-webkit-mask-image:var(--testimonial-open-mask)] [&_p:first-of-type]:before:[mask-size:100%_100%] [&_p:first-of-type]:before:[-webkit-mask-size:100%_100%] [&_p:first-of-type]:before:[mask-repeat:no-repeat] [&_p:first-of-type]:before:[mask-position:center] [&_p:first-of-type]:before:[-webkit-mask-position:center]",
                      "[&_p:last-of-type]:after:content-[''] [&_p:last-of-type]:after:inline-block [&_p:last-of-type]:after:h-[25.3px] [&_p:last-of-type]:after:w-[27.99px] [&_p:last-of-type]:after:shrink-0 [&_p:last-of-type]:after:align-middle [&_p:last-of-type]:after:translate-y-0 [&_p:last-of-type]:after:ltr:translate-x-0.5 [&_p:last-of-type]:after:rtl:-translate-x-0.5 [&_p:last-of-type]:after:bg-accent-cyan [&_p:last-of-type]:after:[mask-image:var(--testimonial-close-mask)] [&_p:last-of-type]:after:[-webkit-mask-image:var(--testimonial-close-mask)] [&_p:last-of-type]:after:[mask-size:100%_100%] [&_p:last-of-type]:after:[-webkit-mask-size:100%_100%] [&_p:last-of-type]:after:[mask-repeat:no-repeat] [&_p:last-of-type]:after:[mask-position:center] [&_p:last-of-type]:after:[-webkit-mask-position:center]",
                      '[&:has(p)]:[&_.testimonial-quote-open-icon]:hidden [&:has(p)]:[&_.testimonial-quote-close-icon]:hidden',
                    )}
                    style={quoteCloseMaskVars}
                  >
                    <span className="testimonial-quote-open-icon me-[2px] inline-flex align-middle">
                      <TestimonialQuoteIconOpen />
                    </span>
                    <RichText
                      field={Quote}
                      className="contents mb-0 relative text-ink-primary [&_p]:leading-[27px]"
                    />
                    <span className="testimonial-quote-close-icon inline-flex align-middle">
                      <TestimonialQuoteIconClose />
                    </span>
                  </div>
                )}
              </>
            )}
          </blockquote>
        )}

        <TestimonialAttribution
          fields={fields}
          isEditing={isEditing}
          alignment={alignment}
        />

        {linkField && (hasLink || isEditing) && (
          <div
            className={cn(
              'group m-0 mt-1 inline-flex w-full min-[768px]:w-auto items-center flex-nowrap gap-0 [&>*]:m-0',
              isCenter ? 'justify-center' : 'justify-start',
            )}
          >
            <Link
              field={linkField}
              target={linkTarget || undefined}
              rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}
              className="inline m-0 p-0 text-action-link hover:text-action text-navigation-font-basic-submenu font-normal leading-[19.25px] transition-colors duration-150 motion-reduce:transition-none no-underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal"
              {...(!hasLinkLabel && linkAriaFallback
                ? { "aria-label": linkAriaFallback }
                : {})}
            />
            <span
              className="inline-flex h-[14px] w-[14px] shrink-0 self-center items-center justify-center leading-none text-action-link transition-colors duration-150 motion-reduce:transition-none group-hover:text-action [&_i]:block [&_i]:origin-center [&_i]:scale-[1] [&_i]:leading-none"
              aria-hidden="true"
            >
              {UI_ICONS.chevronRight}
            </span>
          </div>
        )}
      </div>
    </figure>
  );
};
