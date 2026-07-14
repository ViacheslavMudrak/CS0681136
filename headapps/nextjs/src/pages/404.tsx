import { SitecorePageProps, ErrorPage, Page } from '@sitecore-content-sdk/nextjs';
import NotFound from 'src/NotFound';
import Layout from 'src/Layout';
import { GetStaticProps } from 'next';
import scConfig from 'sitecore.config';
import client from 'lib/sitecore-client';
// @ts-ignore - import is auto generated on build
import components from '.sitecore/component-map';
import { JSX } from 'react';
import Providers from 'src/Providers';
import { log } from 'src/util/helpers/log-helper';
import { getPageRevalidationInterval } from 'src/util/helpers/revalidation-helper';

const COMPONENT = '404';

const Custom404 = ({ page, componentProps }: SitecorePageProps): JSX.Element => {
  if (!page) {
    return <NotFound />;
  }

  return (
    <Providers page={page} componentProps={componentProps}>
      <Layout page={page} />
    </Providers>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  let page: Page | null = null;
  let componentProps = {};
  let dictionary = {};

  try {
    page = await client.getErrorPage(ErrorPage.NotFound, {
      site: scConfig.defaultSite,
      locale: context.locale || context.defaultLocale || scConfig.defaultLanguage,
    });
  } catch (error) {
    log('ERROR', COMPONENT, 'Failed to fetch error page from Sitecore', { error: String(error) });
  }

  if (page) {
    try {
      componentProps = await client.getComponentData(page.layout, context, components);
    } catch (error) {
      log('ERROR', COMPONENT, 'Failed to fetch component props for 404 page', {
        error: String(error),
      });
    }

    try {
      dictionary = await client.getDictionary({
        site: page.siteName,
        locale: page.locale,
      });
    } catch (error) {
      log('ERROR', COMPONENT, 'Failed to fetch dictionary for 404 page', {
        error: String(error),
      });
    }
  } else {
    log('ERROR', COMPONENT, 'No 404 error page returned from Sitecore — falling back to NotFound');
  }

  const revalidate = getPageRevalidationInterval(page, 480);

  return {
    props: {
      page,
      componentProps,
      dictionary,
    },
    ...(revalidate !== undefined && { revalidate }),
  };
};

export default Custom404;
