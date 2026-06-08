import type { JSX } from 'react';
import type { TextAndAsideLayoutFields, TextAndAsideParams, TextAndAsideProps } from './TextAndAside.type';
import { TextAndAsideAside, TextAndAsideMain } from './partial/TextAndAsidePartials';
import {
  hasVisibleImageField,
  hasVisibleRichText,
  hasVisibleTextField,
  hasVisibleVideoReference,
  isTextAsideDividerEnabled,
  isTextAsidePlaceholderEnabled,
  isTextAsidePreferLeft,
  normalizeAsideWidthLabel,
  resolveTextAsideDividerParam,
  resolveTextAsideMediaVisibility,
  resolveTextAndAsideLayoutFields,
  readTextAsideBackgroundSurface,
  resolveTextAsideParamString,
  shouldTextAsidePreferAsidePlaceholderOverFields,
  shouldTextAsidePreferTextPlaceholderOverFields,
  shouldRenderTextAsideAsideContent,
  TEXT_ASIDE_EMPTY_HINT,
} from './textAsideUtils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';
import { cn } from 'lib/utils';

function computeAsideWillShow(
  fields: TextAndAsideLayoutFields,
  media: ReturnType<typeof resolveTextAsideMediaVisibility>,
  showAsidePlaceholder: boolean,
  isEditing: boolean
): boolean {
  const suppressAsideFields = shouldTextAsidePreferAsidePlaceholderOverFields(
    showAsidePlaceholder,
    isEditing
  );
  const showImageBlock =
    !suppressAsideFields && media.showImage && (hasVisibleImageField(fields.Image) || isEditing);
  const showVideoBlock =
    !suppressAsideFields && media.showVideo && (hasVisibleVideoReference(fields.Video) || isEditing);
  return Boolean(showImageBlock || showVideoBlock || showAsidePlaceholder);
}

function computeMainWillShow(
  fields: TextAndAsideLayoutFields,
  showTextPlaceholder: boolean,
  isEditing: boolean
): boolean {
  const suppressMainFields = shouldTextAsidePreferTextPlaceholderOverFields(
    showTextPlaceholder,
    isEditing
  );
  const hasMainFieldContent =
    !suppressMainFields &&
    (hasVisibleTextField(fields.Title) || hasVisibleRichText(fields.Description));
  return Boolean(hasMainFieldContent || showTextPlaceholder || isEditing);
}

export const Default = ({
  fields,
  params,
  page,
  rendering,
}: TextAndAsideProps): JSX.Element | null => {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);
  const renderingParams = (rendering as { params?: Partial<TextAndAsideProps['params']> }).params;
  const textAsideBackgroundParamRaw =
    resolveTextAsideParamString(params.BackgroundColor ?? renderingParams?.BackgroundColor) ??
    resolveTextAsideParamString(params.backgroundColor ?? renderingParams?.backgroundColor);
  const textAsideBackgroundSurface = readTextAsideBackgroundSurface(textAsideBackgroundParamRaw);

  const layoutFields = resolveTextAndAsideLayoutFields(fields);

  if (!layoutFields) {
    return (
      <section
        className={cn(
          'component text-and-aside text-aside w-full min-w-0 max-mobile-large:!px-0 font-media-tile',
          '[&_.testimonial]:!ml-0 [&_.testimonial]:!w-full [&_.testimonial]:!max-w-full [&_.testimonial]:min-w-0 [&_.testimonial]:!p-0 [&_.testimonial]:lg:!p-0 [&_.testimonial_.component-content>div]:!mx-0 [&_.testimonial_.component-content>div]:!max-w-full [&_.testimonial_.component-content>div]:!px-0 [&_.testimonial_.component-content>div]:!py-0 [&_.testimonial_.component-content>div]:lg:!py-0',
          textAsideBackgroundSurface === 'surface-muted-light' && 'bg-surface-muted-light',
          textAsideBackgroundSurface === 'surface-muted' && 'bg-surface-muted',
          textAsideBackgroundSurface === 'surface-inverse' && 'bg-surface-inverse',
          textAsideBackgroundSurface === 'surface-strong' && 'bg-surface-strong',
          textAsideBackgroundSurface === 'surface-panel' && 'bg-surface-panel',
          textAsideBackgroundSurface === 'accent-teal' && 'bg-accent-teal',
          textAsideBackgroundSurface === 'surface' && 'bg-surface',
          styles ?? '',
        )}
        {...anchorId}
      >
        <div className="component-content flex w-full min-w-0 justify-center">
          <div className="mx-auto my-0 box-border w-full min-w-0 max-w-[1280px] px-4 py-8 text-left desktop-up:px-4 desktop-up:py-4">
            <span className="is-empty-hint">{TEXT_ASIDE_EMPTY_HINT}</span>
          </div>
        </div>
      </section>
    );
  }

  const columnAlignmentRaw = resolveTextAsideParamString(
    params.ColumnAlignment ?? params.AlignColumns
  );
  const asideWidthRaw = resolveTextAsideParamString(params.AsideWidth);
  const asidePositionRaw = resolveTextAsideParamString(
    params.AsidePosition ?? params.LayoutOrientation
  );
  const asideLeft = isTextAsidePreferLeft(asidePositionRaw);
  const dividerEnabled = isTextAsideDividerEnabled(resolveTextAsideDividerParam(params));

  const mainPlaceholderName = 'text-content-{*}';
  const asidePlaceholderName = 'aside-content-{*}';

  /** Preview: datasource placeholders replace text or aside columns when enabled (editing keeps fields). */
  const showTextPlaceholder = isTextAsidePlaceholderEnabled(layoutFields.HasTextContentPlaceholder);
  const showAsidePlaceholder = isTextAsidePlaceholderEnabled(layoutFields.HasAsideContentPlaceholder);

  const media = resolveTextAsideMediaVisibility(
    layoutFields.MediaType,
    layoutFields.Image,
    layoutFields.Video
  );

  const mainVisible = computeMainWillShow(layoutFields, showTextPlaceholder, isEditing);
  const asideVisible = computeAsideWillShow(layoutFields, media, showAsidePlaceholder, isEditing);
  const asideContentVisible = shouldRenderTextAsideAsideContent(
    layoutFields,
    media,
    showAsidePlaceholder,
    isEditing
  );

  if (!mainVisible && !asideVisible && !isEditing) {
    return null;
  }

  const twoColLayout = mainVisible && asideContentVisible;
  const showDividerColumn = dividerEnabled && twoColLayout;
  const asideWidthIs50 = normalizeAsideWidthLabel(asideWidthRaw) === '50%';
  const columnAlignCenter = (columnAlignmentRaw ?? '').toLowerCase().includes('center');

  return (
    <section
      className={cn(
        'component text-and-aside text-aside w-full min-w-0 max-mobile-large:!px-0 font-media-tile',
        '[&_.testimonial]:!ml-0 [&_.testimonial]:!w-full [&_.testimonial]:!max-w-full [&_.testimonial]:min-w-0 [&_.testimonial]:!p-0 [&_.testimonial]:lg:!p-0 [&_.testimonial_.component-content>div]:!mx-0 [&_.testimonial_.component-content>div]:!max-w-full [&_.testimonial_.component-content>div]:!px-0 [&_.testimonial_.component-content>div]:!py-0 [&_.testimonial_.component-content>div]:lg:!py-0',
        textAsideBackgroundSurface === 'surface-muted-light' && 'bg-surface-muted-light',
        textAsideBackgroundSurface === 'surface-muted' && 'bg-surface-muted',
        textAsideBackgroundSurface === 'surface-inverse' && 'bg-surface-inverse',
        textAsideBackgroundSurface === 'surface-strong' && 'bg-surface-strong',
        textAsideBackgroundSurface === 'surface-panel' && 'bg-surface-panel',
        textAsideBackgroundSurface === 'accent-teal' && 'bg-accent-teal',
        textAsideBackgroundSurface === 'surface' && 'bg-surface',
        styles ?? '',
      )}
      {...anchorId}
    >
      <div className="component-content flex w-full min-w-0 justify-center">
        <div className="mx-auto my-0 box-border w-full min-w-0 max-w-[1280px] px-4 py-8 text-left desktop-up:px-4 desktop-up:py-4">
          {twoColLayout ? (
            <div
              className={cn(
                'grid w-full grid-cols-1 gap-y-10 gap-x-0 md:gap-y-0',
                showDividerColumn ?
                  'md:gap-x-0'
                : 'md:gap-x-14 lg:gap-x-20 xl:gap-x-24',
                columnAlignCenter ? 'md:items-center' : 'md:items-start',
                !showDividerColumn &&
                  asideWidthIs50 &&
                  'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
                !showDividerColumn &&
                  !asideWidthIs50 &&
                  asideLeft &&
                  'md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]',
                !showDividerColumn &&
                  !asideWidthIs50 &&
                  !asideLeft &&
                  'md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]',
                showDividerColumn &&
                  asideWidthIs50 &&
                  'md:grid-cols-[minmax(0,1fr)_minmax(0,1px)_minmax(0,1fr)]',
                showDividerColumn &&
                  !asideWidthIs50 &&
                  asideLeft &&
                  'md:grid-cols-[minmax(0,2fr)_minmax(0,1px)_minmax(0,3fr)]',
                showDividerColumn &&
                  !asideWidthIs50 &&
                  !asideLeft &&
                  'md:grid-cols-[minmax(0,3fr)_minmax(0,1px)_minmax(0,2fr)]',
              )}
            >
              {showDividerColumn ? (
                asideLeft ? (
                  <>
                    <div className="min-w-0 max-md:w-full order-1 md:order-none md:pr-16">
                      <TextAndAsideAside
                        fields={layoutFields}
                        isEditing={isEditing}
                        rendering={rendering}
                        page={page}
                        media={media}
                        showAsidePlaceholder={showAsidePlaceholder}
                        asidePlaceholderName={asidePlaceholderName}
                        dividerClass=""
                      />
                    </div>
                    <div
                      className="hidden min-h-0 w-full min-w-0 shrink-0 bg-stroke-default md:block md:self-stretch"
                      aria-hidden={true}
                    />
                    <div className="min-w-0 order-2 md:order-none px-0 md:pl-16">
                      <TextAndAsideMain
                        fields={layoutFields}
                        isEditing={isEditing}
                        rendering={rendering}
                        page={page}
                        showTextPlaceholder={showTextPlaceholder}
                        mainPlaceholderName={mainPlaceholderName}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 order-2 md:order-none px-0 md:pr-16">
                      <TextAndAsideMain
                        fields={layoutFields}
                        isEditing={isEditing}
                        rendering={rendering}
                        page={page}
                        showTextPlaceholder={showTextPlaceholder}
                        mainPlaceholderName={mainPlaceholderName}
                      />
                    </div>
                    <div
                      className="hidden min-h-0 w-full min-w-0 shrink-0 bg-stroke-default md:block md:self-stretch"
                      aria-hidden={true}
                    />
                    <div className="min-w-0 max-md:w-full order-1 md:order-none md:pl-16">
                      <TextAndAsideAside
                        fields={layoutFields}
                        isEditing={isEditing}
                        rendering={rendering}
                        page={page}
                        media={media}
                        showAsidePlaceholder={showAsidePlaceholder}
                        asidePlaceholderName={asidePlaceholderName}
                        dividerClass=""
                      />
                    </div>
                  </>
                )
              ) : (
                <>
                  {mainVisible && (
                    <div
                      className={cn('min-w-0 px-0 order-2', asideLeft ? 'md:order-2' : 'md:order-1')}
                    >
                      <TextAndAsideMain
                        fields={layoutFields}
                        isEditing={isEditing}
                        rendering={rendering}
                        page={page}
                        showTextPlaceholder={showTextPlaceholder}
                        mainPlaceholderName={mainPlaceholderName}
                      />
                    </div>
                  )}
                  {asideContentVisible && (
                    <div
                      className={cn(
                        'min-w-0 max-md:w-full order-1',
                        asideLeft ? 'md:order-1' : 'md:order-2',
                      )}
                    >
                      <TextAndAsideAside
                        fields={layoutFields}
                        isEditing={isEditing}
                        rendering={rendering}
                        page={page}
                        media={media}
                        showAsidePlaceholder={showAsidePlaceholder}
                        asidePlaceholderName={asidePlaceholderName}
                        dividerClass=""
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className='w-full min-w-0'>
              {mainVisible && (
                <div className="w-full min-w-0 px-0">
                  <TextAndAsideMain
                    fields={layoutFields}
                    isEditing={isEditing}
                    rendering={rendering}
                    page={page}
                    showTextPlaceholder={showTextPlaceholder}
                    mainPlaceholderName={mainPlaceholderName}
                  />
                </div>
              )}
              {asideContentVisible && (
                <div
                  className={cn(
                    'w-full min-w-0 max-md:w-full order-1',
                    asideLeft ? 'md:order-1' : 'md:order-2',
                  )}
                >
                  <TextAndAsideAside
                    fields={layoutFields}
                    isEditing={isEditing}
                    rendering={rendering}
                    page={page}
                    media={media}
                    showAsidePlaceholder={showAsidePlaceholder}
                    asidePlaceholderName={asidePlaceholderName}
                    dividerClass=""
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
