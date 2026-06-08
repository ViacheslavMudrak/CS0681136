import { JSX } from 'react';

import { RichText as ContentSdkRichText } from '@sitecore-content-sdk/nextjs';

import { cn } from 'lib/utils';

import type { RichTextProps } from 'components/rich-text/RichText.type';
import {
  getRichTextField,
  getRichTextRegionAriaLabel,
  isRichTextEffectivelyEmpty,
} from 'components/rich-text/richTextUtils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import { storyRichTextLabels } from '../storyLabels';

export type RichTextStoryPreviewLabels = typeof storyRichTextLabels;

export type RichTextStoryPreviewProps = RichTextProps & {
  labels?: RichTextStoryPreviewLabels;
};

export function RichTextStoryPreview({
  fields,
  page,
  params,
  rendering,
  labels = storyRichTextLabels,
}: RichTextStoryPreviewProps): JSX.Element {
  const regionAriaLabel = getRichTextRegionAriaLabel(rendering, labels.emptyHint);

  const { RenderingIdentifier, styles } = params;
  const { isEditing } = page.mode;
  const anchorId = renderingAnchorIdProps(RenderingIdentifier);

  if (!fields && isEditing) {
    return (
      <section
        aria-label={regionAriaLabel}
        className={cn('component rich-text w-full p-0! px-0!', styles)}
        {...anchorId}
      >
        <div className="component-content">
          <span className="is-empty-hint">{labels.emptyHint}</span>
        </div>
      </section>
    );
  }

  if (!fields && !isEditing) {
    return <></>;
  }

  const textField = getRichTextField(fields);
  const hasTextValue = !isRichTextEffectivelyEmpty(textField?.value?.toString());

  if (!hasTextValue && !isEditing) {
    return <></>;
  }

  return (
    <section
      aria-label={regionAriaLabel}
      className={cn('component rich-text w-full p-0! px-0!', styles)}
      {...anchorId}
    >
      <div className="component-content">
        {hasTextValue || textField ?
          <ContentSdkRichText
            className={"prose font-divider text-font-normal leading-relaxed text-ink-primary [&>*:first-child]:!m-0 [&>*+*]:!mt-[16px] [&>*+*]:!mb-0 [&>*+*]:!mx-0 [&_li>p]:!block [&_li>p]:!m-0 [&_li>p:not(:last-child)]:!mb-1 [&_ul]:!m-0 [&_ul]:!list-none [&_ul]:!pl-0 [&_ul]:!space-y-2 [&_ul]:!text-ink-primary [&_ul>li]:!relative [&_ul>li]:!m-0 [&_ul>li]:!list-none [&_ul>li]:!pl-5 md:[&_ul>li]:!pl-6 [&_ul>li]:!leading-6 md:[&_ul>li]:!leading-8 [&_ul>li]:before:!absolute [&_ul>li]:before:!left-[0.15rem] [&_ul>li]:before:!top-[calc((1lh-6px)/2)] [&_ul>li]:before:!h-[6px] [&_ul>li]:before:!w-[6px] [&_ul>li]:before:!shrink-0 [&_ul>li]:before:!rounded-full [&_ul>li]:before:!content-[''] [&_ul>li]:before:!bg-[var(--color-nav-link-hover)] [&_ol]:!m-0 [&_ol]:!pl-6 md:[&_ol]:!pl-7 [&_ol]:!space-y-2 [&_ol]:!text-ink-primary [&_ol>li]:!list-decimal [&_ol>li]:!list-outside [&_ol>li]:!m-0 [&_ol>li]:!pl-2 [&_ol>li]:!leading-6 md:[&_ol>li]:!leading-8 [&_ol>li::marker]:!text-nav-link-hover [&_a]:!text-nav-link-hover [&_a]:!underline [&_a:hover]:!text-[rgb(0,40,123)] [&_a:hover]:!no-underline [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-nav-link-hover [&_a]:focus-visible:ring-offset-2 [&_strong]:!font-bold [&_em]:!italic"}
            field={textField}
          />
        : <span className="is-empty-hint">{labels.emptyHint}</span>}
      </div>
    </section>
  );
}
