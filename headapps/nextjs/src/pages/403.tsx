import { JSX } from 'react';
import { GetServerSideProps } from 'next';
import Layout from 'src/Layout';
import NotFound from 'src/NotFound';
import { SitecorePageProps } from '@sitecore-content-sdk/nextjs';
import Providers from 'src/Providers';
import client from 'lib/sitecore-client';
// @ts-ignore - import is auto generated on build
import components from '.sitecore/component-map';
import { AccessDeniedProvider } from 'src/lib/contexts/AccessDeniedContext';

type Props = SitecorePageProps & {
  requestAccess?: boolean;
  returnUrl?: string;
  userEmail?: string;
};

//  Validates that returnUrl is a safe internal path
function sanitizeReturnUrl(value?: string): string {
  if (!value || typeof value !== 'string') return '';

  const sanitizedUrl = value.trim();

  if (!sanitizedUrl.startsWith('/')) return '';
  if (sanitizedUrl.startsWith('//')) return '';
  if (sanitizedUrl.includes('://')) return '';
  if (sanitizedUrl.length > 2048) return '';
  return sanitizedUrl;
}

const Custom403 = ({
  page,
  notFound,
  componentProps,
  requestAccess = false,
  returnUrl = '',
  userEmail = '',
}: Props): JSX.Element => {
  if (notFound || !page) return <NotFound />;

  return (
    <AccessDeniedProvider requestAccess={requestAccess} returnUrl={returnUrl} userEmail={userEmail}>
      <Providers page={page} componentProps={componentProps}>
        <Layout page={page} />
      </Providers>
    </AccessDeniedProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.statusCode = 403;

  // Gatekeeper passes data via request headers on the rewrite (not query params)
  // to prevent users from tampering with the values in the URL.
  const rawReturnUrl = context.req.headers['x-gk-return-url'] as string | undefined;
  const returnUrl = sanitizeReturnUrl(rawReturnUrl);

  const requestAccess = context.req.headers['x-gk-request-access'] === '1';
  const userEmail = (context.req.headers['x-gk-user-email'] as string | undefined)?.trim() ?? '';

  const page = await client.getPage('/Error/403', { locale: context.locale });

  if (!page) {
    return { notFound: true, props: {} };
  }

  return {
    props: {
      page,
      dictionary: await client.getDictionary({
        site: page.siteName,
        locale: page.locale,
      }),
      componentProps: await client.getComponentData(page.layout, context, components),
      requestAccess,
      returnUrl,
      userEmail,
    },
  };
};

export default Custom403;
