import type { Page } from "@sitecore-content-sdk/nextjs";

import type { ContainerWidth } from "components/shared/BaseContainer";

const ROUTE_CONTAINER_WIDTH_MAP: Record<string, ContainerWidth> = {
  sm: "sm",
  small: "sm",
  md: "md",
  medium: "md",
  lg: "lg",
  large: "lg",
  default: "default",
  divider: "divider",
  contentswitcher: "contentSwitcher",
  "content-switcher": "contentSwitcher",
  "content switcher": "contentSwitcher",
};

/**
 * Resolves route-level `ContainerWidth` into the shared container token.
 *
 * @param page - Sitecore page payload from component props.
 * @returns Normalized container width token, or undefined when route has no container width.
 */
export function getRouteContainerWidth(page: Page): ContainerWidth | undefined {
  const routeFields = page?.layout?.sitecore?.route?.fields as
    | {
        ContainerWidth?: {
          fields?: {
            Value?: { value?: string };
          };
        };
      }
    | undefined;
  const raw = routeFields?.ContainerWidth?.fields?.Value?.value;
  if (typeof raw !== "string") return undefined;
  return ROUTE_CONTAINER_WIDTH_MAP[raw.trim().toLowerCase()];
}
