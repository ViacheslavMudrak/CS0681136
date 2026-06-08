import { type JSX, type ReactNode } from 'react';

import { cn } from 'lib/utils';
import type { MediaTileProps } from 'components/media-tile/MediaTile.type';
import {
  extractMediaTileBrightcoveId,
  mediaTileHasPreviewContent,
  mergeMediaTileRenderingParams,
  resolveMediaTileFields,
  resolveMediaTileImageSizes,
  resolveMediaTileLayoutConfig,
} from 'components/media-tile/mediaTileUtils';
import {
  MediaTileBody,
  MediaTileLinks,
  MediaTileMedia,
  MediaTileSplit,
} from 'components/media-tile/partial/MediaTilePartials';
import { MediaTileVideo } from 'components/media-tile/partial/MediaTileVideo';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import { storyMediaTileLabels } from '../storyLabels';

export type MediaTileStoryPreviewLabels = typeof storyMediaTileLabels;

export type MediaTileStoryPreviewProps = MediaTileProps & {
  labels?: MediaTileStoryPreviewLabels;
  embeddedCallout?: ReactNode | null;
};

export function MediaTileStoryPreview({
  fields,
  params,
  page,
  rendering,
  labels = storyMediaTileLabels,
  embeddedCallout = null,
}: MediaTileStoryPreviewProps): JSX.Element | null {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);
  const ctaGroupLabel =
    rendering?.componentName ? String(rendering.componentName).trim() : undefined;

  const layoutParams = mergeMediaTileRenderingParams(rendering, params as Record<string, unknown>);
  const layout = resolveMediaTileLayoutConfig(layoutParams);
  const imageSizes = resolveMediaTileImageSizes(layout.mediaWidthPercent);

  if (!fields) {
    return (
      <div
        className={cn(
          'component media-tile relative box-border w-full max-w-[100vw] shrink-0 !px-0 ml-[calc(50%-50vw)] overflow-x-clip',
          styles,
        )}
        {...anchorId}
      >
        <div className="component-content min-w-0 max-w-full">
          <div
            className={cn(
              'isolate box-border block w-full min-w-0 max-w-full overflow-x-clip py-16 md:tablet-only:pt-12 md:tablet-only:pb-8 lg:py-16 font-media-tile leading-6 [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] border-0 border-solid border-stroke-default',
              layout.surfaceColor === 'dark' && 'bg-surface-inverse text-ink-inverse',
              layout.surfaceColor === 'gray' && 'bg-surface-muted text-ink-primary',
              layout.surfaceColor !== 'dark' &&
                layout.surfaceColor !== 'gray' &&
                layout.hasWhiteBackground &&
                'bg-surface text-ink-primary',
              layout.surfaceColor !== 'dark' &&
                layout.surfaceColor !== 'gray' &&
                !layout.hasWhiteBackground &&
                'bg-surface-subtle text-ink-primary',
            )}
          >
            <div className="relative box-border w-full [unicode-bidi:isolate] px-4 max-sm:mx-0 max-sm:max-w-full sm:max-md:mx-auto sm:max-md:w-full sm:max-md:max-w-[600px] md:max-lg:mx-[72px] md:max-lg:w-[calc(100%-144px)] md:max-lg:max-w-[768px] lg:mx-auto lg:w-full lg:max-w-[var(--width-media-tile-split-max)]">
              <span className="is-empty-hint">{labels.emptyHint}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const resolvedFields = resolveMediaTileFields(fields, isEditing) ?? fields;

  const hasPreview = mediaTileHasPreviewContent(resolvedFields);
  if (!hasPreview && !isEditing) {
    return null;
  }

  const mediaTypeRaw = resolvedFields.MediaType?.fields?.Value?.value;
  const mediaTypeStr =
    typeof mediaTypeRaw === 'number' ? String(mediaTypeRaw) : (mediaTypeRaw ?? '');
  const isVideoMedia = mediaTypeStr.trim().toLowerCase() === 'video';

  const textColumn = (
    <div
      className={cn(
        'order-0 min-w-0 max-sm:w-full sm:flex-1 sm:shrink sm:basis-0',
        layout.mediaWidthPercent === 40 ?
          'sm:w-[60%] sm:max-w-[60%]'
        : 'sm:w-1/2 sm:max-w-[50%]',
        'box-border m-0 min-w-0 self-center border-0 border-solid border-stroke-default font-media-tile leading-6 [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [text-size-adjust:100%] [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
        layout.isCard && 'p-6 sm:pt-8 sm:pb-8',
        layout.isCard && layout.mediaOnRight && 'sm:pl-8 sm:pr-6',
        layout.isCard && !layout.mediaOnRight && 'sm:pr-8 sm:pl-6',
        !layout.isCard && 'sm:py-8',
        !layout.isCard && layout.mediaOnRight && 'sm:pr-6 sm:pl-0',
        !layout.isCard && !layout.mediaOnRight && 'sm:pl-6 sm:pr-0',
      )}
    >
      <div className="flex min-w-0 w-full flex-col items-stretch justify-start">
        <MediaTileBody fields={resolvedFields} isEditing={isEditing} layout={layout} />
        <MediaTileLinks
          links={resolvedFields.Links}
          isEditing={isEditing}
          groupAriaLabel={ctaGroupLabel}
          showVerticalLinkDividers={!layout.isCard}
          labels={{
            noLinksConfigured: labels.noLinksConfigured,
            linkFallback: labels.linkFallback,
          }}
        />
      </div>
    </div>
  );

  const brightcoveId = extractMediaTileBrightcoveId(resolvedFields.Video);

  const showImageColumn =
    !isVideoMedia && (Boolean(resolvedFields.Image?.value?.src) || isEditing);
  const showVideoColumn =
    isVideoMedia && (Boolean(brightcoveId) || isEditing);
  const showVideoPlaceholder = isVideoMedia && isEditing && !brightcoveId;

  const mediaColumn =
    showImageColumn ?
      <div
        className={cn(
          'flex min-h-0 flex-col max-sm:w-full sm:self-stretch sm:shrink-0 order-[9999]',
          layout.mediaOnRight ? 'sm:pl-6 sm:pr-0' : 'sm:pr-6 sm:pl-0',
          layout.mediaWidthPercent === 40 ?
            'sm:w-[40%] sm:max-w-[40%]'
          : 'sm:w-1/2 sm:max-w-[50%]',
        )}
      >
        <MediaTileMedia
          image={resolvedFields.Image}
          focalPointValue={resolvedFields.FocalPoint?.fields?.Value?.value}
          layout={layout}
          backdropClass={cn(
            layout.isCard && 'bg-surface',
            !layout.isCard && layout.surfaceColor === 'dark' && 'bg-surface-inverse',
            !layout.isCard && layout.surfaceColor === 'gray' && 'bg-surface-muted',
            !layout.isCard &&
              layout.surfaceColor !== 'dark' &&
              layout.surfaceColor !== 'gray' &&
              layout.hasWhiteBackground &&
              'bg-surface',
            !layout.isCard &&
              layout.surfaceColor !== 'dark' &&
              layout.surfaceColor !== 'gray' &&
              !layout.hasWhiteBackground &&
              'bg-surface-subtle',
          )}
          sizes={imageSizes}
          isEditing={isEditing}
          emptyStateLabel={labels.emptyHint}
        />
      </div>
    : showVideoColumn && brightcoveId ?
      <div
        className={cn(
          'flex min-h-0 flex-col max-sm:w-full sm:self-stretch sm:shrink-0 order-[9999]',
          layout.mediaOnRight ? 'sm:pl-6 sm:pr-0' : 'sm:pr-6 sm:pl-0',
          layout.mediaWidthPercent === 40 ?
            'sm:w-[40%] sm:max-w-[40%]'
          : 'sm:w-1/2 sm:max-w-[50%]',
        )}
      >
        <MediaTileVideo
          video={resolvedFields.Video ?? undefined}
          layout={layout}
          backdropClass={cn(
            layout.isCard && 'bg-surface',
            !layout.isCard && layout.surfaceColor === 'dark' && 'bg-surface-inverse',
            !layout.isCard && layout.surfaceColor === 'gray' && 'bg-surface-muted',
            !layout.isCard &&
              layout.surfaceColor !== 'dark' &&
              layout.surfaceColor !== 'gray' &&
              layout.hasWhiteBackground &&
              'bg-surface',
            !layout.isCard &&
              layout.surfaceColor !== 'dark' &&
              layout.surfaceColor !== 'gray' &&
              !layout.hasWhiteBackground &&
              'bg-surface-subtle',
          )}
        />
      </div>
    : showVideoPlaceholder ?
      <div
        className={cn(
          layout.mediaWidthPercent === 40 ?
            'max-sm:w-full sm:w-[40%] sm:max-w-[40%] sm:shrink-0'
          : 'max-sm:w-full sm:w-1/2 sm:max-w-[50%] sm:shrink-0',
          'box-border min-w-0 sm:self-stretch order-[9999]',
          layout.mediaOnRight ? 'sm:pl-6 sm:pr-0' : 'sm:pr-6 sm:pl-0',
          layout.isCard && 'max-sm:px-0',
        )}
      >
        <div
          className={cn(
            'flex min-h-[12rem] w-full items-center justify-center',
            layout.isCard && 'bg-surface',
            !layout.isCard && layout.surfaceColor === 'dark' && 'bg-surface-inverse',
            !layout.isCard && layout.surfaceColor === 'gray' && 'bg-surface-muted',
            !layout.isCard &&
              layout.surfaceColor !== 'dark' &&
              layout.surfaceColor !== 'gray' &&
              layout.hasWhiteBackground &&
              'bg-surface',
            !layout.isCard &&
              layout.surfaceColor !== 'dark' &&
              layout.surfaceColor !== 'gray' &&
              !layout.hasWhiteBackground &&
              'bg-surface-subtle',
          )}
        >
          <span className="is-empty-hint">{labels.emptyHint}</span>
        </div>
      </div>
    : null;

  return (
    <section
      className={cn(
        'component media-tile relative box-border w-full max-w-[100vw] shrink-0 !px-0 ml-[calc(50%-50vw)] overflow-x-clip',
        styles,
      )}
      {...anchorId}
    >
      <div className="component-content min-w-0 max-w-full">
        <div
          className={cn(
            'isolate box-border block w-full min-w-0 max-w-full overflow-x-clip py-16 md:tablet-only:pt-12 md:tablet-only:pb-8 lg:py-16 font-media-tile leading-6 [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] border-0 border-solid border-stroke-default',
            layout.surfaceColor === 'dark' && 'bg-surface-inverse text-ink-inverse',
            layout.surfaceColor === 'gray' && 'bg-surface-muted text-ink-primary',
            layout.surfaceColor !== 'dark' &&
              layout.surfaceColor !== 'gray' &&
              layout.hasWhiteBackground &&
              'bg-surface text-ink-primary',
            layout.surfaceColor !== 'dark' &&
              layout.surfaceColor !== 'gray' &&
              !layout.hasWhiteBackground &&
              'bg-surface-subtle text-ink-primary',
          )}
        >
          <MediaTileSplit
            layout={layout}
            textColumn={textColumn}
            mediaColumn={mediaColumn}
          />
          {embeddedCallout ?
            <div className="relative box-border w-full min-w-0 overflow-x-clip text-ink-muted [unicode-bidi:isolate] px-4 max-sm:max-w-full sm:max-md:mx-auto sm:max-md:max-w-[600px] sm:max-md:w-full md:max-lg:mx-[72px] md:max-lg:w-[calc(100%-144px)] md:max-lg:max-w-[768px] lg:mx-auto lg:max-w-[var(--width-media-tile-split-max)]">
              {embeddedCallout}
            </div>
          : null}
        </div>
      </div>
    </section>
  );
}
