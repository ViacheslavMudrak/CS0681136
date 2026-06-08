'use client';

import { useCallback, useMemo } from 'react';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import type { LinkField } from '@sitecore-content-sdk/nextjs';

import { resolveLocalNavLinkFieldForAppRouter } from 'components/local-navigation/localNavigationUtils';
import scConfig from 'sitecore.config';

import { resolveNavFieldsLinkField } from './navigationUtils';

export type HeaderNavLinkResolver = {
  linkFieldForAppRouter: (fields: unknown) => LinkField | undefined;
  linkForAppRouter: (link: LinkField | undefined) => LinkField | undefined;
};

/** Unprefixed Sitecore paths — used in tests and when resolver is not wired. */
export const passthroughHeaderNavLinkResolver: HeaderNavLinkResolver = {
  linkFieldForAppRouter: (fields) => resolveNavFieldsLinkField(fields),
  linkForAppRouter: (link) => link,
};

/**
 * Prefixes header General Link fields for App Router client navigation.
 *
 * @param isEditing - When true, returns CMS link fields unchanged for inline editing
 * @returns Resolvers for nav item fields and raw link fields
 */
export function useNavigationLinkForAppRouter(isEditing: boolean): HeaderNavLinkResolver {
  const pathname = usePathname() ?? '';
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const { page } = useSitecore();
  const isPreview = Boolean(page.mode.isPreview);

  const routeContext = useMemo(
    () => ({
      site: typeof routeParams?.site === 'string' ? routeParams.site : undefined,
      locale: typeof routeParams?.locale === 'string' ? routeParams.locale : undefined,
      defaultLocale: scConfig.defaultLanguage || 'en',
    }),
    [routeParams?.site, routeParams?.locale]
  );

  const previewSearchParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  const resolveOptions = useMemo(
    () => ({
      routeContext,
      isPreview,
      previewSearchParams: isPreview ? previewSearchParams : undefined,
    }),
    [isPreview, previewSearchParams, routeContext]
  );

  const linkForAppRouter = useCallback(
    (link: LinkField | undefined): LinkField | undefined => {
      if (!link || isEditing) return link;
      return resolveLocalNavLinkFieldForAppRouter(link, pathname, resolveOptions) ?? link;
    },
    [isEditing, pathname, resolveOptions]
  );

  const linkFieldForAppRouter = useCallback(
    (fields: unknown): LinkField | undefined => linkForAppRouter(resolveNavFieldsLinkField(fields)),
    [linkForAppRouter]
  );

  return { linkFieldForAppRouter, linkForAppRouter };
}
