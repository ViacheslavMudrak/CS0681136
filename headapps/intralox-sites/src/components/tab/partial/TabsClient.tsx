"use client";
import { JSX, useCallback, useEffect, useRef, useState, type Key } from "react";
import { ITabFields } from "../Tabs.type";
import { IParams } from "src/utils/interface";
import { Container } from "components/shared/BaseContainer";
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  cx,
} from "@laitram-l-l-c/intralox-ui-components";
import { cn } from "lib/utils";
import { RichText } from "@sitecore-content-sdk/nextjs";
import BodyStyles from "components/shared/BodyStyle";
import { Section } from "components/shared/section/Section";

const PROGRAMMATIC_SCROLL_SUPPRESS_MS = 700;
const SECTION_TOP_TOLERANCE_PX = 8;

interface ITabsClientProps extends IParams {
  fields: ITabFields;
  isEditing: boolean;
}

function getHeaderTopPx(): number {
  const headerTopRaw = getComputedStyle(document.documentElement)
    .getPropertyValue("--headerTop")
    .trim();
  return headerTopRaw ? parseFloat(headerTopRaw) || 0 : 0;
}

/**
 * Returns the tab index for in-page sections keyed by `ComponentId`, using the same
 * offset as tab clicks. Indices are `0..tabItems.length - 1`. Returns `tabItems.length`
 * when the scroll anchor lies below the last anchored section so no tab is highlighted.
 */
function getActiveTabIndexForScroll(
  tabItems: ITabFields["TabItems"],
  scrollPadding: number,
): number {
  const anchorY = scrollPadding + SECTION_TOP_TOLERANCE_PX;
  let active = -1;
  let lastIndexWhoseTopIsAboveAnchor = -1;
  let lastAnchoredSectionBottom: number | null = null;

  for (let i = 0; i < tabItems.length; i++) {
    const rawId = tabItems[i]?.fields?.ComponentId?.value;
    if (!rawId) continue;
    const id = rawId.toLowerCase();
    const el = document.getElementById(id);
    if (!el) continue;
    const { top, bottom } = el.getBoundingClientRect();
    lastAnchoredSectionBottom = bottom;
    if (top <= anchorY) {
      lastIndexWhoseTopIsAboveAnchor = i;
    }
    if (top <= anchorY && bottom >= anchorY) {
      active = i;
    }
  }

  if (active !== -1) return active;
  if (
    lastAnchoredSectionBottom !== null &&
    anchorY > lastAnchoredSectionBottom
  ) {
    return tabItems.length;
  }
  if (lastIndexWhoseTopIsAboveAnchor !== -1) {
    return lastIndexWhoseTopIsAboveAnchor;
  }
  return 0;
}

const TabsClientBase = ({
  fields,
  params,
  isEditing,
}: ITabsClientProps): JSX.Element => {
  const [selectedKey, setSelectedKey] = useState("tab-0");
  const tabsRef = useRef<HTMLDivElement>(null);
  const programmaticScrollUntilRef = useRef(0);
  const isSticky = fields.TabItems.some((tab) => tab.fields.ComponentId.value);

  useEffect(() => {
    const hasAnchors = fields.TabItems.some((t) => t.fields.ComponentId?.value);
    if (!hasAnchors) return;

    const applyActiveFromScroll = () => {
      if (Date.now() < programmaticScrollUntilRef.current) return;
      const tabsHeightPx = tabsRef.current?.clientHeight ?? 0;
      const scrollPadding = getHeaderTopPx() + tabsHeightPx + 20;
      const nextIndex = getActiveTabIndexForScroll(
        fields.TabItems,
        scrollPadding,
      );
      const nextKey = `tab-${nextIndex}`;
      setSelectedKey((prev) => (prev === nextKey ? prev : nextKey));
    };

    let rafId = 0;
    const onScrollOrResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(applyActiveFromScroll);
    };

    applyActiveFromScroll();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [fields.TabItems]);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1).toLowerCase();
      if (!hash) return;
      const idx = fields.TabItems.findIndex(
        (t) => t.fields.ComponentId?.value?.toLowerCase() === hash,
      );
      if (idx >= 0) setSelectedKey(`tab-${idx}`);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [fields.TabItems]);

  const scrollToAnchoredSection = useCallback(
    (sectionId: string, tabIndex: number) => {
      if (!sectionId) return;
      const targetElement = document.getElementById(sectionId);
      if (!targetElement) return;

      setSelectedKey(`tab-${tabIndex}`);
      const headerTopPx = getHeaderTopPx();
      const tabsHeightPx = tabsRef.current?.clientHeight ?? 0;
      const scrollPadding = headerTopPx + tabsHeightPx - 20;
      const elementTop =
        targetElement.getBoundingClientRect().top + window.scrollY;

      programmaticScrollUntilRef.current =
        Date.now() + PROGRAMMATIC_SCROLL_SUPPRESS_MS;
      window.scrollTo({
        top: Math.max(0, elementTop - scrollPadding),
        behavior: "smooth",
      });

      if (typeof window !== "undefined" && window.history?.replaceState) {
        const nextUrl = `${window.location.pathname}${window.location.search}#${sectionId}`;
        window.history.replaceState(null, "", nextUrl);
      }
    },
    [],
  );

  const handleSelectionChange = useCallback(
    (key: Key) => {
      const keyStr = String(key);
      setSelectedKey(keyStr);
      const match = /^tab-(\d+)$/.exec(keyStr);
      if (!match) return;
      const tabIndex = Number.parseInt(match[1], 10);
      const sectionId =
        fields.TabItems[tabIndex]?.fields?.ComponentId?.value?.toLowerCase();
      if (sectionId) {
        scrollToAnchoredSection(sectionId, tabIndex);
      }
    },
    [fields.TabItems, scrollToAnchoredSection],
  );

  return (
    <Section
      className={cn(
        "w-full",
        isSticky && "sticky bg-surface z-99",
        isSticky && !isEditing && "top-[var(--headerTop)]",
        isSticky && isEditing && "top-0",
      )}
      removeBottomPadding={isSticky}
      removeTopPadding={isSticky}
      id={params.renderingId}
    >
      <Container width="lg">
        <Tabs
          ref={tabsRef}
          selectedKey={selectedKey}
          onSelectionChange={handleSelectionChange}
        >
          <TabList className="flex flex-wrap">
            {fields.TabItems.map((tab, index) => (
              <Tab
                key={index}
                id={`tab-${index}`}
                className={cn(
                  "tabList shrink-0 text-sm border-b-3px text-ink-secondary tracking-wide font-normal hover:border-stroke-default",
                  selectedKey === `tab-${index}` ? " selectedTab" : "",
                )}
              >
                <span>{tab.fields.Title.value}</span>
              </Tab>
            ))}
          </TabList>
          {!isSticky &&
            fields.TabItems.map((tab, index) => (
              <TabPanel key={index} id={`tab-${index}`} className="pt-0">
                {tab.fields.ComponentId?.value ? null : (
                  <BodyStyles
                    contrast={false}
                    colorScheme="gray"
                    className="w-full normal"
                  >
                    <RichText
                      className="text-ink-primary pt-5"
                      field={tab.fields.Description}
                    />
                  </BodyStyles>
                )}
              </TabPanel>
            ))}
        </Tabs>
      </Container>
    </Section>
  );
};

export const TabsClient = TabsClientBase;
