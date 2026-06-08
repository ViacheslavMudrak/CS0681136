import { JSX, type ReactNode } from "react";

import { Text } from "@sitecore-content-sdk/nextjs";
import { FAB_ICON_SIZE_CLASS, renderChromeIconFromFaClass } from 'lib/chrome-icons';

import type { FloatingActionButtonPillProps } from "../FloatingActionButton.type";

const LAYOUT_FAB_ID = "layout-floating-action-button";

/**
 * Inner row: icon + stacked Sitecore text fields (outer border/shadow/padding live on the link).
 * @param props - Field refs, resolved icon, and per-line visibility flags.
 * @returns Non-interactive inner layout for the FAB control surface.
 */
export function FloatingActionButtonPill({
  headingField,
  textField,
  iconResolved,
  showHeading,
  showText,
  showIcon,
}: FloatingActionButtonPillProps): JSX.Element {
  const iconGlyph = iconResolved
    ? renderChromeIconFromFaClass(iconResolved.className, FAB_ICON_SIZE_CLASS)
    : null;

  return (
    <span className="flex h-full min-h-0 max-h-full w-full min-w-0 items-center overflow-hidden [text-decoration-line:none]">
      {showIcon ? (
        <span
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-full layout-mobile:h-8 layout-mobile:w-8 tablet-only:h-8 tablet-only:w-8 mb-0 ml-0 mr-2 mt-0 box-border border-0 border-solid border-stroke-default p-0 bg-neutral-200 text-font-media-tile-eyebrow text-ink-muted layout-mobile:antialiased layout-mobile:pointer-events-auto [&_svg]:block [&_svg]:h-[18px] [&_svg]:w-[18px] tablet-only:[&_svg]:h-[18px] tablet-only:[&_svg]:w-[18px] tablet-up:[&_svg]:h-6 tablet-up:[&_svg]:w-6 tablet-up:leading-none tablet-up:[&_svg]:leading-none cursor-pointer [-webkit-tap-highlight-color:transparent]"
          aria-hidden
        >
          {iconGlyph}
        </span>
      ) : null}
      <span className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0 self-center text-left [text-decoration-line:none] [&>div]:m-0 [&>div]:p-0 [&_p]:m-0 [&_p]:mb-0 [&_p]:mt-0 [&_p]:p-0 [&_span]:m-0 [&_span]:mb-0 [&_span]:mt-0 [&_span]:p-0">
        {showHeading && headingField ? (
          <Text
            field={headingField}
            tag="span"
            className="box-border m-0 block w-full min-w-0 max-w-[213px] p-0 layout-mobile:w-[178px] layout-mobile:antialiased layout-mobile:border-0 layout-mobile:border-solid layout-mobile:border-stroke-default tablet-only:max-w-[229px] break-words text-left text-font-media-tile-eyebrow font-bold leading-font-media-tile-eyebrow text-accent-cyan [unicode-bidi:isolate] cursor-pointer [-webkit-tap-highlight-color:transparent]"
          />
        ) : null}
        {showText && textField ? (
          <Text
            field={textField}
            tag="span"
            className="box-border m-0 block w-full min-w-0 max-w-[213px] p-0 layout-mobile:w-[178px] layout-mobile:antialiased layout-mobile:border-0 layout-mobile:border-solid layout-mobile:border-stroke-default tablet-only:max-w-[229px] break-words text-left text-font-media-tile-eyebrow font-bold leading-font-media-tile-eyebrow text-ink-primary [unicode-bidi:isolate] cursor-pointer [-webkit-tap-highlight-color:transparent]"
          />
        ) : null}
      </span>
    </span>
  );
}

/**
 * Standard Sitecore wrapper for the layout FAB (no SXA padding bleed on fixed control).
 * @param children - Link, grouping div, or authoring hint.
 * @returns Wrapped markup with `component` / `component-content` structure.
 */
export function FabComponentShell({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="component floating-action-button m-0! max-w-none! p-0! [display:contents]" id={LAYOUT_FAB_ID}>
      <div className="component-content m-0! p-0! [display:contents]">{children}</div>
    </div>
  );
}
