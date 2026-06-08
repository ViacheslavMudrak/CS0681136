import type { ComponentProps } from "@/lib/component-props";

/**
 * Loading rendering for the client column splitter; datasource / fields optional until modeled in Sitecore.
 */
export type ColumnSpiltterClientSideProps = ComponentProps & {
  fields?: Record<string, unknown>;
};
