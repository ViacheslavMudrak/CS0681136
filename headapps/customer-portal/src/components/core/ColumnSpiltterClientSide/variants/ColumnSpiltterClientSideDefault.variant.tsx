"use client";
import type { JSX } from "react";
import {
  AppPlaceholder,
  type ComponentMap,
  type NextjsContentSdkComponent,
} from "@sitecore-content-sdk/nextjs";
import componentMap from ".sitecore/component-map";

import {
  COLUMN_SPLITTER_LEFT_PLACEHOLDER,
  COLUMN_SPLITTER_RIGHT_PLACEHOLDER,
  countVisibleColumnSplitterSides,
  isColumnSplitterSideVisible,
  resolveColumnSplitterGridClassName,
} from "@/lib/column-splitter-layout";
import { cn } from "@/lib/utils";

import type { ColumnSpiltterClientSideProps } from "../ColumnSpiltterClientSide.type";

export default function ColumnSpiltterClientSideDefault({
  rendering,
  page,
  params,
}: ColumnSpiltterClientSideProps): JSX.Element {
  const { RenderingIdentifier: id } = params;
  const componentMapTyped = componentMap as unknown as ComponentMap<NextjsContentSdkComponent>;
  const isEditing = page.mode.isEditing;
  const leftVisible = isColumnSplitterSideVisible(
    rendering,
    COLUMN_SPLITTER_LEFT_PLACEHOLDER,
    isEditing
  );
  const rightVisible = isColumnSplitterSideVisible(
    rendering,
    COLUMN_SPLITTER_RIGHT_PLACEHOLDER,
    isEditing
  );
  const visibleSideCount = countVisibleColumnSplitterSides(rendering, isEditing);
  const gridClassName = resolveColumnSplitterGridClassName(visibleSideCount);

  return (
    <div
      id={id}
      aria-label={"Column content"}
      className={cn("component-content", gridClassName)}
    >
      {leftVisible ? (
        <div className="flex w-full min-w-0">
          <AppPlaceholder
            name={COLUMN_SPLITTER_LEFT_PLACEHOLDER}
            rendering={rendering}
            page={page}
            componentMap={componentMapTyped}
          />
        </div>
      ) : null}

      {rightVisible ? (
        <div className="flex w-full min-w-0">
          <AppPlaceholder
            name={COLUMN_SPLITTER_RIGHT_PLACEHOLDER}
            rendering={rendering}
            page={page}
            componentMap={componentMapTyped}
          />
        </div>
      ) : null}
    </div>
  );
}
