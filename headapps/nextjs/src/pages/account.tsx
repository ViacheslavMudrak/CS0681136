import { JSX } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { SitecorePageProps } from '@sitecore-content-sdk/nextjs';
import Providers from 'src/Providers';
import { extractPath } from '@sitecore-content-sdk/nextjs/utils';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
// @ts-ignore - import is auto generated on build
import components from '.sitecore/component-map';
import Layout from 'src/Layout';
import NotFound from 'src/NotFound';
import client from 'lib/sitecore-client';
import { authOptions } from './api/auth/[...nextauth]';
import { GoogleProfileProvider } from 'lib/contexts/GoogleProfileContext';
import type { GoogleProfileData } from 'ts/google';

interface AccountPageProps extends SitecorePageProps {
  googleProfile: GoogleProfileData | null;
}

const AccountPage = ({ page, componentProps, googleProfile }: AccountPageProps): JSX.Element => {
  if (!page) {
    return <NotFound />;
  }

  return (
    <GoogleProfileProvider profile={googleProfile}>
      <Providers page={page} componentProps={componentProps}>
        <Layout page={page} />
      </Providers>
    </GoogleProfileProvider>
  );
};

export default AccountPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;
  const path = extractPath(context);

  let page;

  if (context.preview && isDesignLibraryPreviewData(context.previewData)) {
    page = await client.getDesignLibraryData(context.previewData);
  } else {
    page = context.preview
      ? await client.getPreview(context.previewData)
      : await client.getPage(path, { locale: context.locale });
  }

  if (!page) {
    return { notFound: true };
  }

  const [dictionary, componentProps, session] = await Promise.all([
    client.getDictionary({ site: page.siteName, locale: page.locale }),
    client.getComponentData(page.layout, context, components),
    getServerSession(req, res, authOptions),
  ]);

  // googleProfile is already resolved and cached on the session by NextAuth
  const googleProfile = session?.googleProfile ?? null;

  return {
    props: {
      page,
      dictionary,
      componentProps,
      googleProfile,
    },
  };
};
