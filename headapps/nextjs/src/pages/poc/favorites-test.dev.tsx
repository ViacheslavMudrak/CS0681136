import { SitecorePageProps } from '@sitecore-content-sdk/nextjs';
import Providers from 'src/Providers';
import MyFavorites from 'components/IntranetComponents/MyFavorites/MyFavorites';
import type { MyFavoritesProps } from 'components/IntranetComponents/MyFavorites/MyFavorites.types';
import client from 'lib/sitecore-client';
import { GetServerSideProps } from 'next';
import { JSX } from 'react';
import Layout from 'src/Layout';

import { extractPath } from '@sitecore-content-sdk/nextjs/utils';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import type { ComponentRendering } from '@sitecore-content-sdk/nextjs';

// @ts-ignore - import is auto generated on build
import components from '.sitecore/component-map';

const mockRendering: ComponentRendering = {
  componentName: 'MyFavorites',
  dataSource: 'mock-datasource-id',
  placeholders: {},
  params: {},
};

export const mockMyFavoritesProps: MyFavoritesProps = {
  params: {},
  rendering: mockRendering,
  stylesSXA: '',

  fields: {
    title: { value: 'My Favorites' },
    seeAllFavoritesLinkText: { value: 'See all favorites' },
    addFavoriteIcon: { value: 'FavoriteBorderOutlined' },
    addFavoriteIcon_hover: { value: 'FavoriteOutlined' },
    addFavoriteText: { value: 'Add a Favorite' },
    defaultFavorites: {},
  },
};

const FavoritesTestPage = ({ page, componentProps }: SitecorePageProps): JSX.Element => {
  if (!page) {
    return <div>No page data</div>;
  }

  const pageContent = <MyFavorites {...mockMyFavoritesProps} />;

  return (
    <Providers page={page} componentProps={componentProps}>
      <Layout page={page} mainReplacementChildren={pageContent} />
    </Providers>
  );
};

export default FavoritesTestPage;
// This function gets called at request time on server-side.
export const getServerSideProps: GetServerSideProps = async (context) => {
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
  return {
    props,
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    notFound: !page,
  };
};
