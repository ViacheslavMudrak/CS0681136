import type { JSX } from 'react';
import type { ComponentMap, ComponentRendering, ImageField, Page } from '@sitecore-content-sdk/nextjs';
import { AppPlaceholder, NextImage, RichText, Text } from '@sitecore-content-sdk/nextjs';
import componentMap from '.sitecore/component-map';
import { cn } from 'lib/utils';
import { patchComponentMapForTextAsideAsideCallouts } from '../../callout/calloutUtils';
import type { IVideoFields } from '../../../utils/interface';
import type { TextAndAsideLayoutFields } from '../TextAndAside.type';
import type { TextAsideMediaChoice } from '../textAsideUtils';
import {
  hasVisibleImageField,
  hasVisibleRichText,
  hasVisibleTextField,
  hasVisibleVideoReference,
  normalizeTextAsideVideoField,
  shouldTextAsidePreferAsidePlaceholderOverFields,
  shouldTextAsidePreferTextPlaceholderOverFields,
} from '../textAsideUtils';
import { TextAsideVideoBlock } from './TextAsideVideoBlock';

const EMPTY_RICH: { value: string } = { value: '' };
const EMPTY_TEXT = { value: '' };
const EMPTY_CAPTION = { value: '' };
const EMPTY_IMAGE: ImageField = { value: {} };

export interface TextAndAsideMainProps {
  fields: TextAndAsideLayoutFields;
  isEditing: boolean;
  rendering: ComponentRendering;
  page: Page;
  showTextPlaceholder: boolean;
  mainPlaceholderName: string;
}

export const TextAndAsideMain = ({
  fields,
  isEditing,
  rendering,
  page,
  showTextPlaceholder,
  mainPlaceholderName,
}: TextAndAsideMainProps): JSX.Element | null => {
  const { Title, Description } = fields;
  const titleField = Title ?? EMPTY_TEXT;
  const descriptionField = Description ?? EMPTY_RICH;

  const hasTitle = hasVisibleTextField(Title);
  const hasDescription = hasVisibleRichText(Description);
  const preferPlaceholderOverMainFields = shouldTextAsidePreferTextPlaceholderOverFields(
    showTextPlaceholder,
    isEditing
  );

  if (!hasTitle && !hasDescription && !showTextPlaceholder && !isEditing) {
    return null;
  }

  const showTitleField =
    !preferPlaceholderOverMainFields && (hasTitle || isEditing);
  const showDescriptionField =
    !preferPlaceholderOverMainFields && (hasDescription || isEditing);

  return (
    <div className="flex w-full min-w-0 flex-col items-stretch gap-6 font-media-tile md:gap-8">
      {showTitleField && (
        <Text
          field={titleField}
          tag="h2"
          className="m-0 text-left font-media-tile text-font-media-tile-eyebrow font-bold leading-font-media-tile-eyebrow text-ink-muted"
        />
      )}
      {showDescriptionField && (
        <div className="min-w-0 w-full">
          <RichText
            field={descriptionField}
            className="prose font-divider text-font-normal leading-relaxed text-ink-primary text-aside-description max-w-none text-left font-media-tile [&>*:first-child]:!m-0 [&>*+*]:!mt-[16px] [&>*+*]:!mb-0 [&>*+*]:!mx-0 [&_li>p]:!block [&_li>p]:!m-0 [&_li>p:not(:last-child)]:!mb-1 [&_ul]:!m-0 [&_ul]:!list-none [&_ul]:!pl-0 [&_ul]:!space-y-2 [&_ul]:!text-ink-primary [&_ul>li]:!relative [&_ul>li]:!m-0 [&_ul>li]:!list-none [&_ul>li]:!pl-5 md:[&_ul>li]:!pl-6 [&_ul>li]:!leading-6 md:[&_ul>li]:!leading-8 [&_ul>li]:before:!absolute [&_ul>li]:before:!left-[0.15rem] [&_ul>li]:before:!top-[calc((1lh-6px)/2)] [&_ul>li]:before:!h-[6px] [&_ul>li]:before:!w-[6px] [&_ul>li]:before:!shrink-0 [&_ul>li]:before:!rounded-full [&_ul>li]:before:!content-[''] [&_ul>li]:before:!bg-[var(--color-nav-link-hover)] [&_ol]:!m-0 [&_ol]:!pl-6 md:[&_ol]:!pl-7 [&_ol]:!space-y-2 [&_ol]:!text-ink-primary [&_ol>li]:!list-decimal [&_ol>li]:!list-outside [&_ol>li]:!m-0 [&_ol>li]:!pl-2 [&_ol>li]:!leading-6 md:[&_ol>li]:!leading-8 [&_ol>li::marker]:!text-nav-link-hover [&_a]:!text-nav-link-hover [&_a]:!underline [&_a:hover]:!text-[rgb(0,40,123)] [&_a:hover]:!no-underline [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-nav-link-hover [&_a]:focus-visible:ring-offset-2 [&_strong]:!font-bold [&_em]:!italic [&_p]:!text-left [&_div]:!text-left [&_p]:!mb-4 [&_p:last-child]:!mb-0 [&_h2]:font-media-tile [&_h2]:text-font-extrabig [&_h2]:font-bold [&_h3]:font-media-tile [&_h3]:text-font-extrabig [&_h3]:font-bold [&_h3]:leading-font-media-tile-headline [&_h3]:!mb-4 [&_h3]:!mt-8 [&_h3:first-child]:!mt-0 [&_h4]:font-media-tile [&_h4]:text-font-medium [&_h4]:font-bold"
          />
        </div>
      )}
      {showTextPlaceholder && (
        <AppPlaceholder
          name={mainPlaceholderName}
          rendering={rendering}
          page={page}
          componentMap={componentMap}
          disableSuspense
        />
      )}
    </div>
  );
};

export interface TextAndAsideAsideProps {
  fields: TextAndAsideLayoutFields;
  isEditing: boolean;
  rendering: ComponentRendering;
  page: Page;
  media: TextAsideMediaChoice;
  showAsidePlaceholder: boolean;
  asidePlaceholderName: string;
  dividerClass: string;
}

/**
 * @param props - Media visibility, normalized fields, and placeholder configuration
 * @returns Aside markup or null when nothing to show
 */
export const TextAndAsideAside = ({
  fields,
  isEditing,
  rendering,
  page,
  media,
  showAsidePlaceholder,
  asidePlaceholderName,
  dividerClass,
}: TextAndAsideAsideProps): JSX.Element | null => {
  const { Image, Video, MediaCaption } = fields;
  const captionField = MediaCaption ?? EMPTY_CAPTION;
  const captionPlain =
    typeof MediaCaption?.value === 'string'
      ? MediaCaption.value.replace(/<[^>]+>/g, '').trim()
      : '';
  const hasCaption = captionPlain.length > 0 || hasVisibleRichText(MediaCaption);
  const preferPlaceholderOverAsideFields = shouldTextAsidePreferAsidePlaceholderOverFields(
    showAsidePlaceholder,
    isEditing
  );

  const showImageBlock =
    !preferPlaceholderOverAsideFields &&
    media.showImage &&
    (hasVisibleImageField(Image) || isEditing);
  const showVideoBlock =
    !preferPlaceholderOverAsideFields &&
    media.showVideo &&
    (hasVisibleVideoReference(Video) || isEditing);

  if (!showImageBlock && !showVideoBlock && !showAsidePlaceholder && !isEditing) {
    return null;
  }

  const showCaption =
    !preferPlaceholderOverAsideFields &&
    (hasCaption || isEditing) &&
    (showImageBlock || showVideoBlock || isEditing);

  return (
    <aside
      className={cn('flex min-w-0 flex-col items-stretch text-left font-media-tile', dividerClass)}
      {...(captionPlain.length > 0 && !preferPlaceholderOverAsideFields ?
        { 'aria-label': captionPlain }
      : {})}
    >
      <div className="flex w-full flex-col items-stretch gap-5 md:gap-6">
        {showImageBlock && (
          <div className="relative box-border aspect-[480/398] w-full max-w-full overflow-x-clip overflow-y-clip rounded-sm border border-stroke-default bg-surface-muted font-media-tile">
            <NextImage
              field={Image ?? EMPTY_IMAGE}
              width={480}
              height={398}
              sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 480px"
              className="absolute inset-0 box-border block h-full w-full max-w-full object-cover align-middle text-left"
            />
          </div>
        )}
        {showVideoBlock && Video != null && hasVisibleVideoReference(Video) && (
          <div className="relative box-border min-h-0 w-full min-w-0 max-w-full shrink-0 overflow-x-clip overflow-y-clip rounded-sm border border-stroke-default font-media-tile md:max-h-none">
            <TextAsideVideoBlock video={(normalizeTextAsideVideoField(Video) ?? Video) as IVideoFields} />
          </div>
        )}
        {showVideoBlock &&
          isEditing &&
          (Video == null || !hasVisibleVideoReference(Video)) && (
            <span className="is-empty-hint font-media-tile">
              Video
            </span>
          )}
        {(showCaption || showAsidePlaceholder) && (
          <div className="flex min-w-0 w-full flex-col gap-3">
            {showCaption && (
              <Text
                field={captionField}
                tag="p"
                className="m-0 text-left font-media-tile text-font-normal text-ink-secondary"
              />
            )}
            {showAsidePlaceholder && (
              <AppPlaceholder
                name={asidePlaceholderName}
                rendering={rendering}
                page={page}
                componentMap={
                  patchComponentMapForTextAsideAsideCallouts(componentMap) as ComponentMap
                }
                disableSuspense
              />
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
