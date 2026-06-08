import { JSX } from 'react';
import type { Field } from '@sitecore-content-sdk/nextjs';
import { RichText } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

import { isRichTextEffectivelyEmpty } from 'components/rich-text/richTextUtils';

import type { InfoBoxProps } from './InfoBox.type';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';
import {
  INFOBOX_EMPTY_HINT,
  INFOBOX_REGION_ARIA,
  isHideIconChecked,
  resolveInfoBoxContext,
  resolveInfoBoxFields,
  shouldShowInfoBoxIcon,
} from './infoBoxUtils';
import { InfoBoxIcon } from './partial/InfoBoxPartials';

/** InfoBox rich-text message with optional context icon (Info / Success / None). */
export const Default = ({ fields, params, page }: InfoBoxProps): JSX.Element | null => {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);

  if (!fields) {
    if (!isEditing) {
      return null;
    }
    return (
      <section
        className={cn(
          'component info-box box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0! w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] !my-[18px]',
          styles,
        )}
        {...anchorId}
        aria-label={INFOBOX_REGION_ARIA.none}
        data-testid="info-box"
        data-context="none"
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
          <div
            className="info-box-outer box-border w-full min-w-0 max-w-full my-[var(--layout-gutter-inline)] mx-auto max-[600px]:mx-0 pl-[24px] min-[569px]:max-[767px]:max-w-[calc(var(--infobox-max-width-compact)+2*var(--layout-gutter-inline))] min-[768px]:max-[991px]:max-w-[calc(var(--infobox-max-width-tablet)+2*var(--layout-gutter-inline))] min-[992px]:max-w-[calc(var(--infobox-max-width-desktop)+2*var(--layout-gutter-inline))]"
            data-testid="info-box-outer"
          >
            <span className="is-empty-hint">{INFOBOX_EMPTY_HINT}</span>
          </div>
        </div>
      </section>
    );
  }

  const { textField, contextRaw, hideIconRaw } = resolveInfoBoxFields(fields);
  const context = resolveInfoBoxContext(contextRaw);
  const hideIcon = isHideIconChecked(hideIconRaw);
  const showIcon = shouldShowInfoBoxIcon(context, hideIcon);
  const hasTextValue = !isRichTextEffectivelyEmpty(textField?.value?.toString());

  if (!hasTextValue && !isEditing) {
    return null;
  }

  const ariaLabel = INFOBOX_REGION_ARIA[context];

  return (
    <section
      className={cn(
        'component info-box box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0! w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] !my-[18px]',
        styles,
      )}
      {...anchorId}
      aria-label={ariaLabel}
      data-testid="info-box"
      data-context={context}
    >
      <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
        <div
          className="info-box-outer box-border w-full min-w-0 max-w-full my-[var(--layout-gutter-inline)] mx-auto max-[600px]:mx-0 pl-[24px] min-[569px]:max-[767px]:max-w-[calc(var(--infobox-max-width-compact)+2*var(--layout-gutter-inline))] min-[768px]:max-[991px]:max-w-[calc(var(--infobox-max-width-tablet)+2*var(--layout-gutter-inline))] min-[992px]:max-w-[calc(var(--infobox-max-width-desktop)+2*var(--layout-gutter-inline))]"
          data-testid="info-box-outer"
        >
          <div
            className={cn(
              'box-border m-0 flex min-h-0 min-w-0 w-full max-w-full items-start gap-0 border-l-8 bg-neutral-200 p-6 leading-6 text-ink-primary',
              context === 'info' && 'border-l-[var(--color-accent-warning)]',
              context === 'success' && 'border-l-[var(--color-link)]',
              context === 'none' && 'border-l-stroke-default',
            )}
            data-testid="info-box-shell"
          >
            {showIcon ? <InfoBoxIcon context={context} /> : null}
            <div className="box-border min-w-0 flex-1 leading-6 text-ink-primary">
              {hasTextValue || isEditing ? (
                <RichText
                  className={"prose font-divider text-font-normal leading-relaxed text-ink-primary [&>*:first-child]:!m-0 [&>*+*]:!mt-[16px] [&>*+*]:!mb-0 [&>*+*]:!mx-0 [&_li>p]:!block [&_li>p]:!m-0 [&_li>p:not(:last-child)]:!mb-1 [&_ul]:!m-0 [&_ul]:!list-none [&_ul]:!pl-0 [&_ul]:!space-y-2 [&_ul]:!text-ink-primary [&_ul>li]:!relative [&_ul>li]:!m-0 [&_ul>li]:!list-none [&_ul>li]:!pl-5 md:[&_ul>li]:!pl-6 [&_ul>li]:!leading-6 md:[&_ul>li]:!leading-8 [&_ul>li]:before:!absolute [&_ul>li]:before:!left-[0.15rem] [&_ul>li]:before:!top-[calc((1lh-6px)/2)] [&_ul>li]:before:!h-[6px] [&_ul>li]:before:!w-[6px] [&_ul>li]:before:!shrink-0 [&_ul>li]:before:!rounded-full [&_ul>li]:before:!content-[''] [&_ul>li]:before:!bg-[var(--color-nav-link-hover)] [&_ol]:!m-0 [&_ol]:!pl-6 md:[&_ol]:!pl-7 [&_ol]:!space-y-2 [&_ol]:!text-ink-primary [&_ol>li]:!list-decimal [&_ol>li]:!list-outside [&_ol>li]:!m-0 [&_ol>li]:!pl-2 [&_ol>li]:!leading-6 md:[&_ol>li]:!leading-8 [&_ol>li::marker]:!text-nav-link-hover [&_a]:!text-nav-link-hover [&_a]:!underline [&_a:hover]:!text-[rgb(0,40,123)] [&_a:hover]:!no-underline [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-nav-link-hover [&_a]:focus-visible:ring-offset-2 [&_strong]:!font-bold [&_em]:!italic !text-font-media-tile-eyebrow !leading-[19.25px]"}
                  field={(textField ?? { value: '' }) as Field<string>}
                />
              ) : (
                <span className="is-empty-hint">{INFOBOX_EMPTY_HINT}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
