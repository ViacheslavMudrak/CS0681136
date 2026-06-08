import type { ComponentProps } from "@/lib/component-props";

/**
 * Layout rendering for the dashboard content region; datasource is optional until fields are modeled in Sitecore.
 */
export type DashboardSplitterProps = ComponentProps & {
  fields?: Record<string, unknown>;
};
