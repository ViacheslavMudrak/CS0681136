import { JSX } from 'react';
import { Link as ContentSdkLink, Text, type TextField } from '@sitecore-content-sdk/nextjs';
import type { QuickLinkLabels } from 'lib/quick-link-i18n';
import { CHROME_ICON_SLOT_16PX } from 'lib/chrome-icons';
import { cn } from 'lib/utils';
import { QUICK_LINK_GROUP_LABELS } from 'components/quick-link-group/quickLinkGroupUtils';
import { UI_ICONS } from 'components/navigation/partial/NavigationIcons';
import MediaCardView from 'components/shared/MediaCardView';

import type { QuickLinkFields } from '../QuickLink.type';
import {
  quickLinkHasIconVisual,
  quickLinkSectionAriaLabel,
  resolveQuickLinkCardType,
  resolveQuickLinkIconKey,
  resolveQuickLinkIconPosition,
  resolveQuickLinkStandalone,
} from '../quickLinkUtils';
import {
  QuickLinkDescription,
  QuickLinkIcon,
  QuickLinkTitle,
} from './QuickLinkPartials';

export interface QuickLinkTileProps {
  resolvedFields: QuickLinkFields;
  paramsRecord: Record<string, unknown>;
  isEditing: boolean;
  labels: QuickLinkLabels;
  /** Case-study sidebar rail: blue link tokens on base + left icon layout. */
  caseStudyRailTypography?: boolean;
  /** Questions rail only: black/gray contact link tone (Downloads keeps blue). */
  contactRailLinkTone?: boolean;
}

function quickLinkTileSubtreeProvidesLinkName(fields: QuickLinkFields): boolean {
  const title = typeof fields.Title?.value === 'string' ? fields.Title.value.trim() : '';
  if (title.length > 0) return true;
  const linkText =
    typeof fields.Link?.value?.text === 'string' ? fields.Link.value.text.trim() : '';
  if (linkText.length > 0) return true;
  const desc = fields.Description?.value;
  if (desc === undefined || desc === null) return false;
  const plain = String(desc).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length > 0;
}

/**
 * Inner markup for one Quick Link (icon + title + description), shared by {@link QuickLink} and QuickLinkGroup.
 * Does not render the outer `section` / list chrome — only the link or static row inside `component-content`.
 */
export function QuickLinkTile({
  resolvedFields,
  paramsRecord,
  isEditing,
  labels,
  caseStudyRailTypography = false,
  contactRailLinkTone = false,
}: QuickLinkTileProps): JSX.Element {
  const cardType = resolveQuickLinkCardType(paramsRecord);
  const iconPosition = resolveQuickLinkIconPosition(cardType, paramsRecord);
  const standaloneCard = cardType === 'card' && resolveQuickLinkStandalone(paramsRecord);
  const textLayoutIconPosition = standaloneCard ? 'left' : iconPosition;
  const fullWidthBaseLeftRow =
    caseStudyRailTypography && cardType === 'base' && iconPosition === 'left';

  const iconKey = resolveQuickLinkIconKey(resolvedFields, paramsRecord);

  const cardTitleLinkHref = resolvedFields.Link?.value?.href;
  const cardTitleHasHref =
    typeof cardTitleLinkHref === 'string' && cardTitleLinkHref.trim().length > 0;
  const isCardLink = cardType === 'card' && cardTitleHasHref && !isEditing;
  const isBaseLink = cardType === 'base' && cardTitleHasHref && !isEditing;
  const baseLinkTarget = resolvedFields.Link?.value?.target;
  const sdkLinkField = (isCardLink || isBaseLink) && resolvedFields.Link ? resolvedFields.Link : undefined;

  const aria = quickLinkSectionAriaLabel(
    resolvedFields.Title?.value,
    resolvedFields.Link?.value?.text,
    labels.emptyHint,
  );
  const tileLinkAriaProps =
    sdkLinkField && quickLinkTileSubtreeProvidesLinkName(resolvedFields) ?
      {}
    : sdkLinkField ?
      { 'aria-label': aria }
    : {};
  const caseStudyRailHasIcon =
    caseStudyRailTypography &&
    quickLinkHasIconVisual(resolvedFields, paramsRecord, isEditing);

  const iconNode = (
    <QuickLinkIcon
      fields={resolvedFields}
      cardType={cardType}
      iconPosition={iconPosition}
      iconCmsKey={iconKey}
      isEditing={isEditing}
      cardIsNavigableLink={isCardLink}
      standaloneStrip={standaloneCard}
      sidebarListRailIcon40={caseStudyRailTypography}
    />
  );

  const descriptionBlock = (
    <QuickLinkDescription
      descriptionField={resolvedFields.Description}
      isEditing={isEditing}
      cardType={cardType}
      iconPosition={textLayoutIconPosition}
      cardTitleHasHref={cardTitleHasHref}
      bodyClassNameOverride={
        caseStudyRailTypography ?
          'box-border min-h-[38.5px] max-[599px]:min-h-0 h-auto min-w-0 max-w-full cursor-default text-left font-media-tile text-font-media-tile-eyebrow font-normal leading-[19.25px] text-ink-primary [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] [&_p]:m-0 [&_p]:text-font-media-tile-eyebrow [&_p]:font-normal [&_p]:leading-[19.25px] [&_p]:text-ink-primary'
        : undefined
      }
      alignmentClassOverride={caseStudyRailTypography ? 'text-left' : undefined}
      standaloneRail={standaloneCard}
      railTightDescriptionMax430={caseStudyRailTypography}
    />
  );

  const quickLinkCardMediaElement =
    standaloneCard ?
      <div className="flex shrink-0 flex-col self-stretch bg-quick-link-icon-rail max-[599px]:min-h-[16rem] max-[599px]:w-full max-[599px]:max-w-none min-[600px]:w-[224px] min-[600px]:min-w-0 min-[600px]:max-w-[224px] min-[600px]:min-h-0 min-[600px]:h-auto">
        {iconNode}
      </div>
    : iconNode;

  const titleDescription = (
    <div
      className={cn(
        cardType === 'base' && caseStudyRailTypography && (iconPosition === 'top' || iconPosition === 'center') && 'min-w-0 flex w-full max-w-full flex-col items-start gap-1 text-left',
        cardType === 'card' && standaloneCard && 'flex min-h-0 min-w-0 flex-1 flex-col justify-start gap-0 overflow-visible bg-surface p-6 text-left max-[599px]:justify-start min-[600px]:justify-center',
        cardType === 'card' && !standaloneCard && iconPosition === 'center' && 'flex min-w-0 w-full max-w-full flex-col items-center gap-0',
        cardType === 'card' && !standaloneCard && iconPosition === 'top' && 'flex min-w-0 w-full max-w-full flex-col items-start gap-0',
        cardType === 'card' && !standaloneCard && iconPosition === 'left' && 'flex min-w-0 min-h-0 flex-1 flex-col items-start gap-0 overflow-visible md:max-w-full',
        cardType === 'base' && iconPosition === 'left' && 'min-w-0 flex min-h-0 flex-1 flex-col items-start justify-center gap-0 overflow-visible self-stretch',
        cardType === 'base' && iconPosition === 'center' && 'min-w-0 flex w-full max-w-full flex-col items-center gap-0 text-center overflow-visible',
        cardType === 'base' && iconPosition === 'top' && 'min-w-0 flex w-full max-w-full flex-col items-start gap-0 overflow-visible',
      )}
    >
      <QuickLinkTitle
        titleField={resolvedFields.Title}
        linkField={resolvedFields.Link}
        cardType={cardType}
        iconPosition={textLayoutIconPosition}
        isEditing={isEditing}
        cardTitleHasHref={cardTitleHasHref}
        isCardWrappedAsLink={Boolean(sdkLinkField)}
        standaloneRail={standaloneCard}
        linkAriaFallback={labels.linkAriaFallback}
      />
      {descriptionBlock}
    </div>
  );

  if (
    !caseStudyRailTypography &&
    cardType === 'base' &&
    cardTitleHasHref &&
    resolvedFields.Link &&
    isEditing
  ) {
    const linkText =
      resolvedFields.Link?.value?.text?.trim() || labels.linkAriaFallback || QUICK_LINK_GROUP_LABELS.learnMoreFallback;

    return (
      <div
        className={cn(
          iconPosition === 'left' &&
            'box-border flex w-full max-w-full min-w-0 flex-row flex-nowrap items-start justify-start gap-3 md:gap-4 px-0 py-0 h-auto min-h-0 text-left',
          (iconPosition === 'center' || iconPosition === 'top') &&
            cn(
              'box-border flex w-full max-w-full min-w-0 flex-col flex-nowrap justify-start gap-2 md:gap-4 px-0 py-0 min-h-[124px] h-auto',
              iconPosition === 'center' ? 'items-center text-center' : 'items-start text-left',
            ),
          'rounded-sm',
        )}
      >
        <div className="shrink-0">{iconNode}</div>
        <div
          className={cn(
            iconPosition === 'left' &&
              'min-w-0 flex min-h-0 flex-1 flex-col items-start justify-center gap-0 overflow-visible self-stretch',
            (iconPosition === 'center' || iconPosition === 'top') &&
              cn(
                'min-w-0 flex w-full max-w-full flex-col gap-0 overflow-visible',
                iconPosition === 'center' ? 'items-center text-center' : 'items-start',
              ),
          )}
        >
          {(resolvedFields.Title?.value || isEditing) && (
            <Text
              field={resolvedFields.Title as TextField}
              tag="h2"
              className="m-0 font-bold text-ink-primary text-font-large leading-[24.75px]"
              style={{ margin: 0 }}
            />
          )}
          {descriptionBlock}
          <ContentSdkLink
            field={resolvedFields.Link}
            className="mt-2 inline-flex w-fit max-w-full items-center gap-0 justify-start leading-[24px] text-link transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none hover:text-link-strong"
          >
            <span className="text-current font-normal text-font-normal leading-[24px]">{linkText}</span>
            <span
              className={cn(
                'inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center overflow-hidden leading-none text-current',
                CHROME_ICON_SLOT_16PX,
              )}
              aria-hidden="true"
            >
              {UI_ICONS.chevronRight}
            </span>
          </ContentSdkLink>
        </div>
      </div>
    );
  }

  if (
    !caseStudyRailTypography &&
    cardType === 'base' &&
    isBaseLink &&
    sdkLinkField &&
    !isEditing
  ) {
    const linkText =
      resolvedFields.Link?.value?.text?.trim() || labels.linkAriaFallback || QUICK_LINK_GROUP_LABELS.learnMoreFallback;

    return (
      <ContentSdkLink
        field={sdkLinkField}
        aria-label={aria}
        className={cn(
          iconPosition === 'left' &&
            'box-border flex w-full max-w-full min-w-0 flex-row flex-nowrap items-start justify-start gap-3 md:gap-4 px-0 py-0 h-auto min-h-0 text-left',
          (iconPosition === 'center' || iconPosition === 'top') &&
            cn(
              'box-border flex w-full max-w-full min-w-0 flex-col flex-nowrap justify-start gap-2 md:gap-4 px-0 py-0 min-h-[124px] h-auto',
              iconPosition === 'center' ? 'items-center text-center' : 'items-start text-left',
            ),
          'group cursor-pointer no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 rounded-sm',
        )}
        target={baseLinkTarget || undefined}
        rel={baseLinkTarget === '_blank' ? 'noopener noreferrer' : undefined}
      >
        <div className="shrink-0">
          {iconNode}
        </div>
        <div
          className={cn(
            iconPosition === 'left' &&
              'min-w-0 flex min-h-0 flex-1 flex-col items-start justify-center gap-0 overflow-visible self-stretch',
            (iconPosition === 'center' || iconPosition === 'top') &&
              cn(
                'min-w-0 flex w-full max-w-full flex-col gap-0 overflow-visible',
                iconPosition === 'center' ? 'items-center text-center' : 'items-start',
              ),
          )}
        >
          {resolvedFields.Title?.value && (
            <Text
              field={resolvedFields.Title as TextField}
              tag="h2"
              className="m-0 font-bold text-ink-primary text-font-large leading-[24.75px]"
              style={{ margin: 0 }}
            />
          )}
          {descriptionBlock}
          <span
            className="mt-2 inline-flex w-fit max-w-full items-center gap-0 justify-start leading-[24px] text-link transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none group-hover:text-link-strong"
          >
            <span className="text-current font-normal text-font-normal leading-[24px]">{linkText}</span>
            <span
              className={cn(
                'inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center overflow-hidden leading-none text-current',
                CHROME_ICON_SLOT_16PX,
              )}
              aria-hidden="true"
            >
              {UI_ICONS.chevronRight}
            </span>
          </span>
        </div>
      </ContentSdkLink>
    );
  }

  if (
    caseStudyRailTypography &&
    !standaloneCard &&
    resolvedFields.Link &&
    (isEditing || cardTitleHasHref)
  ) {
    const railLinkField = resolvedFields.Link;
    const titleTrim =
      resolvedFields.Title?.value != null ?
        String(resolvedFields.Title.value).trim()
      : '';
    const linkTextTrim =
      resolvedFields.Link?.value?.text != null ?
        String(resolvedFields.Link.value.text).trim()
      : '';
    const titleFieldForLink: TextField =
      titleTrim.length > 0 ?
        (resolvedFields.Title as TextField)
      : ({ value: linkTextTrim || ' ' } as TextField);

    const railLinkCommonProps = {
      field: railLinkField,
      editable: isEditing,
      showLinkTextWithChildrenPresent: false as const,
      ...(linkTextTrim.length > 0 || titleTrim.length > 0 ? {} : { 'aria-label': aria }),
      target: baseLinkTarget || undefined,
      rel: baseLinkTarget === '_blank' ? ('noopener noreferrer' as const) : undefined,
    };

    const railLinkLabel = (
      <Text
        field={titleFieldForLink}
        tag="span"
        className={cn(
          'min-w-0',
          contactRailLinkTone ? 'font-bold text-current no-underline' : 'font-normal text-current',
        )}
      />
    );

    if (!caseStudyRailHasIcon) {
      return (
        <div className="box-border flex h-auto min-h-0 w-full min-w-0 max-w-full flex-col gap-y-0 px-0 py-0 text-left">
          <ContentSdkLink
            {...railLinkCommonProps}
            className={cn(
              'block w-full min-w-0',
              contactRailLinkTone
                ? 'box-border m-0 inline-flex h-auto min-h-0 w-fit max-w-full shrink-0 cursor-pointer list-none items-center self-start rounded-xs border-0 p-0 font-media-tile text-font-medium font-bold leading-[24px] text-ink-primary no-underline [-webkit-tap-highlight-color:transparent] transition-colors duration-150 ease-in-out motion-reduce:transition-none hover:text-ink-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-offset-0'
                : 'box-border m-0 inline-flex h-auto min-h-0 min-w-0 flex-1 cursor-pointer list-none rounded-xs border-0 p-0 font-media-tile text-font-medium font-normal leading-[24px] text-link underline decoration-solid [text-decoration-color:var(--color-link)] [text-decoration-thickness:auto] [-webkit-tap-highlight-color:transparent] transition-[color,text-decoration-color] duration-150 ease-in-out motion-reduce:transition-none hover:text-link-alt hover:[text-decoration-color:var(--color-link-alt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-offset-0',
            )}
          >
            {railLinkLabel}
          </ContentSdkLink>
          {descriptionBlock ? <div className="min-w-0">{descriptionBlock}</div> : null}
        </div>
      );
    }

    return (
      <div className="box-border grid h-auto min-h-0 w-full min-w-0 max-w-full grid-cols-[auto_1fr] gap-x-2 gap-y-0 px-0 py-0 text-left">
        <ContentSdkLink
          {...railLinkCommonProps}
          className={cn(
            'col-span-2 grid w-full grid-cols-[auto_1fr] items-center gap-x-2',
            contactRailLinkTone
              ? 'box-border m-0 inline-flex h-auto min-h-0 w-fit max-w-full shrink-0 cursor-pointer list-none items-center self-start rounded-xs border-0 p-0 font-media-tile text-font-medium font-bold leading-[24px] text-ink-primary no-underline [-webkit-tap-highlight-color:transparent] transition-colors duration-150 ease-in-out motion-reduce:transition-none hover:text-ink-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-offset-0'
              : 'box-border m-0 inline-flex h-auto min-h-0 min-w-0 flex-1 cursor-pointer list-none rounded-xs border-0 p-0 font-media-tile text-font-medium font-normal leading-[24px] text-link underline decoration-solid [text-decoration-color:var(--color-link)] [text-decoration-thickness:auto] [-webkit-tap-highlight-color:transparent] transition-[color,text-decoration-color] duration-150 ease-in-out motion-reduce:transition-none hover:text-link-alt hover:[text-decoration-color:var(--color-link-alt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-offset-0',
          )}
        >
          <span className="shrink-0">{iconNode}</span>
          {railLinkLabel}
        </ContentSdkLink>
        {descriptionBlock ?
          <div className="col-start-2 min-w-0">{descriptionBlock}</div>
        : null}
      </div>
    );
  }

  if (cardType === 'card') {
    const cardLinkField = resolvedFields.Link ?? { value: {} };

    if (isEditing || cardTitleHasHref) {
      return (
        <MediaCardView
          link={cardLinkField}
          isEditing={isEditing}
          contentPadding="none"
          className={cn(
            standaloneCard && [
              'box-border flex w-full max-w-full min-w-0 flex-col flex-nowrap items-stretch overflow-hidden p-0',
              'max-[599px]:min-h-[16rem]',
              'min-[600px]:min-h-[5.5rem] min-[600px]:flex-row',
              'rounded-md border border-solid border-stroke-default bg-surface',
              'shadow-quick-link-card transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
              isCardLink ? 'hover:shadow-quick-link-card-hover cursor-pointer' : 'cursor-default',
              'text-left',
              '[-webkit-tap-highlight-color:transparent]',
            ],
            !standaloneCard && iconPosition === 'left' && [
              'flex flex-row flex-nowrap justify-start gap-2 items-start text-left',
              'box-border mx-auto my-0 min-w-0 w-[358px] max-w-full min-h-[171.75px] h-auto p-6',
              'min-[600px]:max-[767px]:w-[272px] min-[600px]:max-[767px]:max-w-full',
              'leading-6 text-ink-muted font-media-tile',
              '[-webkit-tap-highlight-color:transparent]',
              'rounded-lg border border-solid border-stroke-default bg-surface',
              'group shadow-quick-link-card transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
              isCardLink ? 'cursor-pointer' : 'cursor-default',
              'md:mx-auto md:my-0 md:min-h-[187.75px] md:h-auto md:w-[356px] md:max-w-full md:min-w-0 md:shrink-0 md:p-6 md:gap-2 md:items-start md:text-left md:leading-6 md:font-media-tile',
              isCardLink ? 'md:cursor-pointer' : 'md:cursor-default',
              'lg:w-[468px] lg:min-h-[187.75px] lg:h-auto lg:p-6 lg:leading-6 lg:font-media-tile lg:gap-2 lg:items-start lg:text-left',
              isCardLink ? 'lg:cursor-pointer' : 'lg:cursor-default',
              'xl:w-[572px] xl:gap-2 xl:items-start xl:text-left',
            ],
            !standaloneCard && iconPosition === 'top' && [
              'flex flex-col justify-start gap-2 items-start text-left',
              'box-border mx-auto my-0 min-w-0 w-[358px] max-w-full min-h-[171.75px] h-auto p-6',
              'min-[600px]:max-[767px]:w-[272px] min-[600px]:max-[767px]:max-w-full',
              'leading-6 text-ink-muted font-media-tile',
              '[-webkit-tap-highlight-color:transparent]',
              'rounded-lg border border-solid border-stroke-default bg-surface',
              'group shadow-quick-link-card transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
              isCardLink ? 'cursor-pointer' : 'cursor-default',
              'md:mx-auto md:my-0 md:min-h-[187.75px] md:h-auto md:w-[356px] md:max-w-full md:min-w-0 md:shrink-0 md:p-6 md:gap-2 md:items-start md:text-left md:leading-6 md:font-media-tile',
              isCardLink ? 'md:cursor-pointer' : 'md:cursor-default',
              'lg:w-[468px] lg:min-h-[187.75px] lg:h-auto lg:p-6 lg:leading-6 lg:font-media-tile lg:gap-2 lg:items-start lg:text-left',
              isCardLink ? 'lg:cursor-pointer' : 'lg:cursor-default',
              'xl:w-[572px] xl:gap-2 xl:items-start xl:text-left',
            ],
            !standaloneCard && iconPosition === 'center' && [
              'flex flex-col justify-start gap-2 items-center text-center',
              'box-border mx-auto my-0 min-w-0 w-[358px] max-w-full min-h-[171.75px] h-auto p-6',
              'min-[600px]:max-[767px]:w-[272px] min-[600px]:max-[767px]:max-w-full',
              'leading-6 text-ink-muted font-media-tile',
              '[-webkit-tap-highlight-color:transparent]',
              'rounded-lg border border-solid border-stroke-default bg-surface',
              'group shadow-quick-link-card transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
              isCardLink ? 'cursor-pointer' : 'cursor-default',
              'md:mx-auto md:my-0 md:min-h-[187.75px] md:h-auto md:w-[356px] md:max-w-full md:min-w-0 md:shrink-0 md:p-6 md:gap-2 md:items-center md:text-center md:leading-6 md:font-media-tile',
              isCardLink ? 'md:cursor-pointer' : 'md:cursor-default',
              'lg:w-[468px] lg:min-h-[187.75px] lg:h-auto lg:p-6 lg:leading-6 lg:font-media-tile lg:gap-2 lg:items-center lg:text-center',
              isCardLink ? 'lg:cursor-pointer' : 'lg:cursor-default',
              'xl:w-[572px] xl:gap-2 xl:items-center xl:text-center',
            ],
            'group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 no-underline',
          )}
          mediaElement={quickLinkCardMediaElement}
          {...tileLinkAriaProps}
          target={isCardLink ? '_self' : baseLinkTarget || undefined}
          rel={isBaseLink && baseLinkTarget === '_blank' ? 'noopener noreferrer' : undefined}
        >
          {titleDescription}
        </MediaCardView>
      );
    }

    return (
      <div
        className={cn(
          standaloneCard && [
            'box-border flex w-full max-w-full min-w-0 flex-col flex-nowrap items-stretch overflow-hidden p-0',
            'max-[599px]:min-h-[16rem]',
            'min-[600px]:min-h-[5.5rem] min-[600px]:flex-row',
            'rounded-md border border-solid border-stroke-default bg-surface',
            'shadow-quick-link-card transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
            isCardLink ? 'hover:shadow-quick-link-card-hover cursor-pointer' : 'cursor-default',
            'text-left',
            '[-webkit-tap-highlight-color:transparent]',
          ],
          !standaloneCard && iconPosition === 'left' && [
            'flex flex-row flex-nowrap justify-start gap-2 items-start text-left',
            'box-border mx-auto my-0 min-w-0 w-[358px] max-w-full min-h-[171.75px] h-auto p-6',
            'min-[600px]:max-[767px]:w-[272px] min-[600px]:max-[767px]:max-w-full',
            'leading-6 text-ink-muted font-media-tile',
            '[-webkit-tap-highlight-color:transparent]',
            'rounded-lg border border-solid border-stroke-default bg-surface',
            'group shadow-quick-link-card transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
            isCardLink ? 'cursor-pointer' : 'cursor-default',
            'md:mx-auto md:my-0 md:min-h-[187.75px] md:h-auto md:w-[356px] md:max-w-full md:min-w-0 md:shrink-0 md:p-6 md:gap-2 md:items-start md:text-left md:leading-6 md:font-media-tile',
            isCardLink ? 'md:cursor-pointer' : 'md:cursor-default',
            'lg:w-[468px] lg:min-h-[187.75px] lg:h-auto lg:p-6 lg:leading-6 lg:font-media-tile lg:gap-2 lg:items-start lg:text-left',
            isCardLink ? 'lg:cursor-pointer' : 'lg:cursor-default',
            'xl:w-[572px] xl:gap-2 xl:items-start xl:text-left',
          ],
          !standaloneCard && iconPosition === 'top' && [
            'flex flex-col justify-start gap-2 items-start text-left',
            'box-border mx-auto my-0 min-w-0 w-[358px] max-w-full min-h-[171.75px] h-auto p-6',
            'min-[600px]:max-[767px]:w-[272px] min-[600px]:max-[767px]:max-w-full',
            'leading-6 text-ink-muted font-media-tile',
            '[-webkit-tap-highlight-color:transparent]',
            'rounded-lg border border-solid border-stroke-default bg-surface',
            'group shadow-quick-link-card transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
            isCardLink ? 'cursor-pointer' : 'cursor-default',
            'md:mx-auto md:my-0 md:min-h-[187.75px] md:h-auto md:w-[356px] md:max-w-full md:min-w-0 md:shrink-0 md:p-6 md:gap-2 md:items-start md:text-left md:leading-6 md:font-media-tile',
            isCardLink ? 'md:cursor-pointer' : 'md:cursor-default',
            'lg:w-[468px] lg:min-h-[187.75px] lg:h-auto lg:p-6 lg:leading-6 lg:font-media-tile lg:gap-2 lg:items-start lg:text-left',
            isCardLink ? 'lg:cursor-pointer' : 'lg:cursor-default',
            'xl:w-[572px] xl:gap-2 xl:items-start xl:text-left',
          ],
          !standaloneCard && iconPosition === 'center' && [
            'flex flex-col justify-start gap-2 items-center text-center',
            'box-border mx-auto my-0 min-w-0 w-[358px] max-w-full min-h-[171.75px] h-auto p-6',
            'min-[600px]:max-[767px]:w-[272px] min-[600px]:max-[767px]:max-w-full',
            'leading-6 text-ink-muted font-media-tile',
            '[-webkit-tap-highlight-color:transparent]',
            'rounded-lg border border-solid border-stroke-default bg-surface',
            'group shadow-quick-link-card transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
            isCardLink ? 'cursor-pointer' : 'cursor-default',
            'md:mx-auto md:my-0 md:min-h-[187.75px] md:h-auto md:w-[356px] md:max-w-full md:min-w-0 md:shrink-0 md:p-6 md:gap-2 md:items-center md:text-center md:leading-6 md:font-media-tile',
            isCardLink ? 'md:cursor-pointer' : 'md:cursor-default',
            'lg:w-[468px] lg:min-h-[187.75px] lg:h-auto lg:p-6 lg:leading-6 lg:font-media-tile lg:gap-2 lg:items-center lg:text-center',
            isCardLink ? 'lg:cursor-pointer' : 'lg:cursor-default',
            'xl:w-[572px] xl:gap-2 xl:items-center xl:text-center',
          ],
          'group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 no-underline',
        )}
      >
        {quickLinkCardMediaElement}
        {titleDescription}
      </div>
    );
  }

  const isBaseLeftCompactRow =
    cardType === 'base' &&
    iconPosition === 'left' &&
    (fullWidthBaseLeftRow || caseStudyRailTypography);

  return sdkLinkField ? (
    <ContentSdkLink
      field={sdkLinkField}
      className={cn(
        cardType === 'base' && caseStudyRailTypography && (iconPosition === 'top' || iconPosition === 'center') && 'box-border flex w-full max-w-full min-w-0 flex-col flex-nowrap items-start justify-start gap-2 px-0 py-0 h-auto min-h-0 text-left',
        isBaseLeftCompactRow &&
          'box-border flex w-full max-w-full min-w-0 flex-row flex-nowrap items-center justify-start px-0 py-0 h-auto min-h-0 text-left',
        isBaseLeftCompactRow && caseStudyRailTypography && 'gap-2',
        isBaseLeftCompactRow && !caseStudyRailTypography && 'gap-3 md:gap-4',
        cardType === 'base' && iconPosition === 'left' && !fullWidthBaseLeftRow && !caseStudyRailTypography && 'box-border flex w-full max-w-full min-w-0 flex-row flex-nowrap items-start justify-start gap-3 md:gap-4 px-0 py-0 h-auto min-h-0 text-left',
        cardType === 'base' &&
          (iconPosition === 'center' || iconPosition === 'top') &&
          cn(
            'box-border flex w-full max-w-full min-w-0 flex-col flex-nowrap justify-start gap-2 md:gap-4 px-0 py-0 min-h-[124px] h-auto',
            iconPosition === 'center' ? 'items-center text-center' : 'items-start text-left',
          ),
        'group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 no-underline',
      )}
      {...tileLinkAriaProps}
      target={baseLinkTarget || undefined}
      rel={isBaseLink && baseLinkTarget === '_blank' ? 'noopener noreferrer' : undefined}
    >
      {iconNode}
      {titleDescription}
    </ContentSdkLink>
  ) : (
    <div
      className={cn(
        cardType === 'base' && caseStudyRailTypography && (iconPosition === 'top' || iconPosition === 'center') && 'box-border flex w-full max-w-full min-w-0 flex-col flex-nowrap items-start justify-start gap-2 px-0 py-0 h-auto min-h-0 text-left',
        isBaseLeftCompactRow &&
          'box-border flex w-full max-w-full min-w-0 flex-row flex-nowrap items-center justify-start px-0 py-0 h-auto min-h-0 text-left',
        isBaseLeftCompactRow && caseStudyRailTypography && 'gap-2',
        isBaseLeftCompactRow && !caseStudyRailTypography && 'gap-3 md:gap-4',
        cardType === 'base' && iconPosition === 'left' && !fullWidthBaseLeftRow && !caseStudyRailTypography && 'box-border flex w-full max-w-full min-w-0 flex-row flex-nowrap items-start justify-start gap-3 md:gap-4 px-0 py-0 h-auto min-h-0 text-left',
        cardType === 'base' &&
          (iconPosition === 'center' || iconPosition === 'top') &&
          cn(
            'box-border flex w-full max-w-full min-w-0 flex-col flex-nowrap justify-start gap-2 md:gap-4 px-0 py-0 min-h-[124px] h-auto',
            iconPosition === 'center' ? 'items-center text-center' : 'items-start text-left',
          ),
      )}
    >
      {iconNode}
      {titleDescription}
    </div>
  );
}
