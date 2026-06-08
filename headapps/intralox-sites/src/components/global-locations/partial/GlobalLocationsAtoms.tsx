import type { JSX, ReactNode } from 'react';

import type { GlobalLocationsSectionSurface } from '../globalLocationsUtils';

import type { Field, TextField } from '@sitecore-content-sdk/nextjs';
import { RichText as ContentSdkRichText, Text } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

export interface GlobalLocationsEyebrowTextProps {
  field: TextField;
  tag: 'p' | 'h2';
  textAlignClass: string;
  isDarkSection: boolean;
  id?: string;
}

/**
 * Eyebrow / headline chrome — single typography `cn()` for all copy-stack eyebrow variants.
 */
export function GlobalLocationsEyebrowText({
  field,
  tag,
  textAlignClass,
  isDarkSection,
  id,
}: GlobalLocationsEyebrowTextProps): JSX.Element {
  return (
    <Text
      field={field}
      tag={tag}
      id={id}
      className={cn(
        '!mt-0 !mx-0 max-w-full border-0 !p-0 font-media-tile text-[length:var(--text-font-media-tile-eyebrow)] font-bold uppercase',
        'leading-[length:var(--leading-font-media-tile-eyebrow)] tracking-[0.35px]',
        '[unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
        textAlignClass,
        isDarkSection ? 'text-ink-inverse' : 'text-ink-muted',
      )}
    />
  );
}

export interface GlobalLocationsDescriptionRichTextProps {
  field: Field<string>;
  textAlignClass: string;
  isDarkSection: boolean;
  colorSchemeRaw: string | undefined;
}

/**
 * Description RichText — consolidated prose/table `cn()` for the copy stack.
 */
export function GlobalLocationsDescriptionRichText({
  field,
  textAlignClass,
  isDarkSection,
  colorSchemeRaw,
}: GlobalLocationsDescriptionRichTextProps): JSX.Element {
  return (
    <ContentSdkRichText
      field={field}
      className={cn(
        'box-border !mt-0 !mb-0 !mx-0 block w-full max-w-full border-0 !p-0',
        '[unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
        'font-media-tile font-bold',
        '!text-[length:var(--text-font-big)]',
        '!leading-[length:var(--leading-font-media-tile-description-landing)]',
        '[&_p]:!text-[length:var(--text-font-big)]',
        '[&_p]:!leading-[length:var(--leading-font-media-tile-description-landing)]',
        '[&_ul>li]:!text-[length:var(--text-font-big)]',
        '[&_ul>li]:!leading-[length:var(--leading-font-media-tile-description-landing)]',
        '[&_ol>li]:!text-[length:var(--text-font-big)]',
        '[&_ol>li]:!leading-[length:var(--leading-font-media-tile-description-landing)]',
        '[&_li>p]:!text-[length:var(--text-font-big)]',
        '[&_li>p]:!leading-[length:var(--leading-font-media-tile-description-landing)]',
        '[&_p]:!mb-0',
        '[&_li>p]:!mb-0',
        textAlignClass,
        'prose font-divider text-font-normal leading-relaxed text-text-heading-color [&:has(table)_h1:first-child]:!m-0 [&:has(table)_h1:first-child]:!text-3xl [&:has(table)_h1:first-child]:!font-bold [&:has(table)_h1:first-child]:!leading-tight [&:has(table)_h1:first-child]:!text-inherit [&_.responsive-table]:!m-0 [&_.responsive-table]:!ml-0 [&_.responsive-table]:!max-w-full [&_.responsive-table]:!p-0 max-[767px]:[&_.responsive-table]:!block max-[767px]:[&_.responsive-table]:!w-full max-[767px]:[&_.responsive-table]:!max-w-none max-[767px]:[&_.responsive-table]:!overflow-x-auto max-[767px]:[&_.responsive-table]:[-webkit-overflow-scrolling:touch] min-[768px]:[&_.responsive-table]:!block min-[768px]:[&_.responsive-table]:!w-full min-[768px]:[&_.responsive-table]:!overflow-x-hidden [&_table]:!m-0 [&_table]:!ml-0 [&_table]:!border-collapse [&_table]:!border-0 [&_table]:!h-auto [&_table]:!bg-bg-basic-color min-[768px]:[&_table]:!w-full min-[768px]:[&_table]:!max-w-full min-[768px]:[&_table]:!table-fixed [&_table]:!text-font-media-tile-eyebrow [&_table]:!leading-[19.25px] [&_table_thead]:!bg-bg-basic-color [&_table_tbody]:!bg-bg-basic-color [&_table_tr]:!border-0 [&_table_tr]:!bg-bg-basic-color [&_table_th]:!box-border [&_table_th]:!max-w-none [&_table_th]:!border-0 [&_table_th]:!border-b [&_table_th]:!border-solid [&_table_th]:!border-border-gray [&_table_th]:!border-l-0 [&_table_th]:!border-r-0 [&_table_th]:!border-t-0 [&_table_th]:!bg-bg-basic-color [&_table_th]:!font-bold [&_table_th]:!font-divider [&_table_th]:!text-font-media-tile-eyebrow [&_table_th]:!text-text-heading-color [&_table_thead_th]:!h-auto [&_table_thead_th]:!min-h-[43.8447px] [&_table_thead_th]:!text-left [&_table_thead_th]:!align-bottom [&_table_thead_th]:!leading-[19.25px] [&_table_thead_th]:!py-[12.297px] [&_table_thead_th]:!pl-0 [&_table_thead_th]:!pr-0 [&_table_td]:!box-border [&_table_td]:!max-w-none [&_table_td]:!border-0 [&_table_td]:!border-b [&_table_td]:!border-solid [&_table_td]:!border-border-gray [&_table_td]:!border-l-0 [&_table_td]:!border-r-0 [&_table_td]:!border-t-0 [&_table_td]:!bg-bg-basic-color [&_table_td]:!font-normal [&_table_td]:!text-font-media-tile-eyebrow [&_table_td]:!text-text-heading-color [&_table_td]:!h-auto [&_table_td]:!min-h-[43.8447px] [&_table_td]:!text-left [&_table_td]:!align-top [&_table_td]:!leading-[19.25px] [&_table_td]:!py-[12.297px] [&_table_td]:!pl-0 [&_table_td]:!pr-0 [&_table_td]:!whitespace-normal [&_table_td]:!break-words max-[767px]:[&_table]:!w-full max-[767px]:[&_table]:!max-w-full max-[767px]:[&_table]:!table-fixed max-[767px]:[&_table:has(td:nth-child(3))]:!w-[150%] max-[767px]:[&_table:has(td:nth-child(3))]:!max-w-none max-[767px]:[&_table:has(td:nth-child(3))_th:nth-child(3)]:!hidden max-[767px]:[&_table:has(td:nth-child(3))_td:nth-child(3)]:!table-cell max-[767px]:[&_table:has(td:nth-child(3))_td:nth-child(3)]:!w-[32%] max-[767px]:[&_table:has(td:nth-child(3))_th:nth-child(1)]:!w-[32%] max-[767px]:[&_table:has(td:nth-child(3))_td:nth-child(1)]:!w-[32%] max-[767px]:[&_table:has(td:nth-child(3))_th:nth-child(2)]:!w-[40%] max-[767px]:[&_table:has(td:nth-child(3))_td:nth-child(2)]:!w-[40%] max-[767px]:[&_table:has(td:nth-child(2)):not(:has(td:nth-child(3)))_th:nth-child(1)]:!w-[44%] max-[767px]:[&_table:has(td:nth-child(2)):not(:has(td:nth-child(3)))_td:nth-child(1)]:!w-[44%] max-[767px]:[&_table:has(td:nth-child(2)):not(:has(td:nth-child(3)))_th:nth-child(2)]:!w-[56%] max-[767px]:[&_table:has(td:nth-child(2)):not(:has(td:nth-child(3)))_td:nth-child(2)]:!w-[56%] max-[767px]:[&_table_td]:!overflow-hidden max-[767px]:[&_table_th]:!overflow-hidden min-[768px]:[&_table:has(td:nth-child(3))_th:nth-child(3)]:!table-cell min-[768px]:[&_table:has(td:nth-child(3))_td:nth-child(3)]:!table-cell min-[768px]:[&_table:has(td:nth-child(3))_td:nth-child(1)]:!w-[30%] min-[768px]:[&_table:has(td:nth-child(3))_td:nth-child(2)]:!w-[38%] min-[768px]:[&_table:has(td:nth-child(3))_td:nth-child(3)]:!w-[32%] min-[768px]:[&_table:has(th:nth-child(3))_th:nth-child(1)]:!w-[30%] min-[768px]:[&_table:has(th:nth-child(3))_th:nth-child(2)]:!w-[38%] min-[768px]:[&_table:has(th:nth-child(3))_th:nth-child(3)]:!w-[32%] min-[768px]:[&_table:has(td:nth-child(2)):not(:has(td:nth-child(3)))_td:nth-child(1)]:!w-[42%] min-[768px]:[&_table:has(td:nth-child(2)):not(:has(td:nth-child(3)))_td:nth-child(2)]:!w-[58%] [&_table_tbody_th]:!h-auto [&_table_tbody_th]:!min-h-[43.8447px] [&_table_tbody_th]:!font-normal [&_table_tbody_th]:!text-left [&_table_tbody_th]:!align-top [&_table_tbody_th]:!leading-[19.25px] [&_table_tbody_th]:!py-[12.297px] [&_table_tbody_th]:!pl-0 [&_table_tbody_th]:!pr-0 [&_table_td_p]:!m-0 [&_table_td_p]:!p-0 [&_table_td_p]:!text-left [&_table_td_p]:!text-font-media-tile-eyebrow [&_table_td_p]:!leading-[19.25px] [&_table_td_p+p]:!mt-0 [&_table_td_div]:!m-0 [&_table_td_div]:!p-0 [&_table_td_div]:!text-left [&_table_th_p]:!m-0 [&_table_th_p]:!p-0 [&_table_th_p]:!text-font-media-tile-eyebrow [&_table_th_p]:!leading-[19.25px] [&_table_tbody_tr:last-child_td]:!border-b-0 [&_table_tbody_tr:last-child_th]:!border-b-0 [&_table_tr:last-child_td]:!border-b-0 [&_table_tr:last-child_th]:!border-b-0 [&_table_caption]:!bg-bg-basic-color [&_table_caption]:!overflow-visible [&_table_caption]:!p-4 [&_table_caption]:!ml-0 [&_table_caption]:!text-left [&_table_caption]:!font-bold [&_table_caption]:!text-text-heading-color prose font-divider text-font-normal leading-relaxed text-ink-primary [&>*:first-child]:!m-0 [&>*+*]:!mt-[16px] [&>*+*]:!mb-0 [&>*+*]:!mx-0 [&_li>p]:!block [&_li>p]:!m-0 [&_li>p:not(:last-child)]:!mb-1 [&_ul]:!m-0 [&_ul]:!list-none [&_ul]:!pl-0 [&_ul]:!space-y-2 [&_ul]:!text-ink-primary [&_ul>li]:!relative [&_ul>li]:!m-0 [&_ul>li]:!list-none [&_ul>li]:!pl-5 md:[&_ul>li]:!pl-6 [&_ul>li]:!leading-6 md:[&_ul>li]:!leading-8 [&_ul>li]:before:!absolute [&_ul>li]:before:!left-[0.15rem] [&_ul>li]:before:!top-[calc((1lh-6px)/2)] [&_ul>li]:before:!h-[6px] [&_ul>li]:before:!w-[6px] [&_ul>li]:before:!shrink-0 [&_ul>li]:before:!rounded-full [&_ul>li]:before:!content-[\'\'] [&_ol]:!m-0 [&_ol]:!pl-6 md:[&_ol]:!pl-7 [&_ol]:!space-y-2 [&_ol]:!text-ink-primary [&_ol>li]:!list-decimal [&_ol>li]:!list-outside [&_ol>li]:!m-0 [&_ol>li]:!pl-2 [&_ol>li]:!leading-6 md:[&_ol>li]:!leading-8 [&_a]:!text-nav-link-hover [&_a]:!underline [&_a:hover]:!text-[rgb(0,40,123)] [&_a:hover]:!no-underline [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-nav-link-hover [&_a]:focus-visible:ring-offset-2 [&_strong]:!font-bold [&_em]:!italic',
        isDarkSection &&
          '[&_p]:!text-current [&_strong]:!text-current [&_ul]:!text-current [&_ol]:!text-current [&_li]:!text-current ',
        '[&_a]:!text-link [&_a]:!no-underline hover:[&_a]:!text-link-strong hover:[&_a]:!underline',
        '[&_a]:!font-normal [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2',
        '[&_a]:focus-visible:ring-link [&_a]:focus-visible:ring-offset-2',
        isDarkSection ? 'text-ink-inverse' : 'text-ink-muted',
        isDarkSection ?
          '[&_p]:!text-current [&_strong]:!text-current [&_ul]:!text-current [&_ol]:!text-current [&_li]:!text-current'
        : '!text-ink-muted [&_p]:!text-ink-muted [&_ul]:!text-ink-muted [&_ol]:!text-ink-muted [&_li]:!text-ink-muted [&_em]:!text-ink-muted [&_i]:!text-ink-muted [&_code]:!text-ink-muted [&_strong]:!text-ink-primary [&_b]:!text-ink-primary [&_p]:!font-bold [&_li]:!font-bold [&_strong]:!font-bold [&_b]:!font-bold',
        /\bdark\b/.test(colorSchemeRaw?.trim().toLowerCase() ?? '') ?
          '[&_ul>li]:before:!bg-[var(--color-accent-warning)] [&_ol>li::marker]:!text-[var(--color-accent-warning)]'
        : '[&_ul>li]:before:!bg-[var(--color-menu-hover-color)] [&_ol>li::marker]:!text-menu-hover-color',
      )}
    />
  );
}

export interface GlobalLocationsSectionShellProps {
  sectionSurface: GlobalLocationsSectionSurface;
  styles: string | undefined;
  anchorProps: Record<string, unknown>;
  sectionAriaProps: Record<string, unknown>;
  children: ReactNode;
}

/**
 * Full-bleed section shell — shared `cn()` for empty and preview branches.
 */
export function GlobalLocationsSectionShell({
  sectionSurface,
  styles,
  anchorProps,
  sectionAriaProps,
  children,
}: GlobalLocationsSectionShellProps): JSX.Element {
  return (
    <section
      className={cn(
        'component global-locations box-border min-w-0 max-w-none flex-[0_0_100%] p-0! w-screen shrink-0 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
        '[.component_&]:ml-0 [.component_&]:mr-0 [.component_&]:w-full [.component_&]:max-w-full [.component_&]:shrink',
        '[.two-column-container_&]:flex-[0_1_auto]',
        sectionSurface === 'surface-muted' && 'bg-surface-muted',
        sectionSurface === 'accent-teal' && 'bg-accent-teal',
        sectionSurface === 'brand-red' && 'bg-brand-red text-ink-inverse',
        sectionSurface === 'surface-inverse' && 'bg-surface-inverse text-ink-inverse',
        sectionSurface === 'surface' && 'bg-surface',
        styles,
      )}
      {...anchorProps}
      {...sectionAriaProps}
    >
      {children}
    </section>
  );
}

/**
 * Inner content container — shared max-width / padding `cn()`.
 */
export function GlobalLocationsContentContainer({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
      <div
        className={cn(
          'box-border mx-auto min-w-0 w-full max-w-full px-4 py-12 min-[768px]:py-20',
          'min-[600px]:max-md:max-w-[length:var(--width-global-locations-content-sm)]',
          'min-[768px]:max-lg:max-w-[length:var(--width-global-locations-content-md)]',
          'min-[992px]:max-xl:max-w-[length:var(--width-global-locations-content-lg)]',
          'min-[1200px]:max-w-[length:var(--width-global-locations-content-xl)]',
          '[.two-column-container_.two-column-left-column_.component.global-locations_&]:pt-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}
