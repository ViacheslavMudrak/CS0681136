import type { JSX } from 'react';

import { RichText, Text } from '@sitecore-content-sdk/nextjs';
import type { Field, TextField } from '@sitecore-content-sdk/nextjs';

import { hasNonEmptyText } from 'components/media/mediaUtils';
import { isRichTextEffectivelyEmpty } from 'components/rich-text/richTextUtils';
import { cn } from 'lib/utils';

export interface IntroductionTextStackProps {
  headline?: TextField;
  text?: Field<string>;
  isEditing: boolean;
}

/** Headline and RTE body; empty slices hidden for visitors. */
export function IntroductionTextStack({
  headline,
  text,
  isEditing,
}: IntroductionTextStackProps): JSX.Element | null {
  const showHeadline = hasNonEmptyText(headline?.value) || (isEditing && headline !== undefined);
  const hasBody =
    text != null && !isRichTextEffectivelyEmpty(text.value?.toString());
  const showText = hasBody || (isEditing && text !== undefined);

  if (!showHeadline && !showText) {
    return null;
  }

  return (
    <>
      {showHeadline && headline ? (
        <Text
          className="box-border !m-0 block w-full max-w-full break-words p-0 text-[30px] font-bold leading-[37.5px] text-ink-primary font-media-tile antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]"
          field={headline}
          tag="h2"
        />
      ) : null}
      {showText && text ? (
        <div
          className={cn('mx-0 mb-0 w-full min-w-0 box-border overflow-x-auto p-0', showHeadline ? 'mt-4' : 'mt-0')}
        >
          <RichText
            className={"!m-0 !p-0 max-mobile-large:!p-0 w-full min-w-0 prose font-divider text-font-normal leading-relaxed text-ink-primary [&>*:first-child]:!m-0 [&>*+*]:!mt-[16px] [&>*+*]:!mb-0 [&>*+*]:!mx-0 [&_li>p]:!block [&_li>p]:!m-0 [&_li>p:not(:last-child)]:!mb-1 [&_ul]:!m-0 [&_ul]:!list-none [&_ul]:!pl-0 [&_ul]:!space-y-2 [&_ul]:!text-ink-primary [&_ul>li]:!relative [&_ul>li]:!m-0 [&_ul>li]:!list-none [&_ul>li]:!pl-5 md:[&_ul>li]:!pl-6 [&_ul>li]:!leading-6 md:[&_ul>li]:!leading-8 [&_ul>li]:before:!absolute [&_ul>li]:before:!left-[0.15rem] [&_ul>li]:before:!top-[calc((1lh-6px)/2)] [&_ul>li]:before:!h-[6px] [&_ul>li]:before:!w-[6px] [&_ul>li]:before:!shrink-0 [&_ul>li]:before:!rounded-full [&_ul>li]:before:!content-[''] [&_ul>li]:before:!bg-[var(--color-nav-link-hover)] [&_ol]:!m-0 [&_ol]:!pl-6 md:[&_ol]:!pl-7 [&_ol]:!space-y-2 [&_ol]:!text-ink-primary [&_ol>li]:!list-decimal [&_ol>li]:!list-outside [&_ol>li]:!m-0 [&_ol>li]:!pl-2 [&_ol>li]:!leading-6 md:[&_ol>li]:!leading-8 [&_ol>li::marker]:!text-nav-link-hover [&_a]:!text-nav-link-hover [&_a]:!underline [&_a:hover]:!text-[rgb(0,40,123)] [&_a:hover]:!no-underline [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-nav-link-hover [&_a]:focus-visible:ring-offset-2 [&_strong]:!font-bold [&_em]:!italic !font-media-tile !text-base !font-normal !leading-6 !text-ink-primary [&_p]:!leading-6 [&_img]:!h-auto [&_img]:!max-w-full [&_table]:!max-w-full [&_iframe]:!max-w-full [&_a]:!text-link [&_a]:!no-underline hover:[&_a]:!text-link-strong hover:[&_a]:!underline [&_a]:focus-visible:!ring-2 [&_a]:focus-visible:!ring-link [&_a]:focus-visible:!ring-offset-2 [&_a]:focus-visible:!outline-none"}
            field={text}
          />
        </div>
      ) : null}
    </>
  );
}
