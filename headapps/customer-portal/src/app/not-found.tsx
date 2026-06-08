import Link from "next/link";
import { ErrorPage } from "@sitecore-content-sdk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import client from "lib/sitecore-client";
import scConfig from "sitecore.config";
import AuthShellProviders from "src/AuthShellProviders";
import Layout from "src/Layout";
import { SitecoreProviders } from "src/SitecoreProviders";

export default async function NotFound() {
  if (scConfig.defaultSite) {
    const page = await client.getErrorPage(ErrorPage.NotFound, {
      site: scConfig.defaultSite,
      locale: scConfig.defaultLanguage,
    });

    if (page) {
      return (
        <NextIntlClientProvider>
          <AuthShellProviders>
            <SitecoreProviders page={page}>
              <Layout page={page} />
            </SitecoreProviders>
          </AuthShellProviders>
        </NextIntlClientProvider>
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
