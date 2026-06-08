import type { JSX } from 'react';

import type { ComponentRendering } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

import { Default as CalloutDefault } from 'components/callout/Callout';
import type { CalloutProps } from 'components/callout/Callout.type';
import { readLinkGroupParamValue } from 'components/link-group/linkGroupUtils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import type { GlobalLocationsFields, GlobalLocationsProps } from './GlobalLocations.type';
import {
  GLOBAL_LOCATIONS_LABELS,
  globalLocationsHasPreviewContent,
  globalLocationsShouldRenderCalloutStats,
  mergeGlobalLocationsRenderingParams,
  readGlobalLocationsBackgroundColorParam,
  resolveGlobalLocationsSectionAriaLabel,
  readGlobalLocationsSectionSurface,
  resolveGlobalLocationsFields,
} from './globalLocationsUtils';
import {
  GLOBAL_LOCATIONS_HEADING_DOM_ID,
  GlobalLocationsCopyStack,
  GlobalLocationsLinksRow,
  GlobalLocationsMap,
} from './partial/GlobalLocationsPartials';
import {
  GlobalLocationsContentContainer,
  GlobalLocationsSectionShell,
} from './partial/GlobalLocationsAtoms';

function renderingNameForAria(rendering: ComponentRendering | undefined): string | undefined {
  if (!rendering) return undefined;
  const r = rendering as unknown as Record<string, unknown>;
  const dn = r.displayName;
  if (typeof dn === 'string' && dn.trim()) return dn.trim();
  const cnName = r.componentName;
  if (typeof cnName === 'string' && cnName.trim()) return cnName.trim();
  return undefined;
}

/** Global Locations: centered copy, CTAs, optional Callout stats band, and world map. */
export async function Default({
  fields,
  params,
  page,
  rendering,
}: GlobalLocationsProps): Promise<JSX.Element | null> {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchor = renderingAnchorIdProps(params.RenderingIdentifier);
  const merged = mergeGlobalLocationsRenderingParams(rendering, params as Record<string, unknown>);
  const colorSchemeRaw = readLinkGroupParamValue(merged, 'ColorScheme');
  const bgParam = readGlobalLocationsBackgroundColorParam(merged);
  const { surface: sectionSurface, isDarkSection } = readGlobalLocationsSectionSurface(
    colorSchemeRaw,
    bgParam,
  );

  if (!fields) {
    return (
      <GlobalLocationsSectionShell
        sectionSurface={sectionSurface}
        styles={styles}
        anchorProps={anchor}
        sectionAriaProps={{}}
      >
        <GlobalLocationsContentContainer>
          <span className="is-empty-hint">{GLOBAL_LOCATIONS_LABELS.emptyHint}</span>
        </GlobalLocationsContentContainer>
      </GlobalLocationsSectionShell>
    );
  }

  const resolvedFields = resolveGlobalLocationsFields(fields) ?? fields;
  const hasPreview = globalLocationsHasPreviewContent(resolvedFields, isEditing);
  if (!hasPreview) {
    return null;
  }

  const textAlignRaw = readLinkGroupParamValue(merged, 'TextAlignment');
  const textWidthRaw = readLinkGroupParamValue(merged, 'TextWidth');

  const textAlignKey = textAlignRaw?.trim().toLowerCase() ?? '';
  const textAlign =
    textAlignKey === 'left' ? 'text-left'
    : textAlignKey === 'right' ? 'text-right'
    : 'text-center';
  const flexAlign =
    textAlignKey === 'left' ? 'items-start justify-start'
    : textAlignKey === 'right' ? 'items-end justify-end'
    : 'items-center justify-center';
  const buttonAlignmentRaw = resolvedFields.ButtonAlignment?.fields?.Value?.value;
  const buttonAlignmentKey =
    typeof buttonAlignmentRaw === 'string' ? buttonAlignmentRaw.trim().toLowerCase() : '';
  const buttonRowJustify =
    buttonAlignmentKey === 'left' ? 'justify-start'
    : buttonAlignmentKey === 'right' ? 'justify-end'
    : 'justify-center';
  const copyWidthN = Number(textWidthRaw?.trim());
  const showH2 = Boolean(
    resolvedFields.Eyebrow?.value != null &&
      String(resolvedFields.Eyebrow.value).trim().length > 0 &&
      (resolvedFields.Headline?.value != null ?
        String(resolvedFields.Headline.value).trim().length > 0
      : isEditing),
  );
  const sectionAria =
    showH2 ?
      { 'aria-labelledby': GLOBAL_LOCATIONS_HEADING_DOM_ID }
    : {
        'aria-label': resolveGlobalLocationsSectionAriaLabel(
          resolvedFields,
          renderingNameForAria(rendering),
        ),
      };

  const calloutStats =
    globalLocationsShouldRenderCalloutStats(resolvedFields.CalloutItems, isEditing) ?
      await CalloutDefault({
        fields: { CalloutItems: resolvedFields.CalloutItems },
        params: {
          ...params,
          styles: '',
          ...(textAlignRaw ?
            { TextAlign: { Value: { value: textAlignRaw } } }
          : {}),
        } as CalloutProps['params'],
        page,
        rendering,
        embeddedLayout: true,
        globalLocationsLayout: true,
        globalLocationsFlexAlignClass: flexAlign,
        globalLocationsTextAlignClass: textAlign,
        globalLocationsStatsEmptyHint: GLOBAL_LOCATIONS_LABELS.noCalloutsConfigured,
      })
    : null;

  return (
    <GlobalLocationsSectionShell
      sectionSurface={sectionSurface}
      styles={styles}
      anchorProps={anchor}
      sectionAriaProps={sectionAria}
    >
      <GlobalLocationsContentContainer>
        <div className={cn('w-full min-w-0', textAlign)}>
          <div
            className={cn(
              'box-border mx-auto flex w-full min-w-0 max-w-full flex-col gap-0',
              '[unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
              Number.isFinite(copyWidthN) && copyWidthN > 0 && copyWidthN <= 100
                ? [
                    `max-w-[${copyWidthN}%]`,
                    `min-[600px]:max-md:w-[min(${copyWidthN}%,var(--width-global-locations-copy-sm))] min-[600px]:max-md:max-w-[min(${copyWidthN}%,var(--width-global-locations-copy-sm))]`,
                    `min-[768px]:max-lg:w-[min(${copyWidthN}%,var(--width-global-locations-copy-md))] min-[768px]:max-lg:max-w-[min(${copyWidthN}%,var(--width-global-locations-copy-md))]`,
                    `min-[992px]:max-xl:w-[min(${copyWidthN}%,var(--width-global-locations-copy-lg))] min-[992px]:max-xl:max-w-[min(${copyWidthN}%,var(--width-global-locations-copy-lg))]`,
                    `min-[1200px]:w-[min(${copyWidthN}%,var(--width-global-locations-copy-max))] min-[1200px]:max-w-[min(${copyWidthN}%,var(--width-global-locations-copy-max))]`,
                  ]
                : [
                    'min-[600px]:max-md:w-[length:var(--width-global-locations-copy-sm)] min-[600px]:max-md:max-w-[length:var(--width-global-locations-copy-sm)]',
                    'min-[768px]:max-lg:w-[length:var(--width-global-locations-copy-md)] min-[768px]:max-lg:max-w-[length:var(--width-global-locations-copy-md)]',
                    'min-[992px]:max-xl:w-[length:var(--width-global-locations-copy-lg)] min-[992px]:max-xl:max-w-[length:var(--width-global-locations-copy-lg)]',
                    'min-[1200px]:w-[length:var(--width-global-locations-copy-max)] min-[1200px]:max-w-[length:var(--width-global-locations-copy-max)]',
                  ],
              flexAlign,
              'flex w-full min-w-0 flex-col gap-[length:var(--margin-global-locations-copy-block)]',
            )}
          >
            <GlobalLocationsCopyStack
              fields={resolvedFields}
              isEditing={isEditing}
              textAlignClass={textAlign}
              flexAlignClass={flexAlign}
              colorSchemeRaw={colorSchemeRaw}
              isDarkSection={isDarkSection}
            />
            <GlobalLocationsLinksRow
              links={resolvedFields.Links}
              isEditing={isEditing}
              groupAriaLabel={renderingNameForAria(rendering)}
              buttonRowJustifyClass={buttonRowJustify}
              textAlignClass={textAlign}
            />
            {calloutStats}
          </div>
          <GlobalLocationsMap
            image={resolvedFields.Image}
            focalPointValue={resolvedFields.FocalPoint?.fields?.Value?.value?.toString()}
            isEditing={isEditing}
          />
        </div>
      </GlobalLocationsContentContainer>
    </GlobalLocationsSectionShell>
  );
}
