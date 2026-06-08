import { JSX } from 'react';

import { QuickLinkTile } from 'components/quick-link/partial/QuickLinkTile';
import type { QuickLinkProps } from 'components/quick-link/QuickLink.type';
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
} from 'components/quick-link/quickLinkUtils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import { storyQuickLinkLabels } from '../storyLabels';

export type QuickLinkStoryPreviewLabels = typeof storyQuickLinkLabels;

export type QuickLinkStoryPreviewProps = QuickLinkProps & {
  labels?: QuickLinkStoryPreviewLabels;
};

export function QuickLinkStoryPreview({
  fields,
  params,
  page,
  rendering,
  labels = storyQuickLinkLabels,
}: QuickLinkStoryPreviewProps): JSX.Element | null {
  const safeParams = params ?? {};
  const { styles } = safeParams;
  const anchorId = renderingAnchorIdProps(safeParams.RenderingIdentifier);
  const isEditing = page?.mode?.isEditing ?? false;
  const paramsRecord = mergeQuickLinkRenderingParams(rendering, safeParams as Record<string, unknown>);

  if (!fields) {
    return (
      <div className={`component quick-link ${styles}`} {...anchorId}>
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

  const rootWidthShell = 'w-full max-w-none';
  const rootPaddingOptOut =
    standaloneCard
      ? 'box-border min-w-0 max-w-none shrink-0 grow-0 basis-full p-0! px-0! w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]'
      : cardType === 'card'
        ? 'p-0! px-0!'
        : '';
  const cardContentInset =
    standaloneCard ? '' : cardType === 'card' ? 'max-md:px-[16px] md:px-0' : '';

  return (
    <section
      className={`component quick-link ${rootWidthShell} ${rootPaddingOptOut} ${styles}`}
      {...anchorId}
      aria-label={aria}
      data-testid={QUICK_LINK_ROOT_TEST_ID}
      data-variant={cardType}
      data-icon-position={iconPosition}
      {...(standaloneCard ? { 'data-standalone': 'true' } : {})}
    >
      <div className={`component-content ${rootWidthShell} ${cardContentInset}`}>
        {standaloneCard ? (
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
        ) : (
          <div className="flex w-full min-w-0 justify-center">
            <QuickLinkTile
              resolvedFields={resolvedFields}
              paramsRecord={paramsRecord}
              isEditing={isEditing}
              labels={labels}
            />
          </div>
        )}
      </div>
    </section>
  );
}
