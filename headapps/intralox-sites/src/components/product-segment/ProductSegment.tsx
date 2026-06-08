import type { JSX } from 'react';

import { cn } from 'lib/utils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import type { ProductSegmentProps } from './ProductSegment.type';
import { PRODUCT_SEGMENT_LABELS } from './ProductSegment.type';
import { normalizeProductSegmentFields } from './productSegmentUtils';
import { ProductSegmentClient } from './partial/ProductSegmentClient';

/**
 * ARB Solutions Finder: segments, application filters, solution cards, and detail modal.
 */
export const Default = ({
  fields,
  params,
  page,
}: ProductSegmentProps): JSX.Element => {
  const { isEditing, isPreview } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);
  const normalized = normalizeProductSegmentFields(fields);

  if (!normalized) {
    return (
      <section
        className={cn(
          'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0!',
          'w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
          '[.component_&]:flex-[0_1_auto] [.component_&]:m-0 [.component_&]:w-full [.component_&]:max-w-full',
          'component product-segment',
          styles,
        )}
        {...anchorId}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
          <div
            className="product-segment-outer box-border mx-auto w-full min-w-0 max-w-full px-[var(--layout-gutter-inline)] py-0 max-[599px]:mx-0 sm:max-w-[600px] md:max-w-[768px] lg:max-w-full min-[1025px]:max-w-[1024px]"
            data-testid="product-segment-shell"
          >
            <span className="is-empty-hint">{PRODUCT_SEGMENT_LABELS.emptyHint}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <ProductSegmentClient
      fields={normalized}
      params={params}
      isEditing={isEditing}
      isPreview={isPreview}
    />
  );
};
