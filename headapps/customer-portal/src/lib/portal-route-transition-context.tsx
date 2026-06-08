"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type PortalRouteTransitionContextValue = {
  isContentPending: boolean;
  beginContentTransition: () => void;
};

/** True when the user opens the link in a new tab/window (current document stays put). */
export function isAuxiliaryNavigationClick(
  event: Pick<MouseEvent, "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">
): boolean {
  return (
    event.button === 1 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

const PortalRouteTransitionContext = createContext<PortalRouteTransitionContextValue | undefined>(
  undefined
);

export function PortalRouteTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const prevPathnameRef = useRef(pathname);

  useLayoutEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setPending(false);
    }
  }, [pathname]);

  const beginContentTransition = useCallback(() => {
    setPending(true);
  }, []);

  const value = useMemo<PortalRouteTransitionContextValue>(
    () => ({
      isContentPending: pending,
      beginContentTransition,
    }),
    [pending, beginContentTransition]
  );

  return (
    <PortalRouteTransitionContext.Provider value={value}>
      {children}
    </PortalRouteTransitionContext.Provider>
  );
}

export function usePortalRouteTransitionOptional(): PortalRouteTransitionContextValue | null {
  return useContext(PortalRouteTransitionContext) ?? null;
}
