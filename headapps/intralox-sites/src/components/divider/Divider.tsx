"use client";

/** Sitecore divider: line or spacing-only strip; visitor visibility requires param + datasource checkboxes. */

import { JSX, type ReactNode } from "react";

import {
  Container,
  type ContainerWidth,
} from "components/shared/BaseContainer";
import { cn } from "lib/utils";
import { getRouteContainerWidth } from "src/utils/routeContainerWidth";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";

import type { DividerFields, DividerProps } from "./Divider.type";
import {
  DIVIDER_ARIA_LABEL,
  DIVIDER_EMPTY_HINT,
  DIVIDER_EMPTY_HINT_HIDDEN,
  getCheckboxValue,
  getFieldStringValue,
  resolveDividerWidthPercent,
} from "./dividerUtils";
import { DividerLine, DividerSpacing } from "./partial/DividerPartials";

function dividerContentWrap(
  children: ReactNode,
  routeContainerWidth?: ContainerWidth,
): JSX.Element {
  return (
    <div className="component-content">
      {routeContainerWidth ? (
        <Container width={routeContainerWidth}>{children}</Container>
      ) : (
        <div className="relative box-border w-full [unicode-bidi:isolate] md:mx-auto md:max-w-[var(--width-media-tile-split-max)] md:max-[768px]:mx-0 md:max-[768px]:w-full md:max-[768px]:max-w-full md:min-[769px]:tablet-only:mx-[72px] md:min-[769px]:tablet-only:w-[calc(100%-144px)] md:min-[769px]:tablet-only:max-w-[768px] md:tablet-only:px-4 lg:mx-auto lg:max-w-[var(--width-media-tile-split-max)] lg:px-4 max-md:px-4">
          {children}
        </div>
      )}
    </div>
  );
}

/** @param fields - Divider fields (flat or GraphQL). */
function getDividerFieldValues(fields: DividerFields): {
  styleValue: string;
  /** Lowercase spacing key (`default`, `small`, `no top spacing`), or empty when datasource Spacing has no value (no vertical margin). */
  spacingValue: string;
  /** `null` = full width; 10–90 = percentage width on the line. */
  widthPercent: number | null;
  showDivider: boolean;
} {
  const flat = fields as {
    Style?: unknown;
    Spacing?: unknown;
    Width?: unknown;
    width?: unknown;
    ShowDivider?: unknown;
  };
  const graphql = fields as {
    data?: {
      datasource?: Record<string, { jsonValue?: unknown } | undefined>;
    };
  };
  const ds = graphql?.data?.datasource;
  const styleRaw =
    getFieldStringValue(flat?.Style) ||
    getFieldStringValue(ds?.style?.jsonValue);
  const spacingRaw =
    getFieldStringValue(flat?.Spacing) ||
    getFieldStringValue(ds?.spacing?.jsonValue);
  const spacingTrimmed = spacingRaw.trim();
  /** Layout REST uses `Width`; Edge / GraphQL often uses `width`; droplist data may live only under `jsonValue`. */
  const widthRaw =
    getFieldStringValue(flat?.Width) ||
    getFieldStringValue(flat?.width) ||
    getFieldStringValue(ds?.width?.jsonValue) ||
    getFieldStringValue(ds?.Width?.jsonValue);
  const showDividerRaw = flat?.ShowDivider ?? ds?.showDivider?.jsonValue;
  return {
    styleValue: String(styleRaw || "none").toLowerCase(),
    spacingValue: spacingTrimmed === "" ? "" : spacingTrimmed.toLowerCase(),
    widthPercent: resolveDividerWidthPercent(widthRaw),
    showDivider: getCheckboxValue(showDividerRaw),
  };
}

/** Sitecore divider: full-bleed strip with inner rule aligned to the media-tile content width. */
export const Default = ({
  fields,
  params,
  page,
  rendering,
}: DividerProps): JSX.Element | null => {
  const { isEditing } = page.mode;
  const { styles, Position, ShowDivider: showDividerParam } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);
  const routeContainerWidth = getRouteContainerWidth(page);

  /** SDK / layout may attach datasource fields on `rendering.fields` only. */
  const fieldSource = (fields ?? rendering?.fields) as
    | DividerFields
    | undefined;

  /** Component-level checkbox (rendering param) — primary chrome toggle in Pages */
  const showDividerFromParam = getCheckboxValue(showDividerParam);

  if (!fieldSource) {
    if (!showDividerFromParam && !isEditing) return null;
    return (
      <section
        className={cn(
          "component divider relative box-border w-full max-w-[100vw] shrink-0 !px-0 ml-[calc(50%-50vw)]",
          styles ?? "",
        )}
        {...anchorId}
        aria-label={DIVIDER_ARIA_LABEL}
      >
        {dividerContentWrap(
          <span className="is-empty-hint">{DIVIDER_EMPTY_HINT}</span>,
          routeContainerWidth,
        )}
      </section>
    );
  }

  const {
    styleValue,
    spacingValue,
    widthPercent,
    showDivider: showDividerFromFields,
  } = getDividerFieldValues(fieldSource);

  /** Visitor sees divider only when both component param and datasource allow it */
  const showDivider = showDividerFromParam && showDividerFromFields;

  if (!showDivider && !isEditing) return null;

  const positionRaw =
    typeof Position === "string"
      ? Position
      : ((Position as { Value?: { value?: string } } | undefined)?.Value
          ?.value ?? "");
  const positionValue = String(positionRaw).toLowerCase() || "center";

  const isLine = styleValue === "line";

  const showLine = isLine || isEditing;

  if (!showDivider && isEditing) {
    return (
      <section
        className={cn(
          "component divider relative box-border w-full max-w-[100vw] shrink-0 !px-0 ml-[calc(50%-50vw)]",
          styles ?? "",
        )}
        {...anchorId}
        aria-label={DIVIDER_ARIA_LABEL}
      >
        {dividerContentWrap(
          <span className="is-empty-hint">{DIVIDER_EMPTY_HINT_HIDDEN}</span>,
          routeContainerWidth,
        )}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "component divider relative box-border w-full max-w-[100vw] shrink-0 !px-0 ml-[calc(50%-50vw)]",
        styles ?? "",
      )}
      {...anchorId}
      {...(showLine
        ? { "aria-label": DIVIDER_ARIA_LABEL }
        : { "aria-hidden": true as const })}
    >
      {dividerContentWrap(
        <>
          {showLine ? (
            <DividerLine
              positionClass={
                positionValue === "left"
                  ? "justify-start"
                  : positionValue === "right"
                    ? "justify-end"
                    : "justify-center"
              }
              spacingClass={cn(
                spacingValue === "default" && "my-12",
                spacingValue === "small" && "my-6",
                spacingValue === "no top spacing" && "mb-12 mt-0",
              )}
              widthPercent={widthPercent}
            />
          ) : (
            <DividerSpacing
              spacingClass={cn(
                spacingValue === "default" && "my-12",
                spacingValue === "small" && "my-6",
                spacingValue === "no top spacing" && "mb-12 mt-0",
              )}
            />
          )}
          {!isLine && isEditing && (
            <span className="is-empty-hint">{DIVIDER_EMPTY_HINT}</span>
          )}
        </>,
        routeContainerWidth,
      )}
    </section>
  );
};
