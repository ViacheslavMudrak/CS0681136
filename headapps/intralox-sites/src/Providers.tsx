"use client";
import React from "react";
import {
  ComponentPropsCollection,
  ComponentPropsContext,
  Page,
  SitecoreProvider,
} from "@sitecore-content-sdk/nextjs";
import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import scConfig from "sitecore.config";
import components from ".sitecore/component-map.client";
import SitecoreSearchProvider from "src/SitecoreSearchProvider";

export default function Providers({
  children,
  page,
  componentProps = {},
  messages,
  locale,
}: {
  children: React.ReactNode;
  page: Page;
  componentProps?: ComponentPropsCollection;
  messages: AbstractIntlMessages;
  locale: string;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SitecoreProvider
        api={scConfig.api}
        componentMap={components}
        page={page}
      >
        <SitecoreSearchProvider>
          <ComponentPropsContext value={componentProps}>
            {children}
          </ComponentPropsContext>
        </SitecoreSearchProvider>
      </SitecoreProvider>
    </NextIntlClientProvider>
  );
}
