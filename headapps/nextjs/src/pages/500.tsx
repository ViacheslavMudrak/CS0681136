import Head from 'next/head';
import { SitecorePageProps, Page, ErrorPage } from '@sitecore-content-sdk/nextjs';
import Providers from 'src/Providers';
import Layout from 'src/Layout';
import { GetStaticProps } from 'next';
import scConfig from 'sitecore.config';
import client from 'lib/sitecore-client';
// @ts-ignore - import is auto generated on build
import components from '.sitecore/component-map';
import { JSX } from 'react';

/**
 * Rendered in case if we have 500 error
 */
const ServerError = (): JSX.Element => (
  <>
    <Head>
      <title>500: Server Error</title>
    </Head>
    <div style={{ padding: 10 }}>
      <h1>500 Internal Server Error</h1>
      <p>There is a problem with the resource you are looking for, and it cannot be displayed.</p>
      <a href="/">Go to the Home page</a>
    </div>
  </>
);

const Custom500 = ({ page, componentProps }: SitecorePageProps): JSX.Element => {
  if (!page) {
    return <ServerError />;
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
    page = await client.getErrorPage(ErrorPage.InternalServerError, {
      site: scConfig.defaultSite,
      locale: context.locale || context.defaultLocale || scConfig.defaultLanguage,
    });
  } catch (error) {
    console.log('Error occurred while fetching error pages');
    console.log(error);
  }

  if (page) {
    try {
      componentProps = await client.getComponentData(page.layout, context, components);
    } catch (error) {
      console.log('Error fetching component props for 500 page');
      console.log(error);
    }

    try {
      dictionary = await client.getDictionary({
        site: page.siteName,
        locale: page.locale,
      });
    } catch (error) {
      console.log('Error fetching dictionary for 500 page');
      console.log(error);
    }
  }

  return {
    props: {
      page,
      componentProps,
      dictionary,
    },
  };
};

export default Custom500;
