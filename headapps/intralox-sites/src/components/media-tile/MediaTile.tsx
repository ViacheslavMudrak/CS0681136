import { JSX } from "react";

import { getMediaTileLabels } from "lib/media-tile-i18n";

import { Default as CalloutDefault } from "../callout/Callout";
import type { MediaTileProps } from "./MediaTile.type";
import {
  extractMediaTileBrightcoveId,
  mediaTileHasPreviewContent,
  mediaTileShouldRenderEmbeddedCallout,
  mergeMediaTileRenderingParams,
  omitColorSchemeParamForEmbeddedCallout,
  mergeMediaTileButtonAlignmentIntoCalloutParams,
  mapMediaTilePrefixedCalloutParamsForEmbeddedCallout,
  resolveMediaTileFields,
  resolveMediaTileImageSizes,
  resolveMediaTileLayoutConfig,
} from "./mediaTileUtils";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import { getCheckboxValue } from "../divider/dividerUtils";
import {
  MediaTileBody,
  MediaTileLinks,
  MediaTileMedia,
  MediaTileSplit,
} from "./partial/MediaTilePartials";
import { MediaTileVideo } from "./partial/MediaTileVideo";
import {
  AppPlaceholder,
  type ComponentMap,
  type Page,
} from "@sitecore-content-sdk/nextjs";
import componentMap from ".sitecore/component-map";
import { cn } from "lib/utils";

/**
 * Default Media Tile: stacks below 600px; from 600px one row with 50/40% flex columns.
 * When callout items, footnote, or group link are present, renders the shared Callout component below the split.
 */
export async function Default({
  fields,
  params,
  page,
  rendering,
}: MediaTileProps): Promise<JSX.Element | null> {
  const labels = await getMediaTileLabels();
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);
  const ctaGroupLabel = rendering?.componentName
    ? String(rendering.componentName).trim()
    : undefined;

  const layoutParams = mergeMediaTileRenderingParams(
    rendering,
    params as Record<string, unknown>,
  );
  const layout = resolveMediaTileLayoutConfig(layoutParams);
  const imageSizes = resolveMediaTileImageSizes(layout.mediaWidthPercent);

  if (!fields) {
    return (
      <div
        className={cn(
          "component media-tile relative box-border w-full max-w-[100vw] shrink-0 !px-0 ml-[calc(50%-50vw)] overflow-x-clip",
          styles ?? "",
        )}
        {...anchorId}
      >
        <div className="component-content min-w-0 max-w-full">
          <div
            className={cn(
              "isolate box-border block w-full min-w-0 max-w-full overflow-x-clip pt-12 pb-4 sm:py-12 lg:py-16 font-media-tile leading-6 [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] border-0 border-solid border-stroke-default",
              layout.surfaceColor === "dark" &&
                "bg-surface-inverse text-ink-inverse",
              layout.surfaceColor === "gray" &&
                "bg-surface-muted text-ink-primary",
              layout.surfaceColor !== "dark" &&
                layout.surfaceColor !== "gray" &&
                layout.hasWhiteBackground &&
                "bg-surface text-ink-primary",
              layout.surfaceColor !== "dark" &&
                layout.surfaceColor !== "gray" &&
                !layout.hasWhiteBackground &&
                "bg-surface-subtle text-ink-primary",
            )}
          >
            <div className="relative box-border w-full [unicode-bidi:isolate] px-4 max-sm:mx-0 max-sm:max-w-full sm:max-md:mx-auto sm:max-md:w-full sm:max-md:max-w-[600px] md:max-lg:mx-[72px] md:max-lg:max-w-[768px] lg:mx-auto lg:w-full lg:max-xl:max-w-[992px] xl:max-w-[var(--width-media-tile-split-max)] !mx-auto">
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

  const embeddedCalloutParams =
    mapMediaTilePrefixedCalloutParamsForEmbeddedCallout(
      omitColorSchemeParamForEmbeddedCallout(
        mergeMediaTileButtonAlignmentIntoCalloutParams(
          layoutParams,
          resolvedFields,
        ),
      ),
      layoutParams,
    ) as MediaTileProps["params"];

  const mediaTypeRaw = resolvedFields.MediaType?.fields?.Value?.value;
  const mediaTypeStr =
    typeof mediaTypeRaw === "number"
      ? String(mediaTypeRaw)
      : (mediaTypeRaw ?? "");
  const isVideoMedia = mediaTypeStr.trim().toLowerCase() === "video";

  const textColumn = (
    <div
      className={cn(
        "order-0 min-w-0 max-sm:w-full sm:flex-1 sm:shrink sm:basis-0",
        layout.mediaWidthPercent === 40
          ? "sm:w-[60%] sm:max-w-[60%]"
          : "sm:w-1/2 sm:max-w-[50%]",
        "box-border m-0 min-w-0 self-center border-0 border-solid border-stroke-default font-media-tile leading-6 [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]",
        layout.isCard && "p-6 sm:pt-8 sm:pb-8",
        layout.isCard && layout.mediaOnRight && "sm:pl-8 sm:pr-6",
        layout.isCard && !layout.mediaOnRight && "sm:pr-8 sm:pl-6",
        !layout.isCard && "sm:py-8",
        !layout.isCard && layout.mediaOnRight && "sm:pr-6 sm:pl-0",
        !layout.isCard && !layout.mediaOnRight && "sm:pl-6 sm:pr-0",
      )}
    >
      <div className="w-full min-w-0 [&_.container]:px-0 [&_.container]:mb-2">
        <AppPlaceholder
          name="breadbrumb-{*}"
          componentMap={componentMap as ComponentMap}
          rendering={rendering}
          page={page}
          disableSuspense
        />
      </div>

      <div className="flex min-w-0 w-full flex-col items-stretch justify-start">
        <MediaTileBody
          fields={resolvedFields}
          isEditing={isEditing}
          layout={layout}
        />
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

  const includeDividerRaw =
    resolvedFields.IncludeDivider ?? layoutParams.IncludeDivider;
  const showDivider =
    includeDividerRaw != null && getCheckboxValue(includeDividerRaw);

  const showEmbeddedCallout = mediaTileShouldRenderEmbeddedCallout(
    resolvedFields,
    isEditing,
  );

  const embeddedCallout = showEmbeddedCallout
    ? await CalloutDefault({
        embeddedLayout: true,
        fields: {
          Callouts: resolvedFields.Callouts,
          CalloutItems: resolvedFields.CalloutItems,
          Footnote: resolvedFields.Footnote,
          Link: resolvedFields.Link,
        },
        params: embeddedCalloutParams,
        page,
        rendering,
      })
    : null;

  const showImageColumn =
    !isVideoMedia && (Boolean(resolvedFields.Image?.value?.src) || isEditing);
  const showVideoColumn = isVideoMedia && (Boolean(brightcoveId) || isEditing);
  const showVideoPlaceholder = isVideoMedia && isEditing && !brightcoveId;

  const mediaColumn = showImageColumn ? (
    <div
      className={cn(
        "flex min-h-0 flex-col max-sm:w-full sm:self-stretch sm:shrink-0 order-[9999]",
        layout.mediaOnRight ? "sm:pl-6 sm:pr-0" : "sm:pr-6 sm:pl-0",
        layout.mediaWidthPercent === 40
          ? "sm:w-[40%] sm:max-w-[40%]"
          : "sm:w-1/2 sm:max-w-[50%]",
      )}
    >
      <MediaTileMedia
        image={resolvedFields.Image}
        focalPointValue={resolvedFields.FocalPoint?.fields?.Value?.value}
        layout={layout}
        backdropClass={cn(
          layout.isCard && "bg-surface",
          !layout.isCard &&
            layout.surfaceColor === "dark" &&
            "bg-surface-inverse",
          !layout.isCard &&
            layout.surfaceColor === "gray" &&
            "bg-surface-muted",
          !layout.isCard &&
            layout.surfaceColor !== "dark" &&
            layout.surfaceColor !== "gray" &&
            layout.hasWhiteBackground &&
            "bg-surface",
          !layout.isCard &&
            layout.surfaceColor !== "dark" &&
            layout.surfaceColor !== "gray" &&
            !layout.hasWhiteBackground &&
            "bg-surface-subtle",
        )}
        sizes={imageSizes}
        isEditing={isEditing}
        emptyStateLabel={labels.emptyHint}
      />
    </div>
  ) : showVideoColumn && brightcoveId ? (
    <div
      className={cn(
        "flex min-h-0 flex-col max-sm:w-full sm:self-stretch sm:shrink-0 order-[9999]",
        layout.mediaOnRight ? "sm:pl-6 sm:pr-0" : "sm:pr-6 sm:pl-0",
        layout.mediaWidthPercent === 40
          ? "sm:w-[40%] sm:max-w-[40%]"
          : "sm:w-1/2 sm:max-w-[50%]",
      )}
    >
      <MediaTileVideo
        video={resolvedFields.Video ?? undefined}
        layout={layout}
        backdropClass={cn(
          layout.isCard && "bg-surface",
          !layout.isCard &&
            layout.surfaceColor === "dark" &&
            "bg-surface-inverse",
          !layout.isCard &&
            layout.surfaceColor === "gray" &&
            "bg-surface-muted",
          !layout.isCard &&
            layout.surfaceColor !== "dark" &&
            layout.surfaceColor !== "gray" &&
            layout.hasWhiteBackground &&
            "bg-surface",
          !layout.isCard &&
            layout.surfaceColor !== "dark" &&
            layout.surfaceColor !== "gray" &&
            !layout.hasWhiteBackground &&
            "bg-surface-subtle",
        )}
      />
    </div>
  ) : showVideoPlaceholder ? (
    <div
      className={cn(
        layout.mediaWidthPercent === 40
          ? "max-sm:w-full sm:w-[40%] sm:max-w-[40%] sm:shrink-0"
          : "max-sm:w-full sm:w-1/2 sm:max-w-[50%] sm:shrink-0",
        "box-border min-w-0 sm:self-stretch order-[9999]",
        layout.mediaOnRight ? "sm:pl-6 sm:pr-0" : "sm:pr-6 sm:pl-0",
        layout.isCard && "max-sm:px-0",
      )}
    >
      <div
        className={cn(
          "flex min-h-[12rem] w-full items-center justify-center",
          layout.isCard && "bg-surface",
          !layout.isCard &&
            layout.surfaceColor === "dark" &&
            "bg-surface-inverse",
          !layout.isCard &&
            layout.surfaceColor === "gray" &&
            "bg-surface-muted",
          !layout.isCard &&
            layout.surfaceColor !== "dark" &&
            layout.surfaceColor !== "gray" &&
            layout.hasWhiteBackground &&
            "bg-surface",
          !layout.isCard &&
            layout.surfaceColor !== "dark" &&
            layout.surfaceColor !== "gray" &&
            !layout.hasWhiteBackground &&
            "bg-surface-subtle",
        )}
      >
        <span className="is-empty-hint">{labels.emptyHint}</span>
      </div>
    </div>
  ) : null;

  return (
    <section
      className={cn(
        "component media-tile relative box-border w-full max-w-[100vw] shrink-0 !px-0 ml-[calc(50%-50vw)] overflow-x-clip",
        styles ?? "",
      )}
      {...anchorId}
    >
      <div className="component-content min-w-0 max-w-full">
        <div
          className={cn(
            "isolate box-border block w-full min-w-0 max-w-full overflow-x-clip pt-12 pb-4 sm:py-12 lg:py-16 font-media-tile leading-6 [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] border-0 border-solid border-stroke-default",
            layout.surfaceColor === "dark" &&
              "bg-surface-inverse text-ink-inverse",
            layout.surfaceColor === "gray" &&
              "bg-surface-muted text-ink-primary",
            layout.surfaceColor !== "dark" &&
              layout.surfaceColor !== "gray" &&
              layout.hasWhiteBackground &&
              "bg-surface text-ink-primary",
            layout.surfaceColor !== "dark" &&
              layout.surfaceColor !== "gray" &&
              !layout.hasWhiteBackground &&
              "bg-surface-subtle text-ink-primary",
          )}
        >
          <MediaTileSplit
            layout={layout}
            textColumn={textColumn}
            mediaColumn={mediaColumn}
          />
          {embeddedCallout ? (
            <div className="relative box-border w-full min-w-0 overflow-x-clip text-ink-muted [unicode-bidi:isolate] px-4 max-sm:max-w-full sm:max-md:mx-auto sm:max-md:max-w-[600px] sm:max-md:w-full md:max-lg:mx-[72px] md:max-lg:max-w-[768px] lg:mx-auto lg:max-xl:max-w-[992px] !mx-auto xl:max-w-[var(--width-media-tile-split-max)]">
              {embeddedCallout}
            </div>
          ) : null}
        </div>
      </div>
      {showDivider && (
        <hr
          aria-hidden="true"
          className="box-border block h-px w-full min-h-0 min-w-0 shrink-0 overflow-hidden border-0 border-t border-solid border-stroke-default m-0 p-0"
        />
      )}
    </section>
  );
}
