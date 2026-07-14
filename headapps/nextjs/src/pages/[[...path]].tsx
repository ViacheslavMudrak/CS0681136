import { useEffect, JSX } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
// @ts-ignore - import is auto generated on build
import sites from '.sitecore/sites.json';
import NotFound from 'src/NotFound';
import Layout from 'src/Layout';
import { SitecorePageProps, StaticPath, SiteInfo } from '@sitecore-content-sdk/nextjs';
import Providers from 'src/Providers';
import { extractPath, handleEditorFastRefresh } from '@sitecore-content-sdk/nextjs/utils';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import client from 'lib/sitecore-client';
// @ts-ignore - import is auto generated on build
import components from '.sitecore/component-map';
import scConfig from 'sitecore.config';
import { getPageRevalidationInterval } from 'src/util/helpers/revalidation-helper';

const SitecorePage = ({ page, notFound, componentProps }: SitecorePageProps): JSX.Element => {
  useEffect(() => {
    // Since Sitecore Editor does not support Fast Refresh, need to refresh editor chromes after Fast Refresh finished
    handleEditorFastRefresh();
  }, []);

  if (notFound || !page) {
    // Shouldn't hit this (as long as 'notFound' is being returned below), but just to be safe
    return <NotFound />;
  }

  return (
    <Providers page={page} componentProps={componentProps}>
      <Layout page={page} />
    </Providers>
  );
};

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const getStaticPaths: GetStaticPaths = async (context) => {
  // Fallback, along with revalidate in getStaticProps (below),
  // enables Incremental Static Regeneration. This allows us to
  // leave certain (or all) paths empty if desired and static pages
  // will be generated on request (development mode in this example).
  // Alternatively, the entire sitemap could be pre-rendered
  // ahead of time (non-development mode in this example).
  // See https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration

  let paths: StaticPath[] = [];
  let fallback: boolean | 'blocking' = 'blocking';

  if (process.env.NODE_ENV !== 'development' && scConfig.generateStaticPaths) {
    try {
      paths = await client.getPagePaths(
        sites.map((site: SiteInfo) => site.name),
        context?.locales || []
      );
    } catch (error) {
      console.log('Error occurred while fetching static paths');
      console.log(error);
    }

    // Filter to only return children and grandchildren for now
    paths = paths.filter((path) => {
      const pathSegments = path.params?.path || [];
      return pathSegments.length <= 3;
    });

    fallback = process.env.EXPORT_MODE ? false : fallback;
  }

  return {
    paths,
    fallback,
  };
};

// This function gets called at build time and on-demand (ISR) when revalidating.
// With revalidate: 30, pages are regenerated at most once every 30 seconds.
export const getStaticProps: GetStaticProps = async (context) => {
  let props = {};
  const path = extractPath(context);

  let page;

  if (context.preview && isDesignLibraryPreviewData(context.previewData)) {
    page = await client.getDesignLibraryData(context.previewData);
  } else {
    page = context.preview
      ? await client.getPreview(context.previewData)
      : await client.getPage(path, { locale: context.locale });
  }
  if (page) {
    props = {
      page,
      dictionary: await client.getDictionary({
        site: page.siteName,
        locale: page.locale,
      }),
      componentProps: await client.getComponentData(page.layout, context, components),
    };
  }

  const revalidate = getPageRevalidationInterval(page, 480);

  return {
    props,
    ...(revalidate !== undefined && { revalidate }),
    notFound: !page,
  };
};

export default SitecorePage;
