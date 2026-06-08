import Link from 'next/link';
import { ErrorPage } from '@sitecore-content-sdk/nextjs';
import { getLocale, getMessages, setRequestLocale } from 'next-intl/server';
import client from 'lib/sitecore-client';
import scConfig from 'sitecore.config';
import Layout from 'src/Layout';
import Providers from 'src/Providers';

export default async function NotFound() {
  if (scConfig.defaultSite) {
    const locale = scConfig.defaultLanguage ?? 'en';
    setRequestLocale(`${scConfig.defaultSite}_${locale}`);

    const page = await client.getErrorPage(ErrorPage.NotFound, {
      site: scConfig.defaultSite,
      locale,
    });

    if (page) {
      const [messages, intlLocale] = await Promise.all([getMessages(), getLocale()]);
      return (
        <Providers page={page} messages={messages} locale={intlLocale}>
          <Layout page={page} />
        </Providers>
      );
    }
  }

  return (
    <div style={{ padding: 10 }}>
      <h1>Page not found</h1>
      <p>This page does not exist.</p>
      <Link href="/">Go to the Home page</Link>
    </div>
  );
}
