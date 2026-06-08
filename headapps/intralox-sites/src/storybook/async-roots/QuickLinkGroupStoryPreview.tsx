import { type CSSProperties, JSX } from 'react';

import { Text, type TextField } from '@sitecore-content-sdk/nextjs';

import { cn } from 'lib/utils';
import LinkView from 'components/callToAction/partial/LinkVIew';
import { QuickLinkTile } from 'components/quick-link/partial/QuickLinkTile';
import {
  QUICK_LINK_TILE_TEST_ID,
  hasQuickLinkVisitorContent,
  mergeQuickLinkRenderingParams,
  quickLinkSectionAriaLabel,
  resolveQuickLinkCardType,
  resolveQuickLinkFields,
  resolveQuickLinkIconPosition,
  resolveQuickLinkStandalone,
} from 'components/quick-link/quickLinkUtils';
import type { QuickLinkGroupProps } from 'components/quick-link-group/QuickLinkGroup.type';
import { QuickLinkGroupAside } from 'components/quick-link-group/partial/QuickLinkGroupAside';
import {
  QUICK_LINK_GROUP_LABELS,
  QUICK_LINK_GROUP_STYLE_TOKEN_ASIDE_PRESS_INQUIRIES,
  parseQuickLinkGroupStyleTokenList,
  resolveContactRailLinkTone,
  resolveQuickLinkGroupColumnCount,
  shouldShowQuickLinkGroupAsideLayout,
  type QuickLinkGroupColumnCount,
} from 'components/quick-link-group/quickLinkGroupUtils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import { storyQuickLinkLabels } from '../storyLabels';
import type { QuickLinkStoryPreviewLabels } from './QuickLinkStoryPreview';

const ROOT_TEST_ID = 'quick-link-group';

export type QuickLinkGroupStoryPreviewProps = QuickLinkGroupProps & {
  labels?: QuickLinkStoryPreviewLabels;
};

export function QuickLinkGroupStoryPreview({
  fields,
  params,
  page,
  rendering,
  labels = storyQuickLinkLabels,
}: QuickLinkGroupStoryPreviewProps): JSX.Element | null {
  const safeParams = params ?? {};
  const { styles } = safeParams;
  const anchorId = renderingAnchorIdProps(safeParams.RenderingIdentifier);
  const isEditing = page?.mode?.isEditing ?? false;
  const paramsRecord = mergeQuickLinkRenderingParams(rendering, safeParams as Record<string, unknown>);
  const styleTokens = parseQuickLinkGroupStyleTokenList(paramsRecord);
  const indentTop = styleTokens.includes('indent-top');
  const indentBottom = styleTokens.includes('indent-bottom');
  const pressInquiriesAside = styleTokens.includes(
    QUICK_LINK_GROUP_STYLE_TOKEN_ASIDE_PRESS_INQUIRIES,
  );

  if (!fields) {
    return (
      <div className={`component quick-link-group ${styles ?? ''}`.trim()} {...anchorId}>
        <div
          className={cn(
            'component-content box-border m-0 min-w-0 w-full max-w-none',
            indentTop && 'pt-12 md:pt-20',
            indentBottom && 'pb-12 md:pb-20',
          )}
        >
          <div className="quick-link-group-outer box-border m-0 w-full min-w-0 max-w-none p-0 [&_.component.quick-link[data-variant=card]]:static [&_.component.quick-link[data-variant=card]]:m-0 [&_.component.quick-link[data-variant=card]]:p-0 [&_.component.quick-link[data-variant=card]>a]:box-border [&_.component.quick-link[data-variant=card]>a]:size-full [&_.component.quick-link[data-variant=card]>a]:max-w-full [&_.component.quick-link[data-variant=card]>a]:min-h-[inherit] [&_.component.quick-link[data-variant=card]>div]:box-border [&_.component.quick-link[data-variant=card]>div]:size-full [&_.component.quick-link[data-variant=card]>div]:max-w-full [&_.component.quick-link[data-variant=card]>div]:min-h-[inherit] [&_.component.quick-link[data-variant=base]]:px-0 [&_[role=list][data-ql-group-layout=sidebar-column]>.component.quick-link]:px-0!">
            <div className="mt-[var(--layout-gutter-inline)] mb-0 box-border px-[var(--layout-gutter-inline)] mx-auto w-full min-w-0 max-w-full">
              <span className="is-empty-hint">{QUICK_LINK_GROUP_LABELS.emptyDatasource}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { QuickLinkItems, QuickLinkCount, Headline, Description } = fields;
  const rawItemsFromQuickLinkItems =
    QuickLinkItems?.filter((item) => item?.fields) ?? [];
  const usedQuickLinkItems = rawItemsFromQuickLinkItems.length > 0;
  const rawItems = usedQuickLinkItems
    ? rawItemsFromQuickLinkItems
    : (fields.ListofLinks?.filter((item) => item?.fields) ?? []);

  const supplementaryLinkCandidates =
    fields.ListofLinks?.filter(
      (item) =>
        item?.fields?.Link &&
        (Boolean(item.fields.Link.value?.href) || isEditing),
    ) ?? [];
  const showSupplementaryLinkList =
    usedQuickLinkItems && supplementaryLinkCandidates.length > 0;

  const columnCount: QuickLinkGroupColumnCount =
    showSupplementaryLinkList && QuickLinkCount?.fields?.Value?.value !== '4'
      ? ((resolveQuickLinkGroupColumnCount(QuickLinkCount) +
          1) as QuickLinkGroupColumnCount)
      : resolveQuickLinkGroupColumnCount(QuickLinkCount);
  const cardType = resolveQuickLinkCardType(paramsRecord);
  const iconPosition = resolveQuickLinkIconPosition(cardType, paramsRecord);
  const standaloneCard = cardType === 'card' && resolveQuickLinkStandalone(paramsRecord);
  const sidebarColumnLayout = !usedQuickLinkItems && cardType === 'base';
  const contactRailLinkTone = resolveContactRailLinkTone(
    sidebarColumnLayout,
    Headline?.value as string | undefined,
  );

  const prepared = rawItems.map((item) => ({
    id: item.id,
    displayName: item.displayName,
    resolved: resolveQuickLinkFields(item.fields!),
  }));

  const visible = prepared.filter((row) =>
    hasQuickLinkVisitorContent(row.resolved, paramsRecord, isEditing),
  );

  const showAsideLayout = shouldShowQuickLinkGroupAsideLayout(
    visible.length,
    isEditing,
    Headline?.value as string | undefined,
    Description?.value as string | undefined,
  );

  if (showAsideLayout) {
    const asideAria =
      String(Headline?.value ?? '').trim() || QUICK_LINK_GROUP_LABELS.asideFallbackAria;

    return (
      <aside
        className={cn(
          `component quick-link-group ${styles ?? ''}`.trim(),
          pressInquiriesAside && 'quick-link-group--press-inquiries',
        )}
        {...anchorId}
        aria-label={asideAria}
        data-testid={ROOT_TEST_ID}
      >
        <div
          className={cn(
            'component-content box-border m-0 min-w-0 w-full max-w-none',
            indentTop && 'pt-12 md:pt-20',
            indentBottom && 'pb-12 md:pb-20',
          )}
        >
          <div className="quick-link-group-outer box-border m-0 w-full min-w-0 max-w-none p-0 [&_.component.quick-link[data-variant=card]]:static [&_.component.quick-link[data-variant=card]]:m-0 [&_.component.quick-link[data-variant=card]]:p-0 [&_.component.quick-link[data-variant=card]>a]:box-border [&_.component.quick-link[data-variant=card]>a]:size-full [&_.component.quick-link[data-variant=card]>a]:max-w-full [&_.component.quick-link[data-variant=card]>a]:min-h-[inherit] [&_.component.quick-link[data-variant=card]>div]:box-border [&_.component.quick-link[data-variant=card]>div]:size-full [&_.component.quick-link[data-variant=card]>div]:max-w-full [&_.component.quick-link[data-variant=card]>div]:min-h-[inherit] [&_.component.quick-link[data-variant=base]]:px-0 [&_[role=list][data-ql-group-layout=sidebar-column]>.component.quick-link]:px-0!">
            <div className="mt-[calc(var(--layout-gutter-inline)*-1.5)] mb-0 box-border px-0 mx-auto w-full min-w-0 max-w-full pt-0 pb-6 md:pb-8">
              <QuickLinkGroupAside
                Headline={Headline}
                Description={Description}
                isEditing={isEditing}
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (visible.length === 0) {
    return null;
  }

  const linkList = showSupplementaryLinkList
    ? supplementaryLinkCandidates.map((item) => (
        <li key={item.id} className="!ml-0 border-t border-stroke-default">
          <LinkView
            link={item?.fields!.Link!}
            className='py-1 hover:no-underline inline-block focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
          >
            {item.fields?.Link?.value?.text}
          </LinkView>
        </li>
      ))
    : null;

  return (
    <section
      className={`component quick-link-group ${styles ?? ''}`.trim()}
      {...anchorId}
      aria-label={QUICK_LINK_GROUP_LABELS.sectionAria}
      data-testid={ROOT_TEST_ID}
    >
      <div
        className={cn(
          'component-content box-border m-0 min-w-0 w-full max-w-none',
          indentTop && 'pt-12 md:pt-20',
          indentBottom && 'pb-12 md:pb-20',
        )}
      >
        <div className="quick-link-group-outer box-border m-0 w-full min-w-0 max-w-none p-0 [&_.component.quick-link[data-variant=card]]:static [&_.component.quick-link[data-variant=card]]:m-0 [&_.component.quick-link[data-variant=card]]:p-0 [&_.component.quick-link[data-variant=card]>a]:box-border [&_.component.quick-link[data-variant=card]>a]:size-full [&_.component.quick-link[data-variant=card]>a]:max-w-full [&_.component.quick-link[data-variant=card]>a]:min-h-[inherit] [&_.component.quick-link[data-variant=card]>div]:box-border [&_.component.quick-link[data-variant=card]>div]:size-full [&_.component.quick-link[data-variant=card]>div]:max-w-full [&_.component.quick-link[data-variant=card]>div]:min-h-[inherit] [&_.component.quick-link[data-variant=base]]:px-0 [&_[role=list][data-ql-group-layout=sidebar-column]>.component.quick-link]:px-0!">
          <div
            className={cn(
              cardType === 'card' &&
                'grid w-full gap-6 grid-flow-row py-0 items-stretch justify-items-stretch justify-center [grid-template-columns:1fr] min-[600px]:max-[767px]:[grid-template-columns:repeat(var(--ql-group-columns),minmax(0,var(--ql-group-card-w-sm)))] min-[768px]:max-[991px]:[grid-template-columns:repeat(2,minmax(0,var(--ql-group-card-w-md)))] min-[992px]:max-[1199px]:[grid-template-columns:repeat(var(--ql-group-columns),minmax(0,var(--ql-group-card-w-lg)))] min-[1200px]:[grid-template-columns:repeat(var(--ql-group-columns),minmax(0,var(--ql-group-card-w-xl)))] min-[600px]:max-[767px]:w-full min-[768px]:w-full min-[768px]:justify-center mt-[var(--layout-gutter-inline)] mb-0 box-border px-[var(--layout-gutter-inline)] mx-auto w-full min-w-0 max-w-full h-auto min-h-0',
              cardType !== 'card' &&
                'flex flex-col flex-nowrap items-stretch justify-start py-0 h-auto mb-0 box-border px-0 mx-auto w-full min-w-0 max-w-full',
              cardType !== 'card' &&
                sidebarColumnLayout &&
                'gap-2 max-[430px]:gap-[10px] min-h-0 w-full text-left mt-0 text-ink-primary',
              cardType !== 'card' &&
                !sidebarColumnLayout &&
                'min-h-[211.75px] mt-[calc(var(--layout-gutter-inline)*-1.5)]',
              'leading-[24px] text-ink-primary font-media-tile [font-feature-settings:normal] [font-variation-settings:normal] [text-size-adjust:100%] [tab-size:4] border-0 border-solid border-stroke-default [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] antialiased',
            )}
            role="list"
            data-ql-group-layout={
              sidebarColumnLayout ? 'sidebar-column' : 'default'
            }
            style={
              cardType === 'card' ?
                ({ '--ql-group-columns': columnCount } as CSSProperties)
              : undefined
            }
          >
            {!usedQuickLinkItems &&
              visible.length > 0 &&
              (Headline?.value || isEditing) && (
                <div
                  key="__quick-link-group-listoflinks-headline__"
                  className={cn(
                    'component quick-link',
                    sidebarColumnLayout
                      ? 'box-border block w-full min-w-0 max-w-full m-0 p-0 text-left'
                      : cardType === 'card'
                        ? 'box-border block h-auto min-h-0 w-full min-w-0 max-w-full leading-[24px] text-ink-primary font-media-tile [font-feature-settings:normal] [font-variation-settings:normal] [text-size-adjust:100%] [tab-size:4] border-0 border-solid border-stroke-default [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]'
                        : 'box-border block mt-4 md:mt-6 text-left text-[20px] leading-[30px] text-ink-muted',
                    cardType === 'card' &&
                      'min-w-0 w-full max-w-full justify-self-stretch',
                    cardType !== 'card' &&
                      sidebarColumnLayout &&
                      'w-full min-w-0 max-w-full shrink-0',
                    cardType !== 'card' &&
                      !sidebarColumnLayout &&
                      'w-full min-w-0',
                    !sidebarColumnLayout &&
                      'w-full max-w-full basis-full shrink-0 text-left',
                  )}
                  role="listitem"
                  aria-label={
                    String(Headline?.value ?? '').trim() ||
                    QUICK_LINK_GROUP_LABELS.linkListRegionAria
                  }
                >
                  <Text
                    field={Headline ?? ({ value: '' } as TextField)}
                    tag="h3"
                    className={cn(
                      sidebarColumnLayout
                        ? 'box-border block !m-0 !border-0 !p-0 font-media-tile text-font-big font-bold leading-font-media-tile-headline uppercase text-ink-tertiary [text-size-adjust:100%] [font-feature-settings:normal] [font-variation-settings:normal] [tab-size:4] [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]'
                        : 'uppercase tracking-wide !my-0 text-ink-secondary text-font-normal font-bold block',
                    )}
                  />
                </div>
              )}
            {visible.map((row, tileIndex) => {
              const tileAria = quickLinkSectionAriaLabel(
                row.resolved.Title?.value,
                row.resolved.Link?.value?.text,
                labels.emptyHint,
              );

              return (
                <div
                  key={row.id}
                  className={cn(
                    'component quick-link',
                    cardType === 'card' &&
                      'box-border block h-auto min-h-0 w-full min-w-0 max-w-full leading-[24px] text-ink-primary font-media-tile [font-feature-settings:normal] [font-variation-settings:normal] [text-size-adjust:100%] [tab-size:4] border-0 border-solid border-stroke-default [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
                    cardType !== 'card' &&
                      cn(
                        'box-border block text-left text-[20px] leading-[30px]',
                        sidebarColumnLayout
                          ? 'w-full min-w-0 max-w-full mt-0'
                          : 'mt-4 md:mt-6 text-ink-muted',
                      ),
                    cardType === 'card' &&
                      'min-w-0 w-full max-w-full justify-self-stretch',
                    cardType !== 'card' &&
                      sidebarColumnLayout &&
                      'w-full min-w-0 max-w-full shrink-0',
                    cardType !== 'card' &&
                      !sidebarColumnLayout &&
                      'w-full min-w-0',
                    standaloneCard &&
                      cardType === 'card' &&
                      tileIndex === 0 &&
                      visible.length > columnCount &&
                      'min-[768px]:col-span-full',
                  )}
                  role="listitem"
                  aria-label={tileAria}
                  data-testid={QUICK_LINK_TILE_TEST_ID}
                  data-variant={cardType}
                  data-icon-position={iconPosition}
                  {...(standaloneCard ? { 'data-standalone': 'true' } : {})}
                >
                  <QuickLinkTile
                    resolvedFields={row.resolved}
                    paramsRecord={paramsRecord}
                    isEditing={isEditing}
                    labels={labels}
                    caseStudyRailTypography={sidebarColumnLayout}
                    contactRailLinkTone={contactRailLinkTone}
                  />
                </div>
              );
            })}
            {showSupplementaryLinkList && linkList != null && linkList.length > 0 ? (
              <div
                key="__quick-link-group-link-list__"
                className={cn(
                  'component quick-link text-left',
                  cardType === 'card' &&
                    'box-border block h-auto min-h-0 w-full min-w-0 max-w-full leading-[24px] text-ink-primary font-media-tile [font-feature-settings:normal] [font-variation-settings:normal] [text-size-adjust:100%] [tab-size:4] border-0 border-solid border-stroke-default [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
                  cardType !== 'card' &&
                    cn(
                      'box-border block text-left text-[20px] leading-[30px]',
                      sidebarColumnLayout
                        ? 'w-full min-w-0 max-w-full mt-0'
                        : 'mt-4 md:mt-6 text-ink-muted',
                    ),
                  cardType === 'card' &&
                    'min-w-0 w-full max-w-full justify-self-stretch',
                  cardType !== 'card' &&
                    sidebarColumnLayout &&
                    'w-full min-w-0 max-w-full shrink-0',
                  cardType !== 'card' &&
                    !sidebarColumnLayout &&
                    'w-full min-w-0',
                )}
                role="listitem"
                aria-label={
                  String(Headline?.value ?? '').trim() ||
                  QUICK_LINK_GROUP_LABELS.linkListRegionAria
                }
                data-testid={QUICK_LINK_TILE_TEST_ID}
                data-variant={cardType}
                data-icon-position={iconPosition}
                {...(standaloneCard ? { 'data-standalone': 'true' } : {})}
              >
                {(Headline?.value || isEditing) && (
                  <Text
                    field={Headline ?? ({ value: '' } as TextField)}
                    tag="h3"
                    className="uppercase tracking-wide !my-0 text-ink-secondary text-font-normal font-bold block"
                  />
                )}
                <ul className="!ml-0 !pb-0 !pt-2">{linkList}</ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
