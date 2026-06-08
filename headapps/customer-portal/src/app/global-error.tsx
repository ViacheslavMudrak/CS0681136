"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ErrorPage, Page } from "@sitecore-content-sdk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import client from "lib/sitecore-client";
import scConfig from "sitecore.config";
import AuthShellProviders from "src/AuthShellProviders";
import Layout from "src/Layout";
import { SitecoreProviders } from "src/SitecoreProviders";

export default function GlobalError() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadErrorPage() {
      try {
        const page = await client.getErrorPage(ErrorPage.InternalServerError, {
          site: scConfig.defaultSite,
          locale: scConfig.defaultLanguage,
        });
        setPage(page);
      } catch {
        setPage(null);
      }

      setLoading(false);
    }

    loadErrorPage();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

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

  return (
    <div style={{ padding: 10 }}>
      <h1>500 Internal Server Error</h1>
      <p>There is a problem with the resource you are looking for, and it cannot be displayed.</p>
      <Link href="/">Go to the Home page</Link>
    </div>
  );
}
