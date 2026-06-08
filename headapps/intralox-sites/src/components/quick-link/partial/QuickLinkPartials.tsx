import { JSX } from 'react';
import {
  Link as ContentSdkLink,
  NextImage,
  RichText,
  Text,
  type Field,
  type LinkField,
  type TextField,
} from '@sitecore-content-sdk/nextjs';
import { QUICK_LINK_LABEL_FALLBACKS } from 'lib/quick-link-i18n';
import { cn } from 'lib/utils';
import {
  CHROME_ICON_BASE,
  CHROME_ICON_SIZE_EM,
  renderChromeIconFromFaClass,
} from 'lib/chrome-icons';
import { cmsIconToFontAwesome } from 'src/lib/cms-icon-to-fontawesome';
import { ImageView } from 'components/shared/ImageView/ImageView';

import type { QuickLinkCardType, QuickLinkFields, QuickLinkIconPosition } from '../QuickLink.type';

/** Live standalone rail delivery width (<600px ImageOptim MediaBox parity). */
const QUICK_LINK_STANDALONE_MOBILE_CROP_WIDTH = 568;
import {
  QuickLinkTitleChevronRow,
  QuickLinkTitleText,
} from './QuickLinkTitleAtoms';

export interface QuickLinkTitleProps {
  titleField: TextField | undefined;
  linkField: LinkField | undefined;
  cardType: QuickLinkCardType;
  /** Defaults to `center` when omitted (e.g. standalone rendering in the map). */
  iconPosition?: QuickLinkIconPosition;
  isEditing: boolean;
  cardTitleHasHref: boolean;
  /** When true, the parent container is already a link — title renders as display-only (no nested anchor). */
  isCardWrappedAsLink?: boolean;
  standaloneRail?: boolean;
  /** Dictionary `QuickLink_LinkAriaFallback` when title and link text are empty; defaults for standalone renderings. */
  linkAriaFallback?: string;
}

function linkHasHref(link: LinkField | undefined): boolean {
  const href = link?.value?.href;
  return typeof href === 'string' && href.trim().length > 0;
}

function ariaLabelForLink(
  titleField: TextField | undefined,
  linkField: LinkField | undefined,
  fallback: string,
): string {
  const t = titleField?.value;
  if (typeof t === 'string' && t.trim()) return t.trim();
  const lt = linkField?.value?.text;
  if (typeof lt === 'string' && lt.trim()) return lt.trim();
  return fallback;
}

/**
 * Title as plain text or wrapped in `Link` when a URL is set.
 * Card and base show a chevron after the title only when the link field has an href.
 * When `isCardWrappedAsLink` is true the parent container is already the anchor — title renders as a
 * display-only span (no nested anchor) with card centering or base left-align as appropriate.
 *
 * @param props - Title/link fields, layout variant, editing flag, typography classes, and aria fallback.
 * @returns Title markup, link-wrapped title when appropriate, or `null` when nothing to show.
 */
export function QuickLinkTitle({
  titleField,
  linkField,
  cardType,
  iconPosition = 'center',
  isEditing,
  cardTitleHasHref,
  isCardWrappedAsLink = false,
  standaloneRail = false,
  linkAriaFallback = QUICK_LINK_LABEL_FALLBACKS.linkAriaFallback,
}: QuickLinkTitleProps): JSX.Element | null {
  const hasHref = linkHasHref(linkField);
  const titleText =
    titleField?.value !== undefined && titleField?.value !== null ?
      String(titleField.value).trim()
    : '';
  const showTitle = Boolean(titleText) || isEditing;

  if (!showTitle && !(hasHref && !isEditing)) {
    return null;
  }

  const linkTarget = linkField?.value?.target;
  const showTitleChevron = hasHref;

  if (isCardWrappedAsLink && hasHref && !isEditing) {
    const linkDisplayText =
      linkField?.value?.text != null ? String(linkField.value.text).trim() : '';
    const displayValue = titleText || linkDisplayText;
    const textFieldForDisplay: TextField =
      titleText && titleField ?
        titleField
      : ({ value: linkDisplayText } as TextField);

    if (!displayValue && !titleField) {
      return null;
    }

    return (
      <QuickLinkTitleChevronRow iconPosition={iconPosition}>
        {displayValue ?
          <QuickLinkTitleText
            field={textFieldForDisplay}
            cardType={cardType}
            iconPosition={iconPosition}
            standaloneRail={standaloneRail}
            cardTitleHasHref={cardTitleHasHref}
            isEditing={isEditing}
            hasHref={hasHref}
            chevronInlineLayout="always"
          />
        : null}
      </QuickLinkTitleChevronRow>
    );
  }

  if (hasHref && !isEditing && linkField) {
    return (
      <ContentSdkLink
        field={linkField}
        className={cn(
          'group inline-flex max-w-full items-center gap-0 focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 rounded-sm no-underline',
          showTitleChevron && 'w-fit',
          iconPosition === 'center' ? 'justify-center' : 'justify-start',
          'max-md:text-link max-md:transition-all max-md:duration-150 max-md:ease-[cubic-bezier(0.4,0,0.2,1)] max-md:hover:text-link-strong md:transition-all md:duration-150 md:ease-[cubic-bezier(0.4,0,0.2,1)] md:hover:text-link-strong',
        )}
        aria-label={ariaLabelForLink(titleField, linkField, linkAriaFallback)}
        target={linkTarget || undefined}
        rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
      >
        <QuickLinkTitleChevronRow iconPosition={iconPosition} showChevron={showTitleChevron}>
          {titleField && titleText ?
            <QuickLinkTitleText
              field={titleField}
              cardType={cardType}
              iconPosition={iconPosition}
              standaloneRail={standaloneRail}
              cardTitleHasHref={cardTitleHasHref}
              isEditing={isEditing}
              hasHref={hasHref}
              chevronInlineLayout="when-visible"
              showChevron={showTitleChevron}
            />
          : null}
        </QuickLinkTitleChevronRow>
      </ContentSdkLink>
    );
  }

  if (!titleField) {
    return null;
  }

  if (cardType === 'card' && hasHref && isEditing) {
    return (
      <h2
        className={cn(
          'm-0 flex w-full max-w-full flex-col gap-0',
          iconPosition === 'center' ? 'items-center' : 'items-start',
        )}
      >
        <QuickLinkTitleChevronRow iconPosition={iconPosition}>
          <QuickLinkTitleText
            field={titleField}
            cardType={cardType}
            iconPosition={iconPosition}
            standaloneRail={standaloneRail}
            cardTitleHasHref={cardTitleHasHref}
            isEditing={isEditing}
            hasHref={hasHref}
            includeBaseTypography={false}
            chevronInlineLayout="always"
          />
        </QuickLinkTitleChevronRow>
      </h2>
    );
  }

  return (
    <QuickLinkTitleText
      field={titleField}
      tag="h2"
      cardType={cardType}
      iconPosition={iconPosition}
      standaloneRail={standaloneRail}
      cardTitleHasHref={cardTitleHasHref}
      isEditing={isEditing}
    />
  );
}

export interface QuickLinkDescriptionProps {
  descriptionField: Field<string> | undefined;
  isEditing: boolean;
  cardType: QuickLinkCardType;
  iconPosition: QuickLinkIconPosition;
  cardTitleHasHref: boolean;
  standaloneRail?: boolean;
  /** When set, overrides layout body classes (e.g. case-study sidebar rail). */
  bodyClassNameOverride?: string;
  alignmentClassOverride?: string;
  /** Tighten description spacing on narrow sidebar rails (≤430px and 481–599px). */
  railTightDescriptionMax430?: boolean;
}

function descriptionMeaningful(field: Field<string> | undefined): boolean {
  const v = field?.value;
  if (v === undefined || v === null) return false;
  const s = String(v).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return s.length > 0;
}

/**
 * RTE body under the title; hidden when empty unless editing.
 *
 * @param props - Description field, editing flag, and typography classes.
 * @returns `RichText` markup or `null` when there is nothing to show.
 */
export function QuickLinkDescription({
  descriptionField,
  isEditing,
  cardType,
  iconPosition,
  cardTitleHasHref,
  standaloneRail = false,
  bodyClassNameOverride,
  alignmentClassOverride,
  railTightDescriptionMax430 = false,
}: QuickLinkDescriptionProps): JSX.Element | null {
  const show = descriptionMeaningful(descriptionField) || isEditing;

  if (!show || !descriptionField) {
    return null;
  }

  const hasBodyOverride = bodyClassNameOverride != null;
  const isCardStandaloneRailBody = !hasBodyOverride && cardType === 'card' && standaloneRail;
  const isCardCenterBody =
    !hasBodyOverride && cardType === 'card' && iconPosition === 'center' && !standaloneRail;
  const isCardLeftBody =
    !hasBodyOverride && cardType === 'card' && !standaloneRail && iconPosition !== 'center';
  const isBaseDefaultBody = !hasBodyOverride && cardType !== 'card';
  const cardLinkPointer = cardTitleHasHref && !isEditing;

  return (
    <RichText
      field={descriptionField}
      className={cn(
        standaloneRail && 'mx-0 mt-0 min-w-0 break-words',
        !standaloneRail && 'mx-0 mb-0 mt-1 min-w-0 break-words',
        !standaloneRail &&
          railTightDescriptionMax430 &&
          'max-[430px]:mt-0 min-[481px]:max-[599px]:mt-0',
        bodyClassNameOverride,
        isCardStandaloneRailBody &&
          'mx-0 mt-0 mb-5 block w-full max-w-full p-0 text-left font-normal text-ink-muted font-media-tile antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] max-[599px]:text-font-media-tile-eyebrow max-[599px]:leading-[19.25px] min-[600px]:text-font-medium min-[600px]:leading-[22px] [&_p]:m-0 [&_p]:text-left [&_p]:font-normal [&_p]:text-ink-muted [&_p]:font-media-tile max-[599px]:[&_p]:text-font-media-tile-eyebrow max-[599px]:[&_p]:leading-[19.25px] min-[600px]:[&_p]:text-font-medium min-[600px]:[&_p]:leading-[22px]',
        isCardStandaloneRailBody && cardLinkPointer && 'cursor-pointer',
        isCardStandaloneRailBody && !cardLinkPointer && 'cursor-default',
        isCardCenterBody && 'text-font-normal text-ink-secondary text-center',
        isCardCenterBody &&
          'max-md:box-border max-md:block max-md:min-h-0 max-md:w-full max-md:max-w-[320px] max-md:mx-auto max-md:break-words max-md:mb-0 max-md:p-0 max-md:text-center',
        isCardCenterBody && cardLinkPointer && 'max-md:cursor-pointer',
        isCardCenterBody && !cardLinkPointer && 'max-md:cursor-default',
        isCardCenterBody &&
          'max-md:text-font-media-tile-eyebrow max-md:leading-[19.25px] max-md:text-ink-muted max-md:font-media-tile max-md:[unicode-bidi:isolate] max-md:[-webkit-tap-highlight-color:transparent] max-md:border-0 max-md:border-solid max-md:border-transparent',
        isCardCenterBody &&
          'md:box-border md:block md:mt-1 md:mb-0 md:p-0 md:min-h-0 md:mx-auto md:w-full md:max-w-[320px] md:overflow-visible md:text-center md:break-words',
        isCardCenterBody && cardLinkPointer && 'md:cursor-pointer',
        isCardCenterBody && !cardLinkPointer && 'md:cursor-default',
        isCardCenterBody &&
          'md:text-font-media-tile-eyebrow md:leading-[19.25px] md:text-ink-muted md:font-media-tile md:[unicode-bidi:isolate] md:[-webkit-tap-highlight-color:transparent] md:antialiased md:border-0 md:border-solid md:border-stroke-default md:font-media-tile md:[&_p]:m-0 md:[&_p]:text-font-media-tile-eyebrow md:[&_p]:leading-[19.25px] md:[&_p]:text-ink-muted md:[&_p]:text-center md:[&_p]:font-media-tile',
        isCardCenterBody &&
          'lg:box-border lg:block lg:mt-1 lg:mb-0 lg:p-0 lg:min-h-0 lg:mx-auto lg:w-full lg:max-w-[320px] lg:overflow-visible lg:text-center lg:break-words',
        isCardCenterBody && cardLinkPointer && 'lg:cursor-pointer',
        isCardCenterBody && !cardLinkPointer && 'lg:cursor-default',
        isCardCenterBody &&
          'lg:text-font-media-tile-eyebrow lg:leading-[19.25px] lg:text-ink-muted lg:font-media-tile lg:[unicode-bidi:isolate] lg:[-webkit-tap-highlight-color:transparent] lg:border-0 lg:[&_p]:m-0 lg:[&_p]:text-font-media-tile-eyebrow lg:[&_p]:leading-[19.25px] lg:[&_p]:text-ink-muted lg:[&_p]:text-center',
        isCardLeftBody && 'text-font-normal text-ink-secondary text-left',
        isCardLeftBody &&
          'max-md:box-border max-md:block max-md:min-h-0 max-md:w-full max-md:max-w-[320px] max-md:mx-0 max-md:break-words max-md:mb-0 max-md:p-0 max-md:text-left',
        isCardLeftBody && cardLinkPointer && 'max-md:cursor-pointer',
        isCardLeftBody && !cardLinkPointer && 'max-md:cursor-default',
        isCardLeftBody &&
          'max-md:text-font-media-tile-eyebrow max-md:leading-[19.25px] max-md:text-ink-muted max-md:font-media-tile max-md:[unicode-bidi:isolate] max-md:[-webkit-tap-highlight-color:transparent] max-md:border-0 max-md:border-solid max-md:border-transparent',
        isCardLeftBody &&
          'md:box-border md:block md:mt-1 md:mb-0 md:p-0 md:min-h-0 md:mx-0 md:w-full md:max-w-[320px] md:overflow-visible md:text-left md:break-words',
        isCardLeftBody && cardLinkPointer && 'md:cursor-pointer',
        isCardLeftBody && !cardLinkPointer && 'md:cursor-default',
        isCardLeftBody &&
          'md:text-font-media-tile-eyebrow md:leading-[19.25px] md:text-ink-muted md:font-media-tile md:[unicode-bidi:isolate] md:[-webkit-tap-highlight-color:transparent] md:antialiased md:border-0 md:border-solid md:border-stroke-default md:font-media-tile md:[&_p]:m-0 md:[&_p]:text-font-media-tile-eyebrow md:[&_p]:leading-[19.25px] md:[&_p]:text-ink-muted md:[&_p]:text-left md:[&_p]:font-media-tile',
        isCardLeftBody &&
          'lg:box-border lg:block lg:mt-1 lg:mb-0 lg:p-0 lg:min-h-0 lg:mx-0 lg:w-full lg:max-w-[320px] lg:overflow-visible lg:text-left lg:break-words',
        isCardLeftBody && cardLinkPointer && 'lg:cursor-pointer',
        isCardLeftBody && !cardLinkPointer && 'lg:cursor-default',
        isCardLeftBody &&
          'lg:text-font-media-tile-eyebrow lg:leading-[19.25px] lg:text-ink-muted lg:font-media-tile lg:[unicode-bidi:isolate] lg:[-webkit-tap-highlight-color:transparent] lg:border-0 lg:[&_p]:m-0 lg:[&_p]:text-font-media-tile-eyebrow lg:[&_p]:leading-[19.25px] lg:[&_p]:text-ink-muted lg:[&_p]:text-left',
        isBaseDefaultBody && 'text-font-normal',
        isBaseDefaultBody &&
          'box-border block min-h-[44px] w-full max-w-full break-words p-0 mx-0 mb-0 text-font-medium leading-[22px] text-ink-primary transition-colors duration-150 ease-in-out motion-reduce:transition-none group-hover:text-ink-tertiary [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] font-media-tile border-0 overflow-visible [&_p]:text-inherit [&_p]:transition-[color] [&_p]:duration-150 [&_p]:ease-in-out motion-reduce:[&_p]:transition-none',
        isBaseDefaultBody && iconPosition === 'center' && 'text-center',
        isBaseDefaultBody && iconPosition !== 'center' && 'text-left',
        alignmentClassOverride,
        alignmentClassOverride == null && iconPosition === 'center' && 'text-center',
        alignmentClassOverride == null && iconPosition !== 'center' && 'text-left',
        '[&_p]:m-0 [&_p]:mb-0 [&_p]:mt-0 [&_p]:p-0 [&_p]:max-w-full [&_p]:break-words [&_a]:text-nav-link-hover [&_a]:underline',
      )}
    />
  );
}

export interface QuickLinkIconProps {
  fields: QuickLinkFields;
  cardType: QuickLinkCardType;
  /** Defaults to `center` when omitted (e.g. standalone rendering in the map). */
  iconPosition?: QuickLinkIconPosition;
  iconCmsKey: string | undefined;
  isEditing: boolean;
  /** Card only: true when the tile is a real link (`href` + not editing); controls pointer on icon shell. */
  cardIsNavigableLink?: boolean;
    standaloneStrip?: boolean;
  /** Base ListofLinks two-column rail: **40×40** icon circle (default base uses 32 / 48 by breakpoint). */
  sidebarListRailIcon40?: boolean;
}

function imageHasSrc(image: QuickLinkFields['Image']): boolean {
  const src = image?.value?.src;
  return typeof src === 'string' && src.trim().length > 0;
}

/** FA webfont scaled via `text-*`; SVG glyphs need {@link CHROME_ICON_SIZE_EM} on the same node. */
function renderQuickLinkFaIcon(faClass: string, toneClass: string): JSX.Element | null {
  if (!faClass) return null;
  return renderChromeIconFromFaClass(
    faClass,
    cn(CHROME_ICON_BASE, CHROME_ICON_SIZE_EM, toneClass),
  );
}

/**
 * Circular icon shell: custom `Image` field or Font Awesome class from CMS icon key.
 *
 * @param props - Resolved fields, layout variant, resolved icon key, and editing flag.
 * @returns Icon shell markup or `null` when no image or icon applies.
 */
export function QuickLinkIcon({
  fields,
  cardType,
  iconPosition = 'center',
  iconCmsKey,
  isEditing,
  cardIsNavigableLink = false,
  standaloneStrip = false,
  sidebarListRailIcon40 = false,
}: QuickLinkIconProps): JSX.Element | null {
  const { Image: imageField } = fields;
  const hasImg = imageHasSrc(imageField);
  const showImageSlot = hasImg || Boolean(isEditing && imageField);
  const faClass = iconCmsKey ? cmsIconToFontAwesome(iconCmsKey) : '';
  const showFa = Boolean(faClass) && !showImageSlot;

  if (!showImageSlot && !showFa) {
    return null;
  }

  const imageSizes =
    sidebarListRailIcon40 && cardType === 'base' ? '40px'
    : cardType === 'card' ? '(max-width:767px) 32px, 48px'
    : '(max-width:767px) 32px, 64px';

  if (showImageSlot && imageField) {
    if (cardType === 'card' && standaloneStrip) {
      return (
        <div
          className={cn(
            'relative isolate box-border m-0 min-h-0 w-full min-w-0 flex-1 shrink-0 overflow-hidden p-0 leading-none [-webkit-tap-highlight-color:transparent]',
            'max-[599px]:flex max-[599px]:h-full max-[599px]:min-h-[16rem] max-[599px]:w-full',
            'min-[600px]:flex min-[600px]:h-full min-[600px]:items-center min-[600px]:justify-center min-[600px]:bg-transparent',
            cardIsNavigableLink ? 'cursor-pointer' : 'cursor-default',
          )}
        >
          <div className="max-[599px]:block max-[599px]:h-full max-[599px]:w-full min-[600px]:hidden">
            {hasImg ?
              <ImageView
                image={imageField}
                objectFit="cover"
                cropWidth={QUICK_LINK_STANDALONE_MOBILE_CROP_WIDTH}
                className="h-full w-full"
                imageClass="object-center"
              />
            : <div className="relative h-full min-h-[16rem] w-full">
                <NextImage
                  field={imageField}
                  fill
                  sizes="100vw"
                  className="rounded-none object-cover object-center border-0 [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent]"
                />
              </div>}
          </div>
          <div
            className={cn(
              'absolute inset-0 box-border m-0 hidden max-w-full overflow-x-clip overflow-y-clip rounded-none border-0 p-0 [-webkit-tap-highlight-color:transparent]',
              'min-[600px]:block',
              cardIsNavigableLink ? 'cursor-pointer' : 'cursor-default',
            )}
          >
            <NextImage
              field={imageField}
              fill
              sizes="224px"
              className={cn(
                'rounded-none object-cover object-center border-0 [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent]',
                cardIsNavigableLink ? 'cursor-pointer' : 'cursor-default',
              )}
            />
          </div>
        </div>
      );
    }

    if (cardType === 'card') {
      return (
        <div className={cn(
            iconPosition === 'center' && [
              'relative isolate box-border mx-auto shrink-0 overflow-hidden rounded-full bg-surface-muted leading-none text-ink-secondary',
              'max-md:h-8 max-md:w-8 max-md:max-w-full max-md:p-0',
              'md:m-0 md:h-12 md:w-12 md:max-w-full md:shrink-0 md:overflow-x-clip md:overflow-y-clip md:p-0 md:rounded-full md:text-center md:text-base md:leading-6 md:font-media-tile md:text-ink-muted md:[unicode-bidi:isolate] md:[-webkit-tap-highlight-color:transparent] md:antialiased md:align-middle md:border-0 md:border-solid md:border-stroke-default',
              cardIsNavigableLink ? 'md:cursor-pointer' : 'md:cursor-default',
              'lg:mx-auto lg:my-0 lg:h-12 lg:w-12 lg:max-w-full lg:overflow-hidden lg:p-0 lg:rounded-full lg:bg-surface-muted lg:text-ink-muted lg:text-center lg:text-base lg:font-media-tile lg:[unicode-bidi:isolate] lg:[-webkit-tap-highlight-color:transparent] lg:border-0 lg:border-solid lg:border-transparent',
              cardIsNavigableLink ? 'lg:cursor-pointer' : 'lg:cursor-default',
            ],
            iconPosition !== 'center' && [
              'relative isolate box-border mx-0 shrink-0 overflow-hidden rounded-full bg-surface-muted leading-none text-ink-secondary',
              'max-md:h-8 max-md:w-8 max-md:max-w-full max-md:p-0',
              'md:m-0 md:h-12 md:w-12 md:max-w-full md:shrink-0 md:overflow-x-clip md:overflow-y-clip md:p-0 md:rounded-full md:text-center md:text-base md:leading-6 md:font-media-tile md:text-ink-muted md:[unicode-bidi:isolate] md:[-webkit-tap-highlight-color:transparent] md:antialiased md:align-middle md:border-0 md:border-solid md:border-stroke-default',
              cardIsNavigableLink ? 'md:cursor-pointer' : 'md:cursor-default',
              'lg:mx-0 lg:my-0 lg:h-12 lg:w-12 lg:max-w-full lg:overflow-hidden lg:p-0 lg:rounded-full lg:bg-surface-muted lg:text-ink-muted lg:text-center lg:text-base lg:font-media-tile lg:[unicode-bidi:isolate] lg:[-webkit-tap-highlight-color:transparent] lg:border-0 lg:border-solid lg:border-transparent',
              cardIsNavigableLink ? 'lg:cursor-pointer' : 'lg:cursor-default',
            ],
          )}>
          <div
            className={cn(
              'absolute inset-0 box-border m-0 block max-w-full overflow-x-clip overflow-y-clip rounded-full border-0 border-solid border-stroke-default p-0 text-center align-middle leading-6 text-ink-muted [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent]',
              cardIsNavigableLink ? 'cursor-pointer' : 'cursor-default',
            )}
          >
            <NextImage
              field={imageField}
              fill
              sizes={imageSizes}
              className={cn(
                'rounded-full object-cover object-center border-0 [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent]',
                cardIsNavigableLink ? 'cursor-pointer' : 'cursor-default',
              )}
            />
          </div>
        </div>
      );
    }
    return (
      <div className={cn(
        'relative isolate box-border shrink-0 overflow-hidden rounded-full bg-surface-muted leading-none',
        iconPosition === 'center' ? 'mx-auto' : 'mx-0',
        'h-10 w-10 max-w-full shrink-0 p-0 border-0 border-solid border-transparent',
        sidebarListRailIcon40 ?
          'md:m-0 md:h-10 md:w-10 md:max-w-full md:shrink-0 md:p-0 md:overflow-x-clip md:overflow-y-clip md:border-0 md:border-solid md:border-stroke-default lg:h-10 lg:w-10 lg:max-w-full lg:overflow-hidden lg:p-0 lg:border-0 lg:border-solid lg:border-transparent'
        : 'md:h-16 md:w-16 overflow-x-clip overflow-y-clip',
      )}>
        <NextImage
          field={imageField}
          fill
          sizes={imageSizes}
          className="rounded-full object-cover object-center border-0 [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent]"
        />
      </div>
    );
  }

  if (cardType === 'card') {
    return (
      <div className={cn(
            standaloneStrip && [
              'relative isolate box-border m-0 flex h-full min-h-0 w-full min-w-0 flex-1 shrink-0 items-center justify-center overflow-hidden bg-transparent p-0 leading-none text-ink-inverse [-webkit-tap-highlight-color:transparent]',
              'max-[599px]:min-h-[16rem]',
              cardIsNavigableLink ? 'cursor-pointer' : 'cursor-default',
            ],
            !standaloneStrip && iconPosition === 'center' && [
              'relative isolate box-border mx-auto shrink-0 overflow-hidden rounded-full bg-surface-muted leading-none text-ink-secondary',
              'max-md:h-8 max-md:w-8 max-md:max-w-full max-md:p-0',
              'md:m-0 md:h-12 md:w-12 md:max-w-full md:shrink-0 md:overflow-x-clip md:overflow-y-clip md:p-0 md:rounded-full md:text-center md:text-base md:leading-6 md:font-media-tile md:text-ink-muted md:[unicode-bidi:isolate] md:[-webkit-tap-highlight-color:transparent] md:antialiased md:align-middle md:border-0 md:border-solid md:border-stroke-default',
              cardIsNavigableLink ? 'md:cursor-pointer' : 'md:cursor-default',
              'lg:mx-auto lg:my-0 lg:h-12 lg:w-12 lg:max-w-full lg:overflow-hidden lg:p-0 lg:rounded-full lg:bg-surface-muted lg:text-ink-muted lg:text-center lg:text-base lg:font-media-tile lg:[unicode-bidi:isolate] lg:[-webkit-tap-highlight-color:transparent] lg:border-0 lg:border-solid lg:border-transparent',
              cardIsNavigableLink ? 'lg:cursor-pointer' : 'lg:cursor-default',
            ],
            !standaloneStrip && iconPosition !== 'center' && [
              'relative isolate box-border mx-0 shrink-0 overflow-hidden rounded-full bg-surface-muted leading-none text-ink-secondary',
              'max-md:h-8 max-md:w-8 max-md:max-w-full max-md:p-0',
              'md:m-0 md:h-12 md:w-12 md:max-w-full md:shrink-0 md:overflow-x-clip md:overflow-y-clip md:p-0 md:rounded-full md:text-center md:text-base md:leading-6 md:font-media-tile md:text-ink-muted md:[unicode-bidi:isolate] md:[-webkit-tap-highlight-color:transparent] md:antialiased md:align-middle md:border-0 md:border-solid md:border-stroke-default',
              cardIsNavigableLink ? 'md:cursor-pointer' : 'md:cursor-default',
              'lg:mx-0 lg:my-0 lg:h-12 lg:w-12 lg:max-w-full lg:overflow-hidden lg:p-0 lg:rounded-full lg:bg-surface-muted lg:text-ink-muted lg:text-center lg:text-base lg:font-media-tile lg:[unicode-bidi:isolate] lg:[-webkit-tap-highlight-color:transparent] lg:border-0 lg:border-solid lg:border-transparent',
              cardIsNavigableLink ? 'lg:cursor-pointer' : 'lg:cursor-default',
            ],
          )}>
        <span className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 leading-none">
          {renderQuickLinkFaIcon(
            faClass,
            cn(
              'm-0 border-0 p-0 text-center font-media-tile not-italic antialiased leading-none [-webkit-tap-highlight-color:transparent]',
              standaloneStrip ?
                'text-ink-inverse max-[599px]:text-[3rem] min-[600px]:text-[1.75rem]'
              : 'text-base text-ink-muted md:text-base md:text-ink-muted lg:text-xl lg:text-ink-muted',
            ),
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
        'relative isolate box-border shrink-0 overflow-hidden rounded-full bg-surface-muted leading-none',
        iconPosition === 'center' ? 'mx-auto' : 'mx-0',
        'h-10 w-10 max-w-full shrink-0 p-0 border-0 border-solid border-transparent',
        sidebarListRailIcon40 ?
          'md:m-0 md:h-10 md:w-10 md:max-w-full md:shrink-0 md:p-0 md:overflow-x-clip md:overflow-y-clip md:border-0 md:border-solid md:border-stroke-default lg:h-10 lg:w-10 lg:max-w-full lg:overflow-hidden lg:p-0 lg:border-0 lg:border-solid lg:border-transparent'
        : 'md:h-16 md:w-16 overflow-x-clip overflow-y-clip',
      )}>
      <span className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 leading-none">
        {renderQuickLinkFaIcon(
          faClass,
          cn(
            'm-0 border-0 p-0 text-center font-media-tile not-italic antialiased leading-none [-webkit-tap-highlight-color:transparent]',
            sidebarListRailIcon40 ?
              'text-font-large text-ink-muted'
            : 'text-font-media-tile-eyebrow md:text-font-extrabig text-ink-muted',
          ),
        )}
      </span>
    </div>
  );
}
