import type { JSX, ReactNode } from 'react';

import type { LinkField } from '@sitecore-content-sdk/nextjs';
import { Link as SitecoreLink } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

export type NavMegaMenuLinkTone = 'primary' | 'muted';
export type NavMegaMenuLinkWidth = 'full' | 'fixed';

interface NavMegaMenuLinkClassOptions {
  isCurrent: boolean;
  tone: NavMegaMenuLinkTone;
  width: NavMegaMenuLinkWidth;
}

export interface NavOverviewSitecoreLinkProps {
  field: LinkField;
  editable: boolean;
  target?: string;
  rel?: string;
  isCurrent: boolean;
  width: NavMegaMenuLinkWidth;
  children: ReactNode;
  'aria-current'?: 'page' | undefined;
}

/**
 * Mega-menu overview Sitecore link — shared overview footer `cn()`.
 */
export function NavOverviewSitecoreLink({
  field,
  editable,
  target,
  rel,
  isCurrent,
  width,
  children,
  'aria-current': ariaCurrent,
}: NavOverviewSitecoreLinkProps): JSX.Element {
  return (
    <SitecoreLink
      field={field}
      editable={editable}
      target={target}
      rel={rel}
      className={cn(
        'block p-1 rounded bg-transparent font-sans text-sm no-underline! transition-colors duration-150 hover:bg-surface-selected focus-visible:bg-surface-selected focus:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-accent-nav)] focus-visible:ring-offset-0',
        'font-medium leading-tight text-ink-primary',
        width === 'full' ? 'w-full min-w-0' : 'w-[199px] max-w-full',
        isCurrent && '!bg-surface-selected !text-ink',
      )}
      aria-current={ariaCurrent}
    >
      {children}
    </SitecoreLink>
  );
}

export interface NavOverviewAnchorLinkProps {
  href: string;
  isCurrent: boolean;
  width: NavMegaMenuLinkWidth;
  children: ReactNode;
  'aria-current'?: 'page' | undefined;
}

/**
 * Mega-menu overview native anchor — shared overview footer `cn()`.
 */
export function NavOverviewAnchorLink({
  href,
  isCurrent,
  width,
  children,
  'aria-current': ariaCurrent,
}: NavOverviewAnchorLinkProps): JSX.Element {
  return (
    <a
      href={href}
      className={cn(
        'block p-1 rounded bg-transparent font-sans text-sm no-underline! transition-colors duration-150 hover:bg-surface-selected focus-visible:bg-surface-selected focus:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-accent-nav)] focus-visible:ring-offset-0',
        'font-medium leading-tight text-ink-primary',
        width === 'full' ? 'w-full min-w-0' : 'w-[199px] max-w-full',
        isCurrent && '!bg-surface-selected !text-ink',
      )}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  );
}

export interface NavTertiarySitecoreLinkProps {
  field: LinkField;
  editable: boolean;
  target?: string;
  rel?: string;
  isCurrent: boolean;
  children: ReactNode;
  'aria-current'?: 'page' | undefined;
}

/**
 * Mega-menu tertiary Sitecore link — shared tertiary row `cn()`.
 */
export function NavTertiarySitecoreLink({
  field,
  editable,
  target,
  rel,
  isCurrent,
  children,
  'aria-current': ariaCurrent,
}: NavTertiarySitecoreLinkProps): JSX.Element {
  return (
    <SitecoreLink
      field={field}
      editable={editable}
      target={target}
      rel={rel}
      className={cn(
        'block p-1 rounded bg-transparent font-sans text-sm no-underline! transition-colors duration-150 hover:bg-surface-selected focus-visible:bg-surface-selected focus:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-accent-nav)] focus-visible:ring-offset-0',
        'leading-tight text-ink-muted',
        'w-full min-w-0',
        isCurrent && '!bg-surface-selected !text-ink',
      )}
      aria-current={ariaCurrent}
    >
      {children}
    </SitecoreLink>
  );
}

export interface NavTertiaryAnchorLinkProps {
  href: string;
  isCurrent: boolean;
  children: ReactNode;
  'aria-current'?: 'page' | undefined;
}

/**
 * Mega-menu tertiary native anchor — shared tertiary row `cn()`.
 */
export function NavTertiaryAnchorLink({
  href,
  isCurrent,
  children,
  'aria-current': ariaCurrent,
}: NavTertiaryAnchorLinkProps): JSX.Element {
  return (
    <a
      href={href}
      className={cn(
        'block p-1 rounded bg-transparent font-sans text-sm no-underline! transition-colors duration-150 hover:bg-surface-selected focus-visible:bg-surface-selected focus:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-accent-nav)] focus-visible:ring-offset-0',
        'leading-tight text-ink-muted',
        'w-full min-w-0',
        isCurrent && '!bg-surface-selected !text-ink',
      )}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  );
}

export interface NavTertiaryStaticLabelProps {
  isCurrent: boolean;
  children: ReactNode;
  'aria-current'?: 'page' | undefined;
}

/**
 * Non-link tertiary row label — same chrome as tertiary links when href is absent.
 */
export function NavTertiaryStaticLabel({
  isCurrent,
  children,
  'aria-current': ariaCurrent,
}: NavTertiaryStaticLabelProps): JSX.Element {
  return (
    <span
      className={cn(
        'block p-1 rounded bg-transparent font-sans text-sm no-underline! transition-colors duration-150 hover:bg-surface-selected focus-visible:bg-surface-selected focus:outline-none focus-visible:ring-3 focus-visible:ring-[var(--color-accent-nav)] focus-visible:ring-offset-0',
        'leading-tight text-ink-muted',
        'w-full min-w-0',
        isCurrent && '!bg-surface-selected !text-ink',
      )}
      aria-current={ariaCurrent}
    >
      {children}
    </span>
  );
}
