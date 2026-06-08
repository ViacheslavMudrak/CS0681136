'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { cn } from 'lib/utils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import type {
  ProductModalItem,
  ProductSegmentFields,
  ProductSegmentProps,
} from '../ProductSegment.type';
import { PRODUCT_SEGMENT_QUERY } from '../ProductSegment.type';
import {
  deriveApplicationFilters,
  filterModals,
  findModalBySlug,
  getModalSlug,
  getSegmentSlug,
  getVisibleSegments,
  resolveProductSegmentState,
} from '../productSegmentUtils';
import {
  ProductSegmentApplicationFilters,
  ProductSegmentHeader,
  ProductSegmentSegmentGrid,
  ProductSegmentSolutionCards,
} from './ProductSegmentPartials';
import { ProductModalDialog } from './ProductModalDialog';

export interface ProductSegmentClientProps {
  fields: ProductSegmentFields;
  params: ProductSegmentProps['params'];
  isEditing: boolean;
  isPreview: boolean;
}

/**
 * Client shell: segment/application/item state with URL deep-link sync.
 */
export function ProductSegmentClient({
  fields,
  params,
  isEditing,
  isPreview,
}: ProductSegmentClientProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingOwnNavigationRef = useRef(false);

  const segments = useMemo(
    () => getVisibleSegments(fields.Segments),
    [fields.Segments],
  );

  const [segmentSlug, setSegmentSlug] = useState(() =>
    resolveProductSegmentState(segments, searchParams).segmentSlug,
  );
  const [applicationSlug, setApplicationSlug] = useState<string | null>(() =>
    resolveProductSegmentState(segments, searchParams).applicationSlug,
  );
  const [itemSlug, setItemSlug] = useState<string | null>(() =>
    resolveProductSegmentState(segments, searchParams).itemSlug,
  );
  const [modalOpen, setModalOpen] = useState(
    () => resolveProductSegmentState(segments, searchParams).openModal,
  );

  const activeSegment = useMemo(() => {
    if (segmentSlug) {
      return segments.find((s) => getSegmentSlug(s) === segmentSlug);
    }
    if (isEditing && segments.length > 0) {
      return segments[0];
    }
    return undefined;
  }, [segmentSlug, segments, isEditing]);

  const showSegmentDetail = Boolean(segmentSlug) || isEditing;

  const segmentModals = useMemo(
    () => activeSegment?.fields?.ProductModal ?? [],
    [activeSegment],
  );

  const applicationFilters = useMemo(
    () => deriveApplicationFilters(segmentModals),
    [segmentModals],
  );

  const filteredModals = useMemo(
    () => filterModals(segmentModals, applicationSlug),
    [segmentModals, applicationSlug],
  );

  const activeModal = useMemo(
    () => findModalBySlug(filteredModals, itemSlug),
    [filteredModals, itemSlug],
  );

  useEffect(() => {
    if (isEditing || isPreview) {
      return;
    }

    const urlParams = new URLSearchParams(searchParams.toString());

    if (segmentSlug) {
      urlParams.set(PRODUCT_SEGMENT_QUERY.segment, segmentSlug);
    } else {
      urlParams.delete(PRODUCT_SEGMENT_QUERY.segment);
    }

    if (applicationSlug) {
      urlParams.set(PRODUCT_SEGMENT_QUERY.application, applicationSlug);
    } else {
      urlParams.delete(PRODUCT_SEGMENT_QUERY.application);
    }

    if (itemSlug) {
      urlParams.set(PRODUCT_SEGMENT_QUERY.item, itemSlug);
    } else {
      urlParams.delete(PRODUCT_SEGMENT_QUERY.item);
    }

    const nextQuery = urlParams.toString();
    if (nextQuery === searchParams.toString()) {
      return;
    }

    pendingOwnNavigationRef.current = true;
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [
    applicationSlug,
    isEditing,
    isPreview,
    itemSlug,
    pathname,
    router,
    searchParams,
    segmentSlug,
  ]);

  useEffect(() => {
    if (isEditing || isPreview) {
      return;
    }

    const resolved = resolveProductSegmentState(segments, searchParams);

    if (pendingOwnNavigationRef.current) {
      const urlMatchesState =
        resolved.segmentSlug === segmentSlug &&
        resolved.applicationSlug === applicationSlug &&
        resolved.itemSlug === itemSlug;
      if (urlMatchesState) {
        pendingOwnNavigationRef.current = false;
      }
      return;
    }

    setSegmentSlug(resolved.segmentSlug);
    setApplicationSlug(resolved.applicationSlug);
    setItemSlug(resolved.itemSlug);
    setModalOpen(resolved.openModal);
  }, [
    applicationSlug,
    isEditing,
    isPreview,
    itemSlug,
    searchParams,
    segmentSlug,
    segments,
  ]);

  const handleSelectSegment = useCallback((slug: string) => {
    setSegmentSlug(slug);
    setApplicationSlug(null);
    setItemSlug(null);
    setModalOpen(false);
  }, []);

  const handleSelectApplication = useCallback((slug: string | null) => {
    setApplicationSlug(slug);
    setItemSlug(null);
    setModalOpen(false);
  }, []);

  const handleOpenModal = useCallback((modal: ProductModalItem) => {
    setItemSlug(getModalSlug(modal));
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setItemSlug(null);
  }, []);

  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);

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
        <ProductSegmentHeader
          eyebrow={fields.Eyebrow}
          headline={fields.Headline}
          subHeadline={fields.SubHeadline}
          description={fields.Description}
          isEditing={isEditing}
        />

        <ProductSegmentSegmentGrid
          segments={segments}
          activeSlug={segmentSlug}
          isEditing={isEditing}
          onSelect={handleSelectSegment}
        />

        {showSegmentDetail && activeSegment ? (
          <div aria-live="polite" aria-atomic="false">
            <ProductSegmentApplicationFilters
              filters={applicationFilters}
              activeSlug={applicationSlug}
              isEditing={isEditing}
              onSelect={handleSelectApplication}
            />

            <ProductSegmentSolutionCards
              modals={filteredModals}
              isEditing={isEditing}
              onOpen={handleOpenModal}
            />
          </div>
        ) : null}

        <ProductModalDialog
          modal={activeModal}
          isOpen={modalOpen && Boolean(activeModal)}
          isEditing={isEditing}
          onClose={handleCloseModal}
        />
        </div>
      </div>
    </section>
  );
}
