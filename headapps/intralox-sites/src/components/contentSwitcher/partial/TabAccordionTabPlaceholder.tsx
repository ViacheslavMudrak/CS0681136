"use client";

import { Suspense, use } from "react";
import {
  AppPlaceholder,
  type ComponentMap,
  type ComponentRendering,
  type Page,
} from "@sitecore-content-sdk/nextjs";

import { patchComponentMapForContentSwitcherCallouts } from "../contentSwitcherUtils";

export interface TabAccordionTabPlaceholderProps {
  name: string;
  rendering: ComponentRendering;
  page: Page;
}

/** Dynamic import only — static component-map import causes TDZ with this module. */
const componentMapPromise = import(".sitecore/component-map").then(
  (m) => m.default,
);

function TabAccordionTabPlaceholderInner({
  name,
  rendering,
  page,
}: TabAccordionTabPlaceholderProps) {
  const componentMap = use(componentMapPromise);
  const placeholderComponentMap = patchComponentMapForContentSwitcherCallouts(
    componentMap,
  ) as ComponentMap;
  return (
    <div className="content-switcher-tab-placeholder-shell isolate box-border m-0 block w-full min-w-0 max-w-full border-0 border-t border-solid border-stroke-default bg-surface-subtle px-8 pt-8 pb-12 text-base font-normal leading-6 text-ink-primary font-media-tile antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]">
      <AppPlaceholder
        name={name}
        rendering={rendering}
        componentMap={placeholderComponentMap}
        page={page}
        disableSuspense
      />
    </div>
  );
}

export const TabAccordionTabPlaceholder = (
  props: TabAccordionTabPlaceholderProps,
) => (
  <Suspense fallback={null}>
    <TabAccordionTabPlaceholderInner {...props} />
  </Suspense>
);
