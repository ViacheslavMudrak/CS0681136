import Link from 'next/link';
import { headers } from 'next/headers';
import { ErrorPage } from '@sitecore-content-sdk/nextjs';
import { parseRewriteHeader } from '@sitecore-content-sdk/nextjs/utils';
import client from 'lib/sitecore-client';
import scConfig from 'sitecore.config';
import Layout from 'src/Layout';
import Providers from 'src/Providers';
import { getLocale, getMessages, setRequestLocale } from 'next-intl/server';

export default async function NotFound() {
  const headersList = await headers();
  const { site, locale } = parseRewriteHeader(headersList);
  const resolvedSite = site || scConfig.defaultSite;
  const resolvedLocale = locale || scConfig.defaultLanguage;

  setRequestLocale(`${resolvedSite}_${resolvedLocale}`);

  const page = await client.getErrorPage(ErrorPage.NotFound, {
    site: resolvedSite,
    locale: resolvedLocale,
  });

  if (page) {
    const [messages, intlLocale] = await Promise.all([getMessages(), getLocale()]);
    return (
      <Providers page={page} messages={messages} locale={intlLocale}>
        <Layout page={page} />
      </Providers>
    );
  }

  return (
    <div style={{ padding: 10 }}>
      <h1>Page not found</h1>
      <p>This page does not exist.</p>
      <Link href="/">Go to the Home page</Link>
    </div>
  );
}
