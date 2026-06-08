import type { JSX, ReactNode } from 'react';

import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { Link as ContentSdkLink, RichText } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

import type { LinkGroupColorSchemeKey } from '../linkGroupUtils';

export interface LinkGroupSectionShellProps {
  styles: string | undefined;
  anchorProps: Record<string, unknown>;
  sectionAriaLabel: string;
  testId?: string;
  children: ReactNode;
}

/**
 * Full-bleed link-group section — shared shell `cn()` across empty, editing, and preview branches.
 */
export function LinkGroupSectionShell({
  styles,
  anchorProps,
  sectionAriaLabel,
  testId,
  children,
}: LinkGroupSectionShellProps): JSX.Element {
  return (
    <section
      className={cn(
        'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0!',
        'w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
        'component link-group bg-surface pb-12 md:pb-20',
        styles,
      )}
      {...anchorProps}
      aria-label={sectionAriaLabel}
      data-testid={testId}
    >
      {children}
    </section>
  );
}

export interface LinkGroupDescriptionRichTextProps {
  field: Field<string>;
  colorScheme: LinkGroupColorSchemeKey;
}

/**
 * Parent description RichText — single prose `cn()` for editing-empty and preview headers.
 */
export function LinkGroupDescriptionRichText({
  field,
  colorScheme,
}: LinkGroupDescriptionRichTextProps): JSX.Element {
  return (
    <RichText
      field={field}
      className={cn(
        'prose1 mt-3 max-w-none font-roboto [unicode-bidi:isolate]',
        'prose font-divider text-font-normal leading-relaxed text-ink-primary',
        '[&>*:first-child]:!m-0 [&>*+*]:!mt-[16px] [&>*+*]:!mb-0 [&>*+*]:!mx-0',
        '[&_li>p]:!block [&_li>p]:!m-0 [&_li>p:not(:last-child)]:!mb-1',
        '[&_ul]:!m-0 [&_ul]:!list-none [&_ul]:!pl-0 [&_ul]:!space-y-2 [&_ul]:!text-ink-primary',
        '[&_ul>li]:!relative [&_ul>li]:!m-0 [&_ul>li]:!list-none [&_ul>li]:!pl-5 md:[&_ul>li]:!pl-6 [&_ul>li]:!leading-6 md:[&_ul>li]:!leading-8',
        "[&_ul>li]:before:!absolute [&_ul>li]:before:!left-[0.15rem] [&_ul>li]:before:!top-[calc((1lh-6px)/2)] [&_ul>li]:before:!h-[6px] [&_ul>li]:before:!w-[6px] [&_ul>li]:before:!shrink-0 [&_ul>li]:before:!rounded-full [&_ul>li]:before:!content-['']",
        '[&_ul>li]:before:!bg-[var(--color-nav-link-hover)]',
        '[&_ol]:!m-0 [&_ol]:!pl-6 md:[&_ol]:!pl-7 [&_ol]:!space-y-2 [&_ol]:!text-ink-primary',
        '[&_ol>li]:!list-decimal [&_ol>li]:!list-outside [&_ol>li]:!m-0 [&_ol>li]:!pl-2 [&_ol>li]:!leading-6 md:[&_ol>li]:!leading-8',
        '[&_ol>li::marker]:!text-nav-link-hover',
        '[&_a]:!text-nav-link-hover [&_a]:!underline [&_a:hover]:!text-[rgb(0,40,123)] [&_a:hover]:!no-underline',
        '[&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-nav-link-hover [&_a]:focus-visible:ring-offset-2',
        '[&_strong]:!font-bold [&_em]:!italic',
        '!text-font-medium !leading-6 [&_ul>li]:!text-font-medium [&_ol>li]:!text-font-medium [&_li>p]:!text-font-medium',
        '[&_a]:!text-link [&_a]:!no-underline hover:[&_a]:!text-link-strong hover:[&_a]:!underline [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-link [&_a]:focus-visible:ring-offset-2',
        'text-ink-primary',
        '[&_strong]:!text-ink-primary [&_b]:!text-ink-primary [&_em]:!text-ink-primary [&_i]:!text-ink-primary [&_code]:!text-ink-primary',
        colorScheme === 'gray' ?
          '!text-ink-muted [&_p]:!text-ink-muted [&_ul]:!text-ink-muted [&_ol]:!text-ink-muted [&_li]:!text-ink-muted'
        : '!text-ink [&_p]:!text-ink [&_ul]:!text-ink [&_ol]:!text-ink [&_li]:!text-ink',
        '[&_p]:m-0',
      )}
    />
  );
}

interface LinkGroupTileShellLayoutProps {
  isSingleColumn: boolean;
  hasIconVisual: boolean;
  showDescription: boolean;
  navigable: boolean;
  colorScheme: LinkGroupColorSchemeKey;
}

export interface LinkGroupTileLinkShellProps extends LinkGroupTileShellLayoutProps {
  field: LinkField;
  target?: string;
  rel?: string;
  linkAriaProps: Record<string, unknown>;
  children: ReactNode;
}

/**
 * Navigable tile — ContentSdkLink with shared shell `cn()`.
 */
export function LinkGroupTileLinkShell({
  field,
  target,
  rel,
  linkAriaProps,
  children,
  ...layout
}: LinkGroupTileLinkShellProps): JSX.Element {
  return (
    <ContentSdkLink
      field={field}
      className={cn(
        'relative box-border m-0 block w-full min-w-0 border-0 bg-transparent p-0 py-0 text-ink-primary',
        layout.isSingleColumn && layout.hasIconVisual && 'min-h-[65px]',
        !layout.isSingleColumn && layout.hasIconVisual && !layout.showDescription && 'min-h-[49.0312px]',
        layout.navigable && 'group',
        layout.navigable &&
          'rounded-sm no-underline transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
        layout.navigable &&
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2',
        layout.navigable && layout.colorScheme === 'default' && 'hover:bg-surface-muted-light',
        layout.navigable && layout.colorScheme === 'gray' && 'hover:bg-surface-panel-active',
        layout.navigable && layout.colorScheme !== 'default' && layout.colorScheme !== 'gray' && 'hover:bg-surface',
      )}
      target={target}
      rel={rel}
      {...linkAriaProps}
    >
      {children}
    </ContentSdkLink>
  );
}

export interface LinkGroupTileGroupShellProps extends LinkGroupTileShellLayoutProps {
  ariaLabel: string;
  children: ReactNode;
}

/**
 * Non-navigable tile — group wrapper with shared shell `cn()`.
 */
export function LinkGroupTileGroupShell({
  ariaLabel,
  children,
  ...layout
}: LinkGroupTileGroupShellProps): JSX.Element {
  return (
    <div
      className={cn(
        'relative box-border m-0 block w-full min-w-0 border-0 bg-transparent p-0 py-0 text-ink-primary',
        layout.isSingleColumn && layout.hasIconVisual && 'min-h-[65px]',
        !layout.isSingleColumn && layout.hasIconVisual && !layout.showDescription && 'min-h-[49.0312px]',
        layout.navigable && 'group',
        layout.navigable &&
          'rounded-sm no-underline transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
        layout.navigable &&
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2',
        layout.navigable && layout.colorScheme === 'default' && 'hover:bg-surface-muted-light',
        layout.navigable && layout.colorScheme === 'gray' && 'hover:bg-surface-panel-active',
        layout.navigable && layout.colorScheme !== 'default' && layout.colorScheme !== 'gray' && 'hover:bg-surface',
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
