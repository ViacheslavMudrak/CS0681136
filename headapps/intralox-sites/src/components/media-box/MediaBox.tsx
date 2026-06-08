import type { JSX } from 'react';
import { cn } from 'lib/utils';

import type { MediaBoxProps } from './MediaBox.type';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';
import {
  MEDIA_BOX_EMPTY_HINT,
  MEDIA_BOX_SECTION_FALLBACK,
  mergeMediaBoxRenderingParams,
  mediaBoxHasVisitorContent,
  resolveMediaBoxContentOptionsDataValue,
  resolveMediaBoxFields,
  resolveMediaBoxThemeKey,
} from './mediaBoxUtils';
import { MediaBoxLayout } from './partial/MediaBoxPartials';

/** Media Box: heading, rich text, CTA, and image or video rail with optional Brightcove modal. */
export function Default({
  fields,
  params,
  page,
  rendering,
}: MediaBoxProps): JSX.Element | null {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);

  const merged = mergeMediaBoxRenderingParams(rendering, params as Record<string, unknown>);
  const isDarkTheme = resolveMediaBoxThemeKey(merged) === 'dark';
  const contentOptionsData = resolveMediaBoxContentOptionsDataValue(merged);

  if (!fields) {
    if (!isEditing) {
      return null;
    }
    return (
      <section
        className={cn(
          'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0!',
          'w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
          'component media-box',
          '[.two-column-container_&]:w-full [.two-column-container_&]:max-w-full [.two-column-container_&]:ml-0 [.two-column-container_&]:mr-0 [.two-column-container_&]:flex-[0_1_auto] [.two-column-container_&]:min-w-0 [.two-column-container_&]:p-0',
          styles,
        )}
        {...anchorId}
        aria-label={MEDIA_BOX_SECTION_FALLBACK}
        data-content-options={contentOptionsData}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none p-0! [.two-column-container_&]:ml-0 [.two-column-container_&]:mr-0 [.two-column-container_&]:max-w-none [.two-column-container_&]:min-w-0 [.two-column-container_&]:w-full">
          <div
            className="media-box-outer box-border w-full min-w-0 max-w-full my-[var(--layout-gutter-inline)] mx-auto max-[600px]:mx-0 px-[var(--layout-gutter-inline)] min-[569px]:max-[767px]:max-w-[calc(var(--infobox-max-width-compact)+2*var(--layout-gutter-inline))] min-[768px]:max-[991px]:max-w-[calc(var(--infobox-max-width-tablet)+2*var(--layout-gutter-inline))] min-[992px]:max-[1199px]:max-w-[calc(var(--infobox-max-width-desktop)+2*var(--layout-gutter-inline))] min-[1200px]:max-w-[calc(var(--infobox-max-width-desktop-xl)+2*var(--layout-gutter-inline))] [.two-column-container_&]:my-0 [.two-column-container_&]:mx-0 [.two-column-container_&]:max-w-none [.two-column-container_&]:px-0 [.two-column-container_&]:w-full [.two-column-container_&]:min-w-0"
            data-testid="media-box-outer"
          >
            <div
              className={cn(
                'media-box-inner box-border m-0 min-h-0 min-w-0 w-full max-w-full p-4 lg:p-6',
                'isolate box-border w-full max-w-full border-t border-b border-solid border-stroke-default font-media-tile text-base font-normal leading-6 antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
                isDarkTheme ? 'bg-chrome-stripe text-ink-inverse' : 'bg-surface text-ink-primary',
              )}
              data-testid="media-box-inner"
            >
              <span className="is-empty-hint">{MEDIA_BOX_EMPTY_HINT}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const resolvedFields = resolveMediaBoxFields(fields);

  if (!mediaBoxHasVisitorContent(resolvedFields, merged) && !isEditing) {
    return null;
  }

  const regionLabel =
    typeof resolvedFields.Heading?.value === 'string' && resolvedFields.Heading.value.trim() !== '' ?
      resolvedFields.Heading.value.trim()
    : MEDIA_BOX_SECTION_FALLBACK;

  return (
    <section
      className={cn(
        'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0!',
        'w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
        'component media-box',
        '[.two-column-container_&]:w-full [.two-column-container_&]:max-w-full [.two-column-container_&]:ml-0 [.two-column-container_&]:mr-0 [.two-column-container_&]:flex-[0_1_auto] [.two-column-container_&]:min-w-0 [.two-column-container_&]:p-0',
        styles,
      )}
      {...anchorId}
      aria-label={regionLabel}
      data-content-options={contentOptionsData}
    >
      <div className="component-content box-border m-0 min-w-0 w-full max-w-none p-0! [.two-column-container_&]:ml-0 [.two-column-container_&]:mr-0 [.two-column-container_&]:max-w-none [.two-column-container_&]:min-w-0 [.two-column-container_&]:w-full">
        <div
          className="media-box-outer box-border w-full min-w-0 max-w-full my-[var(--layout-gutter-inline)] mx-auto max-[600px]:mx-0 px-[var(--layout-gutter-inline)] min-[569px]:max-[767px]:max-w-[calc(var(--infobox-max-width-compact)+2*var(--layout-gutter-inline))] min-[768px]:max-[991px]:max-w-[calc(var(--infobox-max-width-tablet)+2*var(--layout-gutter-inline))] min-[992px]:max-[1199px]:max-w-[calc(var(--infobox-max-width-desktop)+2*var(--layout-gutter-inline))] min-[1200px]:max-w-[calc(var(--infobox-max-width-desktop-xl)+2*var(--layout-gutter-inline))] [.two-column-container_&]:my-0 [.two-column-container_&]:mx-0 [.two-column-container_&]:max-w-none [.two-column-container_&]:px-0 [.two-column-container_&]:w-full [.two-column-container_&]:min-w-0"
          data-testid="media-box-outer"
        >
          <div
            className={cn(
              'media-box-inner box-border m-0 min-h-0 min-w-0 w-full max-w-full p-4 lg:p-6',
              'isolate box-border w-full max-w-full border-t border-b border-solid border-stroke-default font-media-tile text-base font-normal leading-6 antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
              isDarkTheme ? 'bg-chrome-stripe text-ink-inverse' : 'bg-surface text-ink-primary',
            )}
            data-testid="media-box-inner"
          >
            <MediaBoxLayout
              fields={resolvedFields}
              isEditing={isEditing}
              isDarkTheme={isDarkTheme}
              mergedParams={merged}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
