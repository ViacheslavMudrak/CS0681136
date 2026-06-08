"use client";

import {
  JSX,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  FLOATING_ACTION_VIEWPORT_ANCHOR_Z_INDEX,
  FLOATING_ACTION_VIEWPORT_INSET_PX,
  getFloatingActionViewportInsetBottomPx,
} from "../floatingActionButtonUtils";

const FOOTER_SELECTOR = "#footer";

/**
 * Keeps the FAB fixed to the viewport but raises it when the footer scrolls into view
 * so the control does not cover the footer. `bottom` is updated synchronously on scroll/resize (no CSS transition)
 * so the button does not lag into the footer while scrolling.
 * @param props - Wrapper props.
 * @param props.children - FAB markup (already wrapped in `component` shell when applicable).
 * @returns Fixed zero-height anchor spanning the viewport width; FAB is `absolute` inside. Link margins:
 * **mobile** 16px bottom / 8px end, **tablet+** 24px/24px — {@link getFloatingActionViewportInsetBottomPx}
 * keeps footer-avoidance math aligned.
 */
export function FloatingFabFooterAwareWrap({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [bottomPx, setBottomPx] = useState(FLOATING_ACTION_VIEWPORT_INSET_PX);

  const updateBottom = useCallback(() => {
    const insetBottom = getFloatingActionViewportInsetBottomPx();
    const footer = document.querySelector<HTMLElement>(FOOTER_SELECTOR);
    if (!footer) {
      setBottomPx(insetBottom);
      return;
    }

    const footerTop = footer.getBoundingClientRect().top;
    const viewportHeight = window.innerHeight;
    const overlapPx = viewportHeight - footerTop;

    if (overlapPx <= 0) {
      setBottomPx(insetBottom);
      return;
    }

    setBottomPx(overlapPx + insetBottom);
  }, []);

  useLayoutEffect(() => {
    updateBottom();
  }, [updateBottom]);

  useEffect(() => {
    updateBottom();
    window.addEventListener("scroll", updateBottom, { passive: true });
    window.addEventListener("resize", updateBottom);
    return () => {
      window.removeEventListener("scroll", updateBottom);
      window.removeEventListener("resize", updateBottom);
    };
  }, [updateBottom]);

  /** Matches FAB `margin-bottom` for current breakpoint so the fixed anchor aligns with the pill. */
  const anchorBottomPx = Math.max(
    0,
    bottomPx - getFloatingActionViewportInsetBottomPx(),
  );

  const shellStyle: CSSProperties = {
    position: "fixed",
    zIndex: FLOATING_ACTION_VIEWPORT_ANCHOR_Z_INDEX,
    left: 0,
    right: 0,
    bottom: anchorBottomPx,
    height: 0,
    pointerEvents: "none",
    /* No transition on `bottom`: animating it lags behind scroll and the FAB overlaps the footer until the tween finishes. */
  };

  return (
    <div
      className="floating-action-viewport-anchor [body[data-nav-mobile-menu-open=true][data-nav-mobile-menu-conceal-chrome=true]_&]:invisible [body[data-nav-mobile-menu-open=true][data-nav-mobile-menu-conceal-chrome=true]_&]:pointer-events-none"
      style={shellStyle}
    >
      <div className="relative h-0 w-full pointer-events-auto">{children}</div>
    </div>
  );
}
