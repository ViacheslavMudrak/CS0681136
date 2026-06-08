import type { Metadata } from "next";
import { Suspense } from "react";
import { isDesignLibraryPreviewData } from "@sitecore-content-sdk/nextjs/editing";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import type { Field, ImageField, Page } from "@sitecore-content-sdk/nextjs";
import { SiteInfo } from "@sitecore-content-sdk/nextjs";
import allSites from ".sitecore/sites.json";
import { routing } from "src/i18n/routing";
import scConfig from "sitecore.config";
import client from "src/lib/sitecore-client";
import { toSitecoreLocale } from "src/lib/locale-map";
import Layout, { RouteFields } from "src/Layout";
import { coerceSitecoreLayoutParamsStylesForHeadLinks } from "src/utils/coerceSitecoreLayoutParamsStyles";
import components from ".sitecore/component-map";
import Providers from "src/Providers";
import { getLocale, getMessages, setRequestLocale } from "next-intl/server";
import { DefaultRetryStrategy } from "@sitecore-content-sdk/nextjs/client";


const DEFAULT_SITE_NAME = process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME;

/**
 * Restrict static page generation to the site configured via NEXT_PUBLIC_DEFAULT_SITE_NAME.
 * Falls back to all sites when the variable is not set.
 */
const sites = DEFAULT_SITE_NAME
  ? allSites.filter((site: SiteInfo) => site.name === DEFAULT_SITE_NAME)
  : allSites;

type PageProps = {
  params: Promise<{
    site: string;
    locale: string;
    path?: string[];
    [key: string]: string | string[] | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

interface RouteMetaFields extends RouteFields {
  MetaTitle?: Field<string>;
  MetaDescription?: Field<string>;
  MetaKeywords?: Field<string>;
  Attributes?: Field<string>;
  OpenGraphAdmins?: Field<string>;
  OpenGraphAppId?: Field<string>;
  OpenGraphDescription?: Field<string>;
  OpenGraphImageUrl?: ImageField;
  OpenGraphSiteName?: Field<string>;
  OpenGraphTitle?: Field<string>;
  OpenGraphType?: Field<string>;
  TwitterDescription?: Field<string>;
  TwitterImage?: ImageField;
  TwitterSite?: Field<string>;
  TwitterTitle?: Field<string>;
  ContentType?: Field<string>;
  FaviconIcon?: ImageField;
}

async function getSitecorePageForRoute(
  path: string[] | undefined,
  site: string,
  locale: string,
  searchParams: PageProps["searchParams"],
): Promise<Page | null | undefined> {
  const draft = await draftMode();
  if (draft.isEnabled) {
    const editingParams = await searchParams;
    if (isDesignLibraryPreviewData(editingParams)) {
      return client.getDesignLibraryData(editingParams);
    }
    return client.getPreview(editingParams);
  }
  try {
    const fetchOptions = {
      retries: 5,
      retryStrategy: new DefaultRetryStrategy({
        statusCodes: [402, 409],
        errorCodes: ['ENOTFOUND', 'ETIMEDOUT'],
        factor: 1
    })};

    return await client.getPage(path ?? [], {
      site,
      locale: toSitecoreLocale(locale),
    }, fetchOptions);
  } catch (err) {
    console.error(
      "Sitecore getPage failed",
      { site, locale, path: path ?? [] },
      err,
    );
    return undefined;
  }
}

/** Builds metadata from Sitecore route fields for App Router `generateMetadata`. */
function buildRouteMetadata(
  routeFields: RouteMetaFields | undefined,
  path: string[] | undefined,
): Metadata {
  const pageTitle = routeFields?.MetaTitle?.value?.toString().trim();
  const title =
    pageTitle || routeFields?.Title?.value?.toString().trim() || "Page";
  const src = routeFields?.FaviconIcon?.value?.src;
  const width = routeFields?.FaviconIcon?.value?.width;
  const height = routeFields?.FaviconIcon?.value?.height;
  const metaDescription = routeFields?.MetaDescription?.value
    ?.toString()
    .trim();
  const keywordValue = routeFields?.MetaKeywords?.value?.toString().trim();
  const openGraphTitle = routeFields?.OpenGraphTitle?.value?.toString().trim();
  const openGraphDescription = routeFields?.OpenGraphDescription?.value
    ?.toString()
    .trim();
  const openGraphImage = routeFields?.OpenGraphImageUrl?.value?.src
    ?.toString()
    .trim();
  const openGraphSiteName = routeFields?.OpenGraphSiteName?.value
    ?.toString()
    .trim();
  const twitterTitle = routeFields?.TwitterTitle?.value?.toString().trim();
  const twitterDescription = routeFields?.TwitterDescription?.value
    ?.toString()
    .trim();
  const twitterImage = routeFields?.TwitterImage?.value?.src?.toString().trim();
  const twitterSite = routeFields?.TwitterSite?.value?.toString().trim();
  const keywords = keywordValue
    ? keywordValue
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    : undefined;
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const pathName = `/${(path ?? []).join("/")}`.replace(/\/{2,}/g, "/");
  const canonical = publicUrl
    ? new URL(pathName, publicUrl).toString()
    : undefined;

  if (typeof src !== "string" || src.trim().length === 0) {
    return {
      title,
      description: metaDescription || undefined,
      keywords,
      alternates: canonical ? { canonical } : undefined,
      openGraph: {
        title: openGraphTitle || title,
        description: openGraphDescription || undefined,
        siteName: openGraphSiteName || undefined,
        url: canonical,
        images: openGraphImage ? [{ url: openGraphImage }] : undefined,
      },
      twitter: {
        title: twitterTitle || title,
        description: twitterDescription || undefined,
        site: twitterSite || undefined,
        images: twitterImage ? [twitterImage] : undefined,
      },
    };
  }

  const url = src.trim();
  const icon: { url: string; type?: string; sizes?: string } = { url };
  if (width && height) {
    icon.sizes = `${width}x${height}`;
  }
  const pathOnly = url.split("?")[0] ?? url;
  const ext = pathOnly.split(".").pop()?.toLowerCase();
  if (ext === "png") icon.type = "image/png";
  else if (ext === "jpg" || ext === "jpeg") icon.type = "image/jpeg";
  else if (ext === "gif") icon.type = "image/gif";
  else if (ext === "ico") icon.type = "image/x-icon";
  else if (ext === "svg") icon.type = "image/svg+xml";
  return {
    title,
    description: metaDescription || undefined,
    keywords,
    alternates: canonical ? { canonical } : undefined,
    icons: { icon: [icon] },
    openGraph: {
      title: openGraphTitle || title,
      description: openGraphDescription || metaDescription || undefined,
      siteName: openGraphSiteName || undefined,
      url: canonical,
      images: openGraphImage ? [{ url: openGraphImage }] : undefined,
    },
    twitter: {
      title: twitterTitle || title,
      description: twitterDescription || metaDescription || undefined,
      site: twitterSite || undefined,
      images: twitterImage ? [twitterImage] : undefined,
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { site, locale, path } = await params;

  // Set site and locale to be available in src/i18n/request.ts for fetching the dictionary
  setRequestLocale(`${site}_${locale}`);

  const page = await getSitecorePageForRoute(path, site, locale, searchParams);

  // If the page is not found, return a 404
  if (!page?.layout?.sitecore) {
    notFound();
  }

  /**
   * `getHeadLinks` / theme traversal calls `.match` on `params.Styles` (must be a string).
   * Droplist params arrive as objects; normalize before `getComponentData` and layout render.
   */
  coerceSitecoreLayoutParamsStylesForHeadLinks(page.layout);

  // Fetch the component data from Sitecore (Likely will be deprecated)
  const componentProps = await client.getComponentData(
    page.layout,
    {},
    components,
  );

  const [messages, intlLocale] = await Promise.all([
    getMessages(),
    getLocale(),
  ]);

  return (
    <Providers
      page={page}
      componentProps={componentProps}
      messages={messages}
      locale={intlLocale}
    >
      <Suspense fallback={null}>
        <Layout page={page} />
      </Suspense>
    </Providers>
  );
}

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const generateStaticParams = async () => {
  if (process.env.NODE_ENV !== "development" && scConfig.generateStaticPaths) {
    
    const buildLocales = [scConfig.defaultLanguage];
    
    return await client.getAppRouterStaticParams(
      sites.map((site: SiteInfo) => site.name),
      buildLocales,
    );
  }
  return [];
};

// Metadata fields for the page (title + dynamic favicon from route `FaviconIcon`).
export const generateMetadata = async ({
  params,
  searchParams,
}: PageProps): Promise<Metadata> => {
  const { path, site, locale } = await params;
  const page = await getSitecorePageForRoute(path, site, locale, searchParams);
  const routeFields = page?.layout?.sitecore?.route?.fields as
    | RouteMetaFields
    | undefined;
  return buildRouteMetadata(routeFields, path);
};
