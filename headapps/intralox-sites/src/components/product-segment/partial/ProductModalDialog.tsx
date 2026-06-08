'use client';

import { useCallback, type JSX } from 'react';

import { Link as ContentSdkLink, RichText, Text } from '@sitecore-content-sdk/nextjs';
import { CalloutItem as CalloutListItem } from 'components/callout/partial/CalloutPartials';
import { CalloutGroupListItem } from 'components/callout/partial/CalloutGroupListItem';
import type { CalloutFields, CalloutItem as CalloutItemType } from 'components/callout/Callout.type';
import { ImageView } from 'components/shared/ImageView/ImageView';
import Modal from 'components/shared/Modal';
import Video from 'components/shared/video/Video';
import { TestimonialCard } from 'components/testimonial/partial/TestimonialPartials';
import { getNormalizedTestimonialFields } from 'components/testimonial/testimonialUtils';
import type { ProductModalItem } from '../ProductSegment.type';
import { PRODUCT_SEGMENT_LABELS } from '../ProductSegment.type';
import { linkFieldRel } from 'components/shared/linkCtaChrome';
import { cn } from 'lib/utils';
import {
  getProductModalVideoId,
  getProductModalVisibleCalloutItems,
  productModalLinkIsVisible,
  productModalShouldRenderVideo,
  resolveProductModalCalloutConfig,
  resolveProductModalLinkField,
} from '../productSegmentUtils';

export interface ProductModalDialogProps {
  modal: ProductModalItem | undefined;
  isOpen: boolean;
  isEditing: boolean;
  onClose: () => void;
}

function ProductModalCalloutSection({
  items,
  calloutFields,
  isEditing,
}: {
  items: CalloutItemType[];
  calloutFields: CalloutFields | undefined;
  isEditing: boolean;
}): JSX.Element | null {
  if (!items.length && !isEditing) {
    return null;
  }

  const config = resolveProductModalCalloutConfig(calloutFields);
  const itemCount = items.length;
  const isCardStyle = config.style === 'card';
  const singleVisibleCallout = itemCount === 1;

  return (
    <div className="box-border w-full min-w-0 max-w-full py-0 min-[768px]:max-[991px]:[--width-callout-product-modal-label-sm:240.66px] min-[992px]:[--width-callout-product-modal-label-sm:275.99px]">
      <div
        role="list"
        aria-label={PRODUCT_SEGMENT_LABELS.calloutListLabel}
        className="flex w-full min-w-0 max-w-full flex-col items-stretch gap-0 text-left text-ink-primary"
      >
        {items.map((item, index) => (
          <CalloutGroupListItem
            key={item.id}
            index={index}
            contentSwitcherLayout={false}
            textAsideMultiStack={itemCount > 1}
            textAsideAsideLayout={false}
            isSingleStandalone={singleVisibleCallout}
            layoutIsRow={false}
            textAsideSingleFullWidthRow={false}
            isCardStyle={isCardStyle}
            isEmbeddedRow={false}
            visibleCalloutCount={itemCount}
            contentSwitcherEqualHeightRow={false}
            isTabletSecondColumn={false}
            itemPadCompact
            embeddedLayoutRowNonCard={false}
            textAsideAsideMargin={false}
          >
            <CalloutListItem
              item={item}
              config={config}
              isEditing={isEditing}
              contentSwitcherLayout
              singleVisibleCallout={singleVisibleCallout}
              contentSwitcherCompactCardBelowLg={itemCount > 2}
              productModalCalloutLayout
            />
          </CalloutGroupListItem>
        ))}
      </div>
    </div>
  );
}

function ProductModalMediaSection({
  modal,
  isEditing,
  leadSpacing = true,
}: {
  modal: ProductModalItem;
  isEditing: boolean;
  /** When false, omits top margin (e.g. right column top of stack). */
  leadSpacing?: boolean;
}): JSX.Element | null {
  const fields = modal.fields;
  if (!fields) return null;

  const isVideo = productModalShouldRenderVideo(fields, isEditing);
  const videoFields = fields.Video;
  const videoId = videoFields ? getProductModalVideoId(videoFields) : '';

  const coverImage =
    videoFields?.fields?.CoverImage?.value?.src
      ? videoFields.fields.CoverImage
      : fields.Thumbnail?.value?.src
        ? fields.Thumbnail
        : fields.Image;

  if (isVideo && videoId) {
    const videoTitle = videoFields?.fields?.Title?.value;
    return (
      <div
        className={cn(
          'relative aspect-video w-full min-w-0 bg-bg-lighter-gray',
          leadSpacing && 'mt-8',
        )}
      >
        <Video
          key={modal.id}
          videoId={videoId}
          playInModal={false}
          loop={Boolean(videoFields?.fields?.Loop?.value)}
          autoplay={false}
          muted={false}
          className="absolute inset-0 h-full w-full"
          ratio={0}
          suppressCaption
          playerClassName="laitram-bc-player laitram-bc-player--compact-controls [&_.vjs-tech]:object-cover [&_.vjs-tech]:object-center [&_.vjs-poster]:bg-cover [&_.vjs-poster]:bg-center"
          title={typeof videoTitle === 'string' ? videoTitle : undefined}
        />
      </div>
    );
  }

  if (isVideo && isEditing) {
    return (
      <div
        className={cn(
          'relative aspect-video w-full min-w-0 bg-bg-lighter-gray',
          leadSpacing && 'mt-8',
        )}
      >
        {(coverImage && (coverImage.value?.src || isEditing)) && (
          <ImageView image={coverImage} objectFit="cover" imageClass="size-full" />
        )}
      </div>
    );
  }

  const image = fields.Image;
  if (image && (image.value?.src || isEditing)) {
    return (
      <div className={cn('overflow-hidden', leadSpacing && 'mt-8')}>
        <ImageView image={image} objectFit="cover" imageClass="w-full" />
      </div>
    );
  }

  return null;
}

function productModalHasMediaContent(
  modal: ProductModalItem,
  isEditing: boolean,
): boolean {
  const fields = modal.fields;
  if (!fields) {
    return false;
  }

  if (productModalShouldRenderVideo(fields, isEditing)) {
    const videoId = fields.Video ? getProductModalVideoId(fields.Video) : '';
    return Boolean(videoId || isEditing);
  }

  return Boolean(fields.Image?.value?.src || (isEditing && fields.Image));
}

function productModalHasCalloutContent(
  modal: ProductModalItem,
  isEditing: boolean,
): boolean {
  const calloutFields = modal.fields?.Callout?.fields;
  if (!calloutFields) {
    return false;
  }

  return getProductModalVisibleCalloutItems(calloutFields, isEditing).length > 0;
}

function productModalHasTestimonialContent(
  modal: ProductModalItem,
  isEditing: boolean,
): boolean {
  if (modal.fields?.Callout?.fields) {
    return false;
  }

  const testimonialFields = modal.fields?.Testimonial?.fields;
  return Boolean(testimonialFields?.Quote?.value || (isEditing && testimonialFields));
}

function productModalHasRightColumnContent(
  modal: ProductModalItem,
  isEditing: boolean,
): boolean {
  return (
    productModalHasMediaContent(modal, isEditing) ||
    productModalHasCalloutContent(modal, isEditing) ||
    productModalHasTestimonialContent(modal, isEditing)
  );
}

/**
 * Product detail modal with overview, solutions, features, media, CTA, and differentiator.
 */
export function ProductModalDialog({
  modal,
  isOpen,
  isEditing,
  onClose,
}: ProductModalDialogProps): JSX.Element | null {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!modal) {
    return null;
  }

  const fields = modal.fields ?? {};
  const {
    Title,
    Overview,
    FeaturesandBenefits,
    Solutions,
    Link,
    Callout,
    Testimonial,
  } = fields;

  const solutionItems = (Solutions ?? []).filter(
    (item) => isEditing || Boolean(item.fields?.Value?.value?.trim()),
  );

  const downloadLink = resolveProductModalLinkField(Link);
  const showDownloadLink = productModalLinkIsVisible(Link, isEditing);
  const downloadLinkTarget = downloadLink?.value?.target;
  const modalTitle = Title?.value ?? modal.displayName ?? modal.name ?? 'Product';
  const solutionsText = solutionItems
    .map((item) => item.fields?.Value?.value?.trim())
    .filter(Boolean)
    .join(', ');
  const useTwoColumnLayout = productModalHasRightColumnContent(modal, isEditing);
  const showMedia = productModalHasMediaContent(modal, isEditing);
  const calloutFields = Callout?.fields;
  const visibleCallouts = getProductModalVisibleCalloutItems(calloutFields, isEditing);
  const calloutCount = visibleCallouts.length;
  const showCallout = calloutCount > 0 || (isEditing && Boolean(calloutFields));
  const showTestimonial = productModalHasTestimonialContent(modal, isEditing);
  const normalizedTestimonialFields = getNormalizedTestimonialFields(Testimonial?.fields);
  const showMediaCalloutDivider = showMedia && showCallout && calloutCount === 1;
  const showMediaCalloutTopGap = showMedia && showCallout && calloutCount >= 2;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      modalSize="xl"
      ariaLabel={String(modalTitle)}
      autoFocusCloseButton
      containerBare
      containerClassName="product-modal-outer box-border mx-auto w-full min-w-0 max-w-full py-0 max-[599px]:px-[var(--layout-gutter-inline)] sm:max-w-[568px] md:max-w-[736px] lg:max-w-[960px] xl:max-w-[992px]"
      panelClassName="product-modal-panel box-border !w-full min-w-0 max-w-full sm:!max-w-[568px] md:!max-w-[736px] lg:!max-w-[960px] xl:!max-w-[992px]"
    >
      <div className="flex flex-wrap min-[768px]:flex-nowrap">
          <div
            className={cn(
              'box-border w-full min-w-0',
              useTwoColumnLayout && 'min-[768px]:min-w-0 min-[768px]:flex-1 min-[768px]:pr-8',
            )}
          >
            {(Title?.value || isEditing) && (
              <Text
                field={Title}
                tag="h2"
                className="text-font-big font-bold leading-[30px] text-ink-primary [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]"
                id="product-modal-title"
              />
            )}

            {(Overview?.value || isEditing) && (
              <RichText
                field={Overview}
                tag="div"
                className="prose mt-4 max-w-none text-ink leading-6 prose-p:my-0 prose-p:leading-6 prose-p:text-ink [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]"
              />
            )}

            {solutionItems.length > 0 ? (
              <div>
                <h3 className="mt-4 text-base font-bold uppercase tracking-[0.4px] leading-6 text-ink-muted [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]">
                  {PRODUCT_SEGMENT_LABELS.solutionsHeading}
                </h3>
                <p className="mt-2 leading-6 text-ink [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]">
                  {solutionsText}
                </p>
              </div>
            ) : null}

            {(FeaturesandBenefits?.value || isEditing) && (
              <div>
                <h3 className="mb-0 mt-4 text-base font-bold uppercase tracking-[0.4px] leading-6 text-ink-muted [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]">
                  {PRODUCT_SEGMENT_LABELS.featuresHeading}
                </h3>
                <RichText
                  field={FeaturesandBenefits}
                  tag="div"
                  className="prose prose-article mt-0 max-w-none text-ink leading-6 prose-p:my-0 prose-p:leading-6 prose-p:text-ink prose-ul:mt-0 prose-li:leading-6 prose-li:text-ink [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]"
                />
              </div>
            )}

            {showDownloadLink && downloadLink ? (
              <ContentSdkLink
                field={downloadLink}
                editable={isEditing}
                className="box-border block m-0 mx-0 mb-0 mt-4 border-0 p-0 cursor-pointer text-base leading-6 text-link no-underline transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to] duration-150 ease-in-out motion-reduce:transition-none [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate]"
                target={downloadLinkTarget || undefined}
                rel={linkFieldRel(downloadLinkTarget)}
              />
            ) : null}
          </div>

          {useTwoColumnLayout ? (
            <div className="box-border mt-8 w-full min-w-0 max-w-full min-[600px]:max-[767px]:max-w-[504px] min-[768px]:mt-0 min-[768px]:w-[336px] min-[768px]:max-w-[336px] min-[768px]:shrink-0 lg:w-[432px] lg:max-w-[432px] xl:w-[448px] xl:max-w-[448px]">
              {showMedia ? (
                <ProductModalMediaSection
                  modal={modal}
                  isEditing={isEditing}
                  leadSpacing={false}
                />
              ) : null}

              {showCallout ? (
                <>
                  {showMediaCalloutDivider ? (
                    <hr className="mt-8 mb-8 border-t border-stroke-default" />
                  ) : null}
                  <div className={showMediaCalloutTopGap ? 'mt-4' : undefined}>
                    <ProductModalCalloutSection
                      items={visibleCallouts}
                      calloutFields={calloutFields}
                      isEditing={isEditing}
                    />
                  </div>
                </>
              ) : null}

              {showTestimonial && normalizedTestimonialFields ? (
                <div className={showMedia || showCallout ? 'mt-8' : ''}>
                  <TestimonialCard
                    fields={normalizedTestimonialFields}
                    isEditing={isEditing}
                    displayName={Testimonial?.displayName}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
      </div>
    </Modal>
  );
}
