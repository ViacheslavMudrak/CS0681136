import { JSX } from 'react';
import { cn } from 'lib/utils';
import { getQuickLinkLabels } from 'lib/quick-link-i18n';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import type { QuickLinkProps } from './QuickLink.type';
import { QuickLinkTile } from './partial/QuickLinkTile';
import {
  QUICK_LINK_ROOT_TEST_ID,
  QUICK_LINK_STANDALONE_OUTER_TEST_ID,
  hasQuickLinkVisitorContent,
  mergeQuickLinkRenderingParams,
  quickLinkSectionAriaLabel,
  resolveQuickLinkCardType,
  resolveQuickLinkFields,
  resolveQuickLinkIconPosition,
  resolveQuickLinkStandalone,
} from './quickLinkUtils';

/**
 * Quick Link: base (horizontal icon + text) or card from `CardType`; card + `Standalone` `1` uses a full-width horizontal rail layout.
 *
 * @param props - Sitecore `fields`, `params`, `page`, and `rendering`.
 * @returns Section markup, empty-state placeholder when `fields` is missing, or `null` when there is no visitor content outside editing.
 */
export async function Default({
  fields,
  params,
  page,
  rendering,
}: QuickLinkProps): Promise<JSX.Element | null> {
  const labels = await getQuickLinkLabels();
  const safeParams = params ?? {};
  const { styles } = safeParams;
  const anchorId = renderingAnchorIdProps(safeParams.RenderingIdentifier);
  const isEditing = page?.mode?.isEditing ?? false;
  const paramsRecord = mergeQuickLinkRenderingParams(rendering, safeParams as Record<string, unknown>);

  if (!fields) {
    return (
      <div className={cn("component quick-link", styles ?? '')} {...anchorId}>
        <div className="component-content">
          <span className="is-empty-hint">{labels.emptyHint}</span>
        </div>
      </div>
    );
  }

  const resolvedFields = resolveQuickLinkFields(fields);

  if (!hasQuickLinkVisitorContent(resolvedFields, paramsRecord, isEditing)) {
    return null;
  }

  const cardType = resolveQuickLinkCardType(paramsRecord);
  const iconPosition = resolveQuickLinkIconPosition(cardType, paramsRecord);
  const standaloneCard = cardType === 'card' && resolveQuickLinkStandalone(paramsRecord);

  const aria = quickLinkSectionAriaLabel(
    resolvedFields.Title?.value,
    resolvedFields.Link?.value?.text,
    labels.emptyHint,
  );

  return (
    <section
      className={cn(
        'component quick-link',
        standaloneCard
          ? 'box-border min-w-0 max-w-none shrink-0 grow-0 basis-full p-0! px-0! w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]'
          : cn('w-full max-w-none', cardType === 'card' && 'p-0! px-0!'),
        styles,
      )}
      {...anchorId}
      aria-label={aria}
      data-testid={QUICK_LINK_ROOT_TEST_ID}
      data-variant={cardType}
      data-icon-position={iconPosition}
      {...(standaloneCard ? { 'data-standalone': 'true' } : {})}
    >
      <div
        className={cn(
          'component-content',
          standaloneCard
            ? 'box-border m-0 min-w-0 w-full max-w-none'
            : 'w-full max-w-none',
          !standaloneCard && cardType === 'card' && 'max-md:px-[16px] md:px-0',
        )}
      >
        {standaloneCard ?
          <div
            className="quick-link-standalone-outer box-border w-full min-w-0 box-border mx-auto w-full min-w-0 max-w-full px-4 py-6 min-[600px]:max-w-[600px] min-[768px]:max-w-[768px] min-[992px]:max-w-[992px] min-[1200px]:max-w-[1200px]"
            data-testid={QUICK_LINK_STANDALONE_OUTER_TEST_ID}
          >
            <QuickLinkTile
              resolvedFields={resolvedFields}
              paramsRecord={paramsRecord}
              isEditing={isEditing}
              labels={labels}
            />
          </div>
        : <div className="flex w-full min-w-0 justify-center">
            <QuickLinkTile
              resolvedFields={resolvedFields}
              paramsRecord={paramsRecord}
              isEditing={isEditing}
              labels={labels}
            />
          </div>}
      </div>
    </section>
  );
}
