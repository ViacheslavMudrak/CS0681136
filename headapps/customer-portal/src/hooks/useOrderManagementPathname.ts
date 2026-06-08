"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { ORDER_MANAGEMENT_SEARCH_PARAMS_SYNC_EVENT } from "@/lib/orderManagementTabNavigation";

/** @deprecated Pathname sync is handled by Next.js `usePathname()` after navigation. */
export const ORDER_MANAGEMENT_PATHNAME_SYNC_EVENT = "order-management-pathname-sync";

export { ORDER_MANAGEMENT_SEARCH_PARAMS_SYNC_EVENT } from "@/lib/orderManagementTabNavigation";

export function useOrderManagementLocationSearch(): string {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const notify = () => onStoreChange();
      window.addEventListener("popstate", notify);
      window.addEventListener(ORDER_MANAGEMENT_PATHNAME_SYNC_EVENT, notify);
      window.addEventListener(ORDER_MANAGEMENT_SEARCH_PARAMS_SYNC_EVENT, notify);
      return () => {
        window.removeEventListener("popstate", notify);
        window.removeEventListener(ORDER_MANAGEMENT_PATHNAME_SYNC_EVENT, notify);
        window.removeEventListener(ORDER_MANAGEMENT_SEARCH_PARAMS_SYNC_EVENT, notify);
      };
    },
    () => window.location.search,
    () => ""
  );
}

/** Tab routing and API calls should follow Next.js pathname (after route commit). */
export function useOrderManagementPathname(): string {
  return usePathname();
}
