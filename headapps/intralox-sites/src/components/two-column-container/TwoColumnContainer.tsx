import type { JSX } from 'react';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import componentMap from '.sitecore/component-map';
import { cn } from 'lib/utils';

import type { TwoColumnContainerProps } from 'components/two-column-container/TwoColumnContainer.type';

import {
  normalizeTwoColumnSizeToken,
  readTwoColumnSizeParam,
  resolveTwoColumnLayoutKey,
} from 'components/two-column-container/twoColumnContainerUtils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

const LEFT_PLACEHOLDER = 'left-column-{*}';
const RIGHT_PLACEHOLDER = 'right-column-{*}';

/**
 * Two-column layout shell driven by `Size` (50/50, 70/30, 30/70). Renders Sitecore
 * placeholders for left and right columns. From `md` up, **70/30** splits width after the fixed
 * inter-column gap. Each track stacks placeholder renderings with a vertical flex gap: **30px** on
 * the left column, **16px** on the right rail.
 *
 * @param params - Rendering params (`Size`, `styles`, `RenderingIdentifier`)
 * @param rendering - Current rendering (placeholder resolution)
 * @param page - Page context
 */
export function Default({ params, rendering, page }: TwoColumnContainerProps): JSX.Element {
  const styles = params.styles ?? '';
  const sizeRaw = readTwoColumnSizeParam(params as Record<string, unknown>);
  const layoutKey = resolveTwoColumnLayoutKey(normalizeTwoColumnSizeToken(sizeRaw));

  return (
    <section
      className={cn(
        'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0!',
        'w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
        'component two-column-container [&_.search-component]:pt-4',
        '[&_aside_ul[role=list]]:m-0 [&_aside_ul[role=list]]:ml-0 [&_aside_ul[role=list]]:my-0 [&_aside_ul[role=list]]:mt-0 [&_aside_ul[role=list]]:p-0 [&_aside_ul[role=list]]:py-0 [&_aside_ul[role=list]]:ps-0',
        '[&_aside_ul[role=list]>li]:ml-0 [&_aside_ul[role=list]>li]:my-0 [&_aside_ul[role=list]>li]:list-none [&_aside_ul[role=list]>li]:pl-0 [&_aside_ul[role=list]>li]:text-inherit [&_aside_ul[role=list]>li]:leading-inherit [&_aside_ul[role=list]>li]:font-inherit',
        '[&_.component.testimonial_.component-content>div]:p-0!',
        '[&_.component.related-case-studies[data-card-size=base]]:box-border [&_.component.related-case-studies[data-card-size=base]]:flex-[0_1_auto] [&_.component.related-case-studies[data-card-size=base]]:ml-0 [&_.component.related-case-studies[data-card-size=base]]:mr-0 [&_.component.related-case-studies[data-card-size=base]]:max-w-full [&_.component.related-case-studies[data-card-size=base]]:min-w-0 [&_.component.related-case-studies[data-card-size=base]]:p-0 [&_.component.related-case-studies[data-card-size=base]]:w-full',
        '[&_.component.related-case-studies[data-card-size=base]>.component-content]:box-border [&_.component.related-case-studies[data-card-size=base]>.component-content]:ml-0 [&_.component.related-case-studies[data-card-size=base]>.component-content]:mr-0 [&_.component.related-case-studies[data-card-size=base]>.component-content]:max-w-none [&_.component.related-case-studies[data-card-size=base]>.component-content]:min-w-0 [&_.component.related-case-studies[data-card-size=base]>.component-content]:w-full',
        '[&_.component.related-case-studies[data-card-size=base]_.two-column-container-outer]:box-border [&_.component.related-case-studies[data-card-size=base]_.two-column-container-outer]:ml-0 [&_.component.related-case-studies[data-card-size=base]_.two-column-container-outer]:mr-0 [&_.component.related-case-studies[data-card-size=base]_.two-column-container-outer]:max-w-none [&_.component.related-case-studies[data-card-size=base]_.two-column-container-outer]:min-w-0 [&_.component.related-case-studies[data-card-size=base]_.two-column-container-outer]:p-0 [&_.component.related-case-studies[data-card-size=base]_.two-column-container-outer]:w-full',
        styles,
      )}
      {...renderingAnchorIdProps(params.RenderingIdentifier)}
      data-testid="two-column-container"
      data-layout={layoutKey}
    >
      <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
        <div
          className="two-column-container-outer box-border mx-auto w-full min-w-0 max-w-full px-4 py-12 min-[600px]:max-w-[600px] min-[768px]:max-[991px]:max-w-[length:var(--width-banded-section-max-tablet)] min-[992px]:max-w-[992px] min-[992px]:py-16 min-[1200px]:max-w-[1200px] max-md:has-[.two-column-right-column>aside.component.quick-link-group:last-child]:pb-6"
          data-testid="two-column-container-outer"
        >
          <div
            className={cn(
              'grid w-full min-w-0 max-w-full grid-cols-1 items-start gap-6 md:gap-x-[length:var(--two-column-column-gap)] md:gap-y-0',
              layoutKey === '70X30' && 'md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]',
              layoutKey === '30X70' && 'md:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]',
              layoutKey === '50X50' && 'md:grid-cols-2',
            )}
          >
            <div className="two-column-left-column box-border flex min-w-0 flex-col gap-[30px] [&_section]:pt-0 [&_section]:pb-0 [&_section_.container]:px-0">
              <AppPlaceholder
                name={LEFT_PLACEHOLDER}
                rendering={rendering}
                page={page}
                componentMap={componentMap}
                disableSuspense
              />
            </div>
            <div
              className={cn(
                'two-column-right-column box-border flex min-w-0 flex-col gap-[16px]',
                '[&>.component:not(:last-child):not(aside.component.quick-link-group)]:box-border [&>.component:not(:last-child):not(aside.component.quick-link-group)]:border-b [&>.component:not(:last-child):not(aside.component.quick-link-group)]:border-stroke-default [&>.component:not(:last-child):not(aside.component.quick-link-group)]:pb-6',
                '[&>section.component.quick-link-group:not(:last-child)]:pb-2 [&>aside.component.related-case-studies:not(:last-child)]:pb-2',
                '[&>section.component.quick-link-group:not(:last-child):has(+aside.component.quick-link-group)]:!pb-1',
                '[&>.component.quick-link-group:not(:last-child)_.quick-link-group-outer>:last-child:has([data-testid=quick-link-group-sidebar-divider])]:hidden',
                '[&>*+aside.component.quick-link-group]:!-mt-10 [&>section.component.quick-link-group+aside.component.quick-link-group]:!-mt-10',
                '[&>aside.component.quick-link-group:first-child]:!mt-0',
                '[&>aside.component.quick-link-group:first-child_.quick-link-group-outer>div:first-child]:!mt-0',
                'max-md:[&_aside.component.quick-link-group>.component-content]:!pb-0',
                'max-md:[&_aside.component.quick-link-group_.quick-link-group-outer>div:first-child]:!pb-4',
                'max-md:[&>aside.component.quick-link-group:first-child>.component-content]:!pt-6',
                'md:[&>aside.component.quick-link-group:first-child>.component-content]:!pt-[67px]',
                '[&>*+aside.component.quick-link-group>.component-content]:!pt-0',
                '[&>section.component.quick-link-group+aside.component.quick-link-group>.component-content]:!pt-0',
                '[&>*+aside.component.quick-link-group_.quick-link-group-outer>div:first-child]:!-mt-3',
                '[&>section.component.quick-link-group+aside.component.quick-link-group_.quick-link-group-outer>div:first-child]:!-mt-3',
              )}
            >
              <AppPlaceholder
                name={RIGHT_PLACEHOLDER}
                rendering={rendering}
                page={page}
                componentMap={componentMap}
                disableSuspense
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
