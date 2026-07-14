import React, { JSX } from 'react';
import {
  ComponentPropsCollection,
  ComponentPropsContext,
  Page,
  SitecoreProvider,
} from '@sitecore-content-sdk/nextjs';
// @ts-ignore - import is auto generated on build
import components from '.sitecore/component-map';
import scConfig from 'sitecore.config';

type ProvidersProps = {
  children: React.ReactNode;
  page: Page;
  componentProps?: ComponentPropsCollection;
};

const Providers = ({ children, page, componentProps }: ProvidersProps): JSX.Element => (
  <ComponentPropsContext value={componentProps || {}}>
    <SitecoreProvider
      componentMap={components}
      api={scConfig.api}
      page={page}
      loadImportMap={() => import('.sitecore/import-map')}
    >
      {children}
    </SitecoreProvider>
  </ComponentPropsContext>
);

export default Providers;
