import { JSX, type ReactNode } from 'react';
import { Text, type TextField } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';
import { CHROME_ICON_SLOT_16PX } from 'lib/chrome-icons';
import { UI_ICONS } from 'components/navigation/partial/NavigationIcons';

import type { QuickLinkCardType, QuickLinkIconPosition } from '../QuickLink.type';

export interface QuickLinkTitleTextProps {
  field: TextField;
  tag?: 'span' | 'h2';
  cardType: QuickLinkCardType;
  iconPosition: QuickLinkIconPosition;
  standaloneRail: boolean;
  cardTitleHasHref: boolean;
  isEditing: boolean;
  hasHref?: boolean;
  chevronInlineLayout?: 'always' | 'when-visible' | 'never';
  showChevron?: boolean;
  includeBaseTypography?: boolean;
}

type QuickLinkTitleFieldShellProps = Pick<
  QuickLinkTitleTextProps,
  'field' | 'tag' | 'hasHref' | 'isEditing' | 'standaloneRail' | 'chevronInlineLayout' | 'showChevron'
> & {
  /** Variant-specific typography and layout classes merged with shared link/chevron tail. */
  className?: string;
};

function QuickLinkTitleFieldShell({
  field,
  tag = 'span',
  hasHref,
  isEditing,
  standaloneRail,
  chevronInlineLayout = 'never',
  showChevron = false,
  className,
}: QuickLinkTitleFieldShellProps): JSX.Element {
  return (
    <Text
      field={field}
      tag={tag}
      className={cn(
        tag === 'h2' && 'm-0',
        hasHref && !isEditing && standaloneRail && 'group-hover:text-link-strong',
        hasHref &&
          !isEditing &&
          !standaloneRail &&
          'max-md:text-current md:text-link md:group-hover:text-link-strong lg:text-link lg:group-hover:text-link-strong',
        chevronInlineLayout === 'always' &&
          'max-md:!inline max-md:!w-auto max-md:max-w-none max-md:!h-auto max-md:min-h-0 md:inline-block md:!w-auto md:max-w-none md:!h-auto md:min-h-0',
        chevronInlineLayout === 'when-visible' &&
          showChevron &&
          'max-md:!inline max-md:!w-auto max-md:max-w-none max-md:!h-auto max-md:min-h-0 md:inline-block md:!w-auto md:max-w-none md:!h-auto md:min-h-0',
        className,
      )}
    />
  );
}

/**
 * Decorative chevron beside linked titles.
 *
 * @returns Chevron icon span marked `aria-hidden`.
 */
export function QuickLinkTitleChevron(): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center overflow-hidden leading-none text-current transition-colors duration-150 motion-reduce:transition-none',
        CHROME_ICON_SLOT_16PX,
      )}
      aria-hidden="true"
    >
      {UI_ICONS.chevronRight}
    </span>
  );
}

export interface QuickLinkTitleChevronRowProps {
  iconPosition: QuickLinkIconPosition;
  showChevron?: boolean;
  children: ReactNode;
}

/**
 * Flex row atom: title child + optional chevron.
 *
 * @param props.iconPosition - Title alignment relative to the chevron row.
 * @param props.showChevron - When false, renders children only.
 * @param props.children - Title markup (typically `QuickLinkTitleText`).
 * @returns Inline flex row wrapping title and chevron.
 */
export function QuickLinkTitleChevronRow({
  iconPosition,
  showChevron = true,
  children,
}: QuickLinkTitleChevronRowProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex w-fit max-w-full items-center gap-0 text-link transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-link-strong motion-reduce:transition-none',
        iconPosition === 'center' ? 'justify-center' : 'justify-start',
      )}
    >
      {children}
      {showChevron ? <QuickLinkTitleChevron /> : null}
    </span>
  );
}

function QuickLinkTitleCardRail({
  field,
  tag = 'span',
  cardTitleHasHref,
  isEditing,
  hasHref,
  standaloneRail,
  chevronInlineLayout = 'never',
  showChevron = false,
}: QuickLinkTitleTextProps): JSX.Element {
  return (
    <QuickLinkTitleFieldShell
      field={field}
      tag={tag}
      hasHref={hasHref}
      isEditing={isEditing}
      standaloneRail={standaloneRail}
      chevronInlineLayout={chevronInlineLayout}
      showChevron={showChevron}
      className={cn(
        'box-border m-0 mb-1 mt-0 block w-full max-w-full p-0 text-left font-bold font-media-tile antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
        'max-[599px]:text-font-media-tile-eyebrow max-[599px]:leading-[19.25px]',
        'min-[600px]:text-font-large min-[600px]:leading-[24.75px]',
        cardTitleHasHref && !isEditing ? 'cursor-pointer' : 'cursor-default',
        cardTitleHasHref ?
          'text-link transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none group-hover:text-link-strong'
        : 'text-ink-primary',
      )}
    />
  );
}

function QuickLinkTitleCardTile({
  field,
  tag = 'span',
  iconPosition,
  cardTitleHasHref,
  isEditing,
  hasHref,
  standaloneRail,
  chevronInlineLayout = 'never',
  showChevron = false,
}: QuickLinkTitleTextProps): JSX.Element {
  const centered = iconPosition === 'center';

  return (
    <QuickLinkTitleFieldShell
      field={field}
      tag={tag}
      hasHref={hasHref}
      isEditing={isEditing}
      standaloneRail={standaloneRail}
      chevronInlineLayout={chevronInlineLayout}
      showChevron={showChevron}
      className={cn(
        'box-border block min-h-0 h-auto w-full max-w-full m-0 p-0 break-words',
        'text-font-medium leading-5 font-bold font-media-tile',
        'transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
        '[unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
        'border-0 border-solid border-transparent',
        centered ? 'text-center' : 'text-left',
        cardTitleHasHref && !isEditing ? 'cursor-pointer' : 'cursor-default',
        !cardTitleHasHref && 'text-link',
        cardTitleHasHref ? 'md:text-link' : 'md:text-ink-primary',
        'md:antialiased md:border-stroke-default',
        'lg:text-link lg:border-0',
      )}
    />
  );
}

function QuickLinkTitleBase({
  field,
  tag = 'span',
  iconPosition,
  cardTitleHasHref,
  hasHref,
  isEditing,
  standaloneRail,
  chevronInlineLayout = 'never',
  showChevron = false,
}: QuickLinkTitleTextProps): JSX.Element {
  const centered = iconPosition === 'center';

  return (
    <QuickLinkTitleFieldShell
      field={field}
      tag={tag}
      hasHref={hasHref}
      isEditing={isEditing}
      standaloneRail={standaloneRail}
      chevronInlineLayout={chevronInlineLayout}
      showChevron={showChevron}
      className={cn(
        'text-font-medium font-bold',
        'max-md:box-border max-md:block max-md:min-h-0 max-md:h-auto max-md:w-full max-md:max-w-full max-md:break-words max-md:p-0 max-md:m-0',
        centered ? 'max-md:text-center' : 'max-md:text-left',
        'max-md:text-font-large max-md:leading-[24.75px] max-md:font-bold max-md:font-media-tile',
        !cardTitleHasHref && 'max-md:text-text-heading-color',
        'max-md:[unicode-bidi:isolate] max-md:[-webkit-tap-highlight-color:transparent] max-md:font-media-tile max-md:border-0',
        'md:box-border md:block md:m-0 md:min-h-5 md:h-auto md:max-h-none md:w-full md:max-w-[344px] lg:max-w-[365.33px] md:p-0',
        centered ? 'md:text-center' : 'md:text-left',
        'md:text-font-large md:leading-[24.75px] md:font-bold md:font-media-tile',
        !cardTitleHasHref && 'md:text-text-heading-color',
        'md:[unicode-bidi:isolate] md:[-webkit-tap-highlight-color:transparent] md:font-media-tile md:border-0 md:border-solid md:border-stroke-default',
      )}
    />
  );
}

function QuickLinkTitleMinimal({
  field,
  tag = 'span',
  hasHref,
  isEditing,
  standaloneRail,
  chevronInlineLayout = 'never',
  showChevron = false,
}: QuickLinkTitleTextProps): JSX.Element {
  return (
    <QuickLinkTitleFieldShell
      field={field}
      tag={tag}
      hasHref={hasHref}
      isEditing={isEditing}
      standaloneRail={standaloneRail}
      chevronInlineLayout={chevronInlineLayout}
      showChevron={showChevron}
    />
  );
}

/**
 * Title typography router — delegates to variant atoms that compose `QuickLinkTitleFieldShell`.
 *
 * @param props.field - Sitecore text field for the title.
 * @param props.tag - Semantic wrapper tag (`span` or `h2`).
 * @param props.cardType - Base horizontal or card layout.
 * @param props.iconPosition - Icon alignment for card/base variants.
 * @param props.standaloneRail - Full-width horizontal card rail layout.
 * @param props.cardTitleHasHref - Card title styled as link when href is set.
 * @param props.isEditing - XM Cloud Pages editing mode.
 * @param props.hasHref - Whether the quick link has a navigable href.
 * @param props.chevronInlineLayout - When title text should shrink to inline beside chevron.
 * @param props.showChevron - Whether chevron is visible (for `when-visible` layout).
 * @param props.includeBaseTypography - When false, skips base typography variant.
 * @returns The matching title typography atom.
 */
export function QuickLinkTitleText({
  field,
  tag = 'span',
  cardType,
  iconPosition,
  standaloneRail,
  cardTitleHasHref,
  isEditing,
  hasHref,
  chevronInlineLayout = 'never',
  showChevron = false,
  includeBaseTypography = true,
}: QuickLinkTitleTextProps): JSX.Element {
  if (cardType === 'card' && standaloneRail) {
    return (
      <QuickLinkTitleCardRail
        field={field}
        tag={tag}
        cardType={cardType}
        iconPosition={iconPosition}
        standaloneRail={standaloneRail}
        cardTitleHasHref={cardTitleHasHref}
        isEditing={isEditing}
        hasHref={hasHref}
        chevronInlineLayout={chevronInlineLayout}
        showChevron={showChevron}
      />
    );
  }

  if (cardType === 'card' && !standaloneRail) {
    return (
      <QuickLinkTitleCardTile
        field={field}
        tag={tag}
        cardType={cardType}
        iconPosition={iconPosition}
        standaloneRail={standaloneRail}
        cardTitleHasHref={cardTitleHasHref}
        isEditing={isEditing}
        hasHref={hasHref}
        chevronInlineLayout={chevronInlineLayout}
        showChevron={showChevron}
      />
    );
  }

  if (includeBaseTypography && cardType === 'base') {
    return (
      <QuickLinkTitleBase
        field={field}
        tag={tag}
        cardType={cardType}
        iconPosition={iconPosition}
        standaloneRail={standaloneRail}
        cardTitleHasHref={cardTitleHasHref}
        isEditing={isEditing}
        hasHref={hasHref}
        chevronInlineLayout={chevronInlineLayout}
        showChevron={showChevron}
      />
    );
  }

  return (
    <QuickLinkTitleMinimal
      field={field}
      tag={tag}
      cardType={cardType}
      iconPosition={iconPosition}
      standaloneRail={standaloneRail}
      cardTitleHasHref={cardTitleHasHref}
      isEditing={isEditing}
      hasHref={hasHref}
      chevronInlineLayout={chevronInlineLayout}
      showChevron={showChevron}
      includeBaseTypography={includeBaseTypography}
    />
  );
}
