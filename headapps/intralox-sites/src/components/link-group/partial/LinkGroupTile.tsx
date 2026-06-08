import { JSX } from 'react';
import {
  Link as ContentSdkLink,
  NextImage,
  RichText,
  Text,
  type ImageField,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';

import { ChromeIconFromCms } from 'lib/chrome-icons';
import { cn } from 'lib/utils';

import type { LinkGroupItem } from '../LinkGroup.type';
import {
  isLinkGroupRasterIconField,
  linkGroupDescriptionMeaningful,
  linkGroupIconImageDimensions,
  linkGroupRasterIconSrc,
  linkGroupTileAriaLabel,
  linkGroupTileSubtreeProvidesLinkName,
  resolveLinkGroupIconFa,
  type LinkGroupColorSchemeKey,
} from '../linkGroupUtils';
import { LinkGroupTileGroupShell, LinkGroupTileLinkShell } from './LinkGroupAtoms';

export interface LinkGroupTileProps {
  item: LinkGroupItem;
  colorScheme: LinkGroupColorSchemeKey;
  /** Sitecore `Columns` param: single-column uses absolute icon + padded text stack per block-link spec. */
  columns: 1 | 2;
  /** Always `text-left` from parent; `TextAlign` Center is not applied to tiles until a center layout exists. */
  textAlignClass: string;
  isEditing: boolean;
}

function hasHref(link: LinkField | undefined): boolean {
  const href = link?.value?.href;
  return typeof href === 'string' && href.trim().length > 0;
}

function LinkGroupTileChevronIcon(): JSX.Element {
  return (
    <svg
      className="box-border block size-4 shrink-0 translate-y-0.5 p-0 text-current"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
      />
    </svg>
  );
}

/** Block link tile: icon, title, optional RTE, and whole-row link when configured. */
export function LinkGroupTile({
  item,
  colorScheme,
  columns,
  textAlignClass,
  isEditing,
}: LinkGroupTileProps): JSX.Element {
  const fields = item.fields;
  const { Title, Description, Link: linkField } = fields ?? {};
  const rasterSrc = linkGroupRasterIconSrc(fields?.Icon);
  const rasterField =
    fields?.Icon && isLinkGroupRasterIconField(fields.Icon) ? (fields.Icon as ImageField) : undefined;
  const faClass =
    rasterSrc || !fields ? '' : resolveLinkGroupIconFa(fields.Icon);
  const showRasterIcon = Boolean(rasterSrc) || (isEditing && Boolean(rasterField));
  const showFaIcon = Boolean(faClass);
  const showTitle = Boolean(Title?.value !== undefined && String(Title.value).trim()) || isEditing;
  const descMeaningful = Description ? linkGroupDescriptionMeaningful(Description) : false;
  const showDescription = descMeaningful || (isEditing && Description);
  const navigable = hasHref(linkField) && !isEditing;
  const aria = linkGroupTileAriaLabel(fields, item);
  const tileLinkAriaProps =
    navigable && linkGroupTileSubtreeProvidesLinkName(fields) ?
      {}
    : navigable ?
      { 'aria-label': aria }
    : {};
  const linkTarget = linkField?.value?.target;
  const rel = linkTarget === '_blank' ? 'noopener noreferrer' : undefined;

  const isSingleColumn = columns === 1;
  const singleColLightTypography = isSingleColumn;

  const ctaLabel =
    linkField?.value?.text && String(linkField.value.text).trim().length > 0 ?
      String(linkField.value.text).trim()
    : '';

  const showCtaRow = navigable && ctaLabel.length > 0;

  const isLightDarkDefaultScheme =
    colorScheme === 'light' || colorScheme === 'dark' || colorScheme === 'default';

  const iconDims = rasterField ? linkGroupIconImageDimensions(rasterField) : { width: 32, height: 32 };

  const hasIconVisual = showRasterIcon || showFaIcon;

  const iconTwoColPosition = showDescription ? 'top-0' : 'top-1/2 -translate-y-1/2';
  const twoColRasterObject = showDescription ? 'object-top' : 'object-center';
  const twoColFaAlign = showDescription ? 'items-start justify-start' : 'items-center justify-start';

  const iconNode =
    showRasterIcon && rasterField ?
      isSingleColumn ?
        <span
          className="absolute left-0 top-0 z-0 box-border block h-[65px] w-16 max-w-full overflow-x-clip overflow-y-clip border-0 p-0"
          aria-hidden="true"
        >
          <NextImage
            field={rasterField}
            width={iconDims.width}
            height={iconDims.height}
            className="box-border m-0 block h-full w-full max-w-full overflow-x-clip overflow-y-clip border-0 object-cover object-top p-0 align-middle [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent]"
            sizes="64px"
          />
        </span>
      : <span
          className={cn(
            'absolute left-0 z-0 box-border h-[49.0312px] w-12 max-w-full overflow-x-clip overflow-y-clip border-0 p-0',
            'block',
            iconTwoColPosition,
          )}
          aria-hidden="true"
        >
          <NextImage
            field={rasterField}
            width={iconDims.width}
            height={iconDims.height}
            className={cn(
              'box-border m-0 block h-full w-full max-w-full overflow-x-clip overflow-y-clip border-0 object-cover p-0 align-middle [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent]',
              twoColRasterObject,
            )}
            sizes="48px"
          />
        </span>
    : showFaIcon ?
      isSingleColumn ?
        <span
          className={cn(
            'absolute left-0 top-0 z-0 box-border flex h-[65px] w-16 max-w-full items-start justify-start overflow-x-clip overflow-y-clip border-0 p-0',
            colorScheme === 'gray' ? 'bg-surface' : 'bg-surface-muted',
          )}
          aria-hidden="true"
        >
          <ChromeIconFromCms
            cssClass={faClass}
            className={cn(
              'inline-flex items-center justify-start text-2xl leading-none',
              colorScheme === 'gray' ? 'text-nav-link-hover' : 'text-ink-primary',
            )}
          />
        </span>
      : <span
          className={cn(
            'absolute left-0 z-0 box-border h-[49.0312px] w-12 max-w-full overflow-x-clip overflow-y-clip border-0 p-0',
            'flex',
            iconTwoColPosition,
            twoColFaAlign,
            colorScheme === 'gray' ? 'bg-surface' : 'bg-surface-muted',
          )}
          aria-hidden="true"
        >
          <ChromeIconFromCms
            cssClass={faClass}
            className={cn(
              'inline-flex justify-start font-media-tile text-sm leading-[21px] text-current',
              '[-webkit-tap-highlight-color:transparent]',
              colorScheme === 'gray' ? 'text-nav-link-hover' : 'text-ink-primary',
            )}
          />
        </span>
    : null;

  const singleColTitleAlignsWithIcon =
    isSingleColumn && hasIconVisual && !showDescription;
  const twoColTitleAlignsWithIcon = !isSingleColumn && hasIconVisual && !showDescription;

  const textColumn = (
    <div
      className={cn(
        'relative z-[1] min-w-0 max-w-full [unicode-bidi:isolate] pb-0',
        isSingleColumn ?
          hasIconVisual ? 'ml-16 pl-6' : 'pl-6'
        : hasIconVisual ? 'ml-12 pl-4 flex-1' : 'pl-4 flex-1',
        (singleColTitleAlignsWithIcon || twoColTitleAlignsWithIcon) && 'flex flex-col justify-center',
        singleColTitleAlignsWithIcon && 'min-h-[65px]',
        twoColTitleAlignsWithIcon && 'min-h-[49.0312px]',
        textAlignClass,
      )}
    >
      {showTitle && Title ?
        <Text
          field={Title}
          tag="h3"
          className={cn(
            '!m-0 box-border block max-w-full font-media-tile font-bold text-ink-primary [-webkit-tap-highlight-color:transparent]',
            isSingleColumn ?
              'text-font-large leading-[24.75px]'
            : 'min-h-[22px] py-0 pr-0 text-font-medium leading-[22px] [unicode-bidi:isolate]',
            textAlignClass,
          )}
        />
      : null}
      {showDescription && Description ?
        <RichText
          field={Description}
          className={cn(
            'prose1 max-w-none',
            isSingleColumn ?
              'isolate mt-0 border-0 p-0 font-media-tile text-base font-normal leading-6 [-webkit-tap-highlight-color:transparent]'
            : 'mt-2 font-roboto text-font-normal leading-relaxed',
            textAlignClass,
            colorScheme === 'gray' ? 'text-ink-muted' : 'text-ink',
            '[&_ul]:!ml-0 [&_ul]:!py-0 [&_ol]:!ml-0 [&_ol]:!py-0',
            '[&_ul]:m-0 [&_ul]:mt-0 [&_ul]:list-none [&_ul]:space-y-0 [&_ul]:p-0',
            '[&_ol]:m-0 [&_ol]:mt-0 [&_ol]:list-none [&_ol]:space-y-0 [&_ol]:p-0',
            '[&_li]:relative [&_li]:!ml-2 [&_li]:pl-6 [&_li]:mt-2',
            "[&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.55em] [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:shrink-0 [&_li]:before:rounded-full [&_li]:before:content-['']",
            '[&_ul+_br]:hidden [&_ol+_br]:hidden',
            '[&_a]:underline',
            isSingleColumn ?
              '[&_a]:text-link hover:[&_a]:text-link-strong'
            : '[&_a]:text-nav-link-hover',
            colorScheme === 'gray' && '[&_li]:before:bg-accent-teal',
            colorScheme === 'dark' && '[&_li]:before:bg-[var(--color-accent-warning)]',
            colorScheme !== 'gray' && colorScheme !== 'dark' && '[&_li]:before:bg-nav-link-hover',
            navigable &&
              isLightDarkDefaultScheme &&
              'group-hover:text-ink-tertiary group-hover:[&_li]:before:!bg-ink-tertiary',
            isEditing &&
              isLightDarkDefaultScheme &&
              'hover:text-ink-tertiary hover:[&_li]:before:!bg-ink-tertiary',
            'mb-0 pb-0 [&>*:last-child]:mb-0',
            '[&_p]:m-0 [&_p]:p-0',
            isSingleColumn ? '[&_p+p]:mt-2' : '[&_p]:mb-0 [&_p]:mt-0',
          )}
        />
      : null}
      {showCtaRow ?
        <span
          className={cn(
            'isolate box-border mx-0 mb-0 mt-2 inline-flex w-full max-w-full cursor-pointer items-center gap-0 p-0 font-media-tile text-base font-normal leading-6 [-webkit-tap-highlight-color:transparent]',
            'transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
            textAlignClass,
            isSingleColumn && singleColLightTypography ? 'text-link' : 'text-nav-link-hover',
            navigable && isLightDarkDefaultScheme && 'group-hover:text-link-strong',
            isSingleColumn &&
              singleColLightTypography &&
              (!navigable || !isLightDarkDefaultScheme) &&
              'hover:text-link-strong',
          )}
        >
          <span className="min-w-0 p-0">{ctaLabel}</span>
          <LinkGroupTileChevronIcon />
        </span>
      : null}
      {isEditing && linkField ?
        <div className={cn('mt-2 mb-0 pb-0', textAlignClass)}>
          {singleColLightTypography ?
            <span className="m-0 inline-flex max-w-full items-center gap-0 p-0 font-media-tile text-base font-normal leading-6 text-link hover:text-link-strong">
              <ContentSdkLink
                field={linkField}
                className="m-0 border-0 p-0 font-inherit text-inherit underline transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
              />
              <LinkGroupTileChevronIcon />
            </span>
          : isSingleColumn ?
            <ContentSdkLink
              field={linkField}
              className="font-roboto text-font-normal text-nav-link-hover underline"
            />
          : <span
              className={cn(
                'm-0 inline-flex max-w-full items-center gap-0 p-0 font-media-tile text-base font-normal leading-6 text-nav-link-hover',
                'transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
                isLightDarkDefaultScheme && 'hover:text-link-strong',
              )}
            >
              <ContentSdkLink
                field={linkField}
                className="m-0 border-0 p-0 font-inherit text-inherit underline transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
              />
              <LinkGroupTileChevronIcon />
            </span>
          }
        </div>
      : null}
    </div>
  );

  const tileShellLayout = {
    isSingleColumn,
    hasIconVisual,
    showDescription: Boolean(showDescription),
    navigable,
    colorScheme,
  };

  if (navigable && linkField) {
    return (
      <LinkGroupTileLinkShell
        field={linkField}
        target={linkTarget || undefined}
        rel={rel}
        linkAriaProps={tileLinkAriaProps}
        {...tileShellLayout}
      >
        {iconNode}
        {textColumn}
      </LinkGroupTileLinkShell>
    );
  }

  return (
    <LinkGroupTileGroupShell ariaLabel={aria} {...tileShellLayout}>
      {iconNode}
      {textColumn}
    </LinkGroupTileGroupShell>
  );
}
