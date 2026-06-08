"use client";

import type { Environment } from "@sitecore-search/data";
import { WidgetsProvider } from "@sitecore-search/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

const SEARCH_ENVS: readonly Environment[] = ["prod", "prodEu", "apse2"];

function resolveSearchEnv(raw: string | undefined): Environment {
  if (raw && SEARCH_ENVS.includes(raw as Environment)) {
    return raw as Environment;
  }
  return "prod";
}

/**
 * Provides TanStack Query + Sitecore Search credentials for `@sitecore-search/react` widgets site-wide.
 * When API keys are missing, only a minimal {@link QueryClientProvider} is used so the app still renders;
 * search widgets require {@link WidgetsProvider} — set `NEXT_PUBLIC_SEARCH_*` variables from CEC.
 */
export default function SitecoreSearchProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [fallbackClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const apiKey = process.env.NEXT_PUBLIC_SEARCH_API_KEY ?? "";
  const customerKey = process.env.NEXT_PUBLIC_SEARCH_CUSTOMER_KEY ?? "";
  if (!apiKey || !customerKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Sitecore Search] Set NEXT_PUBLIC_SEARCH_API_KEY and NEXT_PUBLIC_SEARCH_CUSTOMER_KEY (from CEC) for search widget API requests.",
      );
    }
    return (
      <QueryClientProvider client={fallbackClient}>
        {children}
      </QueryClientProvider>
    );
  }

  const env = resolveSearchEnv(process.env.NEXT_PUBLIC_SEARCH_ENV);
  const serviceHost = process.env.NEXT_PUBLIC_SEARCH_SERVICE_HOST || undefined;
  const uri = process.env.NEXT_PUBLIC_SEARCH_URI || undefined;

  return (
    <WidgetsProvider
      apiKey={apiKey}
      customerKey={customerKey}
      debug={process.env.NEXT_PUBLIC_SEARCH_DEBUG === "true"}
      env={env}
      publicSuffix={process.env.NEXT_PUBLIC_SEARCH_PUBLIC_SUFFIX === "true"}
      serviceHost={serviceHost}
      uri={uri}
      useToken={process.env.NEXT_PUBLIC_SEARCH_USE_TOKEN !== "false"}
    >
      {children}
    </WidgetsProvider>
  );
}
