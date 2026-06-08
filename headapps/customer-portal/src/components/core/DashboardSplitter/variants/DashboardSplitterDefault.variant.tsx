import type { JSX } from "react";
import {
  AppPlaceholder,
  type ComponentMap,
  type NextjsContentSdkComponent,
} from "@sitecore-content-sdk/nextjs";
import componentMap from ".sitecore/component-map";

import {
  countVisibleDashboardWidgets,
  DASHBOARD_WIDGETS_PLACEHOLDER,
  resolveDashboardSplitterGridClassName,
} from "@/lib/dashboard-splitter-layout";
import { cn } from "@/lib/utils";

import type { DashboardSplitterProps } from "../DashboardSplitter.type";

export default function DashboardSplitterDefault({
  rendering,
  page,
  params,
}: DashboardSplitterProps): JSX.Element {
  const { styles, RenderingIdentifier: id } = params;
  const componentMapTyped = componentMap as unknown as ComponentMap<NextjsContentSdkComponent>;
  const isEditing = page.mode.isEditing;
  const visibleWidgetCount = countVisibleDashboardWidgets(rendering, isEditing);
  const gridClassName = resolveDashboardSplitterGridClassName(visibleWidgetCount);

  return (
    <section
      className={`component dashboard-splitter ${styles ?? ""}`.trim()}
      id={id}
      aria-label={"Dashboard widgets"}
    >
      <div className={cn("component-content", gridClassName)}>
        <AppPlaceholder
          name={DASHBOARD_WIDGETS_PLACEHOLDER}
          rendering={rendering}
          page={page}
          componentMap={componentMapTyped}
        />
      </div>
    </section>
  );
}
