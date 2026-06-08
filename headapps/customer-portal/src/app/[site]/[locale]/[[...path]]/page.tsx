/* eslint-disable @typescript-eslint/no-require-imports */
import type { Metadata } from "next";
import { ComponentMap, NextjsContentSdkComponent, SiteInfo } from "@sitecore-content-sdk/nextjs";
import { isDesignLibraryPreviewData } from "@sitecore-content-sdk/nextjs/editing";
import { setRequestLocale } from "next-intl/server";
import { draftMode } from "next/headers";
import { notFound, redirect } from "next/navigation";
import scConfig from "sitecore.config";
import { routing } from "src/i18n/routing";
import Layout, { RouteFields } from "src/Layout";
import client from "src/lib/sitecore-client";
import { getCachedPage } from "src/lib/sitecore-page";
import { isOrdersManagementOrderDetailPathSegments } from "src/lib/order-detail-entry-point";
import { isOrdersManagementQuoteDetailPathSegments } from "src/lib/quote-detail-entry-point";
import { resolveSitecoreGetPageSegments } from "src/lib/sitecoreWildcardPath";
import Providers from "src/Providers";

const isSitecoreConfigured = (() => {
  let result: boolean | null = null;
  return () => {
    if (result === null) {
      const hasEdge = !!(scConfig.api.edge?.contextId || scConfig.api.edge?.clientContextId);
      const hasLocal = !!(scConfig.api.local?.apiKey && scConfig.api.local?.apiHost);
      result = hasEdge || hasLocal;
    }
    return result;
  };
})();

let _initialized = false;
let sites: SiteInfo[] = [];
let components: Record<string, unknown> = {};
let componentMap: ComponentMap<NextjsContentSdkComponent> | null = null;

function init() {
  if (_initialized) return;
  _initialized = true;

  if (!isSitecoreConfigured()) return;

  try {
    sites = require(".sitecore/sites.json");
    components = require(".sitecore/component-map");
    componentMap = new Map(
      Object.entries(components)
    ) as unknown as ComponentMap<NextjsContentSdkComponent>;
  } catch {
    sites = [];
    components = {};
    componentMap = null;
  }
}

// Run eagerly at module load time (happens once on cold start)
init();

type PageProps = {
  params: Promise<{
    site: string;
    locale: string;
    path?: string[];
    [key: string]: string | string[] | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const revalidate = 300;

export default async function Page({ params, searchParams }: PageProps) {
  if (!isSitecoreConfigured()) {
    redirect("/");
  }

  const [{ site, locale, path }, draft] = await Promise.all([params, draftMode()]);

  const nonSitecoreRoutes = ["dashboard", "authorization"];
  const pathString = path?.join("/") || "";

  if (nonSitecoreRoutes.includes(site)) {
    redirect(`/${site}${pathString ? `/${pathString}` : ""}`);
  }

  if (
    nonSitecoreRoutes.includes(pathString) ||
    nonSitecoreRoutes.some((route) => pathString.startsWith(route + "/"))
  ) {
    redirect(`/${pathString}`);
  }

  if (pathString === "reset" && !draft.isEnabled) {
    redirect(`/reset-password`);
  }

  setRequestLocale(`${site}_${locale}`);

  const sitecorePath = resolveSitecoreGetPageSegments(path);

  let page;
  if (draft.isEnabled) {
    const editingParams = await searchParams;
    if (isDesignLibraryPreviewData(editingParams)) {
      page = await client.getDesignLibraryData(editingParams);
    } else {
      page = await client.getPreview({ ...editingParams, path: sitecorePath });
    }
  } else {
    page = await getCachedPage(sitecorePath, { site, locale });
  }

  if (!page) {
    notFound();
  }

  let componentProps = {};
  if (client && componentMap && typeof client.getComponentData === "function") {
    try {
      componentProps = await client.getComponentData(page.layout, {}, componentMap);
    } catch (error) {
      console.warn("getComponentData failed, using empty props:", error);
    }
  }

  return (
    <Providers page={page} componentProps={componentProps}>
      <Layout page={page} />
    </Providers>
  );
}

export const generateStaticParams = async () => {
  if (!isSitecoreConfigured()) return [];

  if (process.env.NODE_ENV !== "development" && scConfig.generateStaticPaths) {
    return await client.getAppRouterStaticParams(
      sites.map((site: SiteInfo) => site.name),
      routing.locales.slice()
    );
  }
  return [];
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const SITE_SUFFIX = "Intralox Customer Portal";

  if (!isSitecoreConfigured()) {
    return { title: "Customer Portal" };
  }

  const { path, site, locale } = await params;

  if (isOrdersManagementOrderDetailPathSegments(path)) {
    return { title: `Order details | ${SITE_SUFFIX}` };
  }
  if (isOrdersManagementQuoteDetailPathSegments(path)) {
    return { title: `Quote details | ${SITE_SUFFIX}` };
  }

  const sitecorePath = resolveSitecoreGetPageSegments(path);

  const page = await getCachedPage(sitecorePath, { site, locale });

  let title =
    (page?.layout.sitecore.route?.fields as RouteFields)?.Title?.value?.toString() || "Page";

  if (title === "*" && Array.isArray(path) && path.length > 0) {
    title = path[path.length - 1] ?? title;
  }

  return {
    title: `${title || "Page"} | ${SITE_SUFFIX}`,
  };
};
