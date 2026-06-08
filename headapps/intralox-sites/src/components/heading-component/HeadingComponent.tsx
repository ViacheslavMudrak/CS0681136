import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import type { Field, TextField } from '@sitecore-content-sdk/nextjs';

import type { HeadingComponentProps } from './HeadingComponent.type';
import { cn } from 'lib/utils';
import {
  HEADING_COMPONENT_EMPTY_HINT,
  readHeadingComponentParamString,
  readHeadingTextAlignParam,
  resolveHeadingColorKey,
  resolveHeadingSemanticTag,
  resolveHeadingTextAlignKey,
  trimHeadingNonEmpty,
} from './headingComponentUtils';
import { HeadingComponentTitle } from './partial/HeadingComponentTitle.client';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

const EMPTY_TEXT_FIELD: TextField = { value: '' };

function sitecoreCheckboxTrue(field: Field<boolean> | undefined): boolean {
  const v: unknown = field?.value;
  if (v === true) return true;
  if (v === false || v === undefined || v === null) return false;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    return s === '1' || s === 'true' || s === 'yes';
  }
  return false;
}

/** Heading Atom — eyebrow, title, optional divider; params control color, width, and alignment. */
export const Default = ({
  fields,
  params,
  page,
}: HeadingComponentProps): JSX.Element | null => {
  const { isEditing } = page.mode;
  const styles = params.styles ?? '';
  const anchor = renderingAnchorIdProps(params.RenderingIdentifier);
  const paramsRecord = params as unknown as Record<string, unknown>;

  const textAlignRaw = readHeadingTextAlignParam(paramsRecord);
  const stackAlign = resolveHeadingTextAlignKey(textAlignRaw);

  if (!fields) {
    return (
      <section
        className={cn(
          'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0!',
          'w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
          '[.component_&]:flex-[0_1_auto] [.component_&]:m-0 [.component_&]:w-full [.component_&]:max-w-full',
          'component heading-component',
          styles,
        )}
        {...anchor}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
          <div className="heading-component-outer box-border mx-auto w-full min-w-0 max-w-full px-4 py-12 font-media-tile [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate] min-[600px]:max-w-[600px] min-[768px]:max-w-[768px] min-[992px]:max-w-[992px] min-[992px]:py-16 min-[1200px]:max-w-[1200px]">
            <span className="is-empty-hint">{HEADING_COMPONENT_EMPTY_HINT}</span>
          </div>
        </div>
      </section>
    );
  }

  const textHasContent = trimHeadingNonEmpty(fields.Text?.value);
  if (!isEditing && !textHasContent) {
    return null;
  }

  const colorRaw = readHeadingComponentParamString(paramsRecord, 'Color');
  const widthRaw = readHeadingComponentParamString(paramsRecord, 'Width');
  const colorKey = resolveHeadingColorKey(colorRaw);
  const isWhiteHeading = colorKey === 'white';
  const widthNorm = (widthRaw ?? 'full').toLowerCase().replace(/\s/g, '');
  const headingTag = resolveHeadingSemanticTag(fields.HeadingLevel?.fields?.Value?.value);

  const eyebrowHasContent = trimHeadingNonEmpty(fields.Eyebrow?.value);
  const showEyebrow = eyebrowHasContent || isEditing;
  const showHeading = textHasContent || isEditing;

  const includeDivider =
    sitecoreCheckboxTrue(fields.IncludeDivider) && showHeading;
  const uppercaseHeading = sitecoreCheckboxTrue(fields.UpperCase);

  const eyebrowField = fields.Eyebrow ?? EMPTY_TEXT_FIELD;
  const titleField = fields.Text ?? EMPTY_TEXT_FIELD;

  return (
    <section
      className={cn(
        'box-border flex-[0_0_100%] min-w-0 shrink-0 grow-0 basis-full p-0!',
        'w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]',
        '[.component_&]:flex-[0_1_auto] [.component_&]:m-0 [.component_&]:w-full [.component_&]:max-w-full',
        'component heading-component',
        styles,
      )}
      {...anchor}
    >
      <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
        <div className="heading-component-outer box-border mx-auto w-full min-w-0 max-w-full px-4 py-12 font-media-tile [-webkit-tap-highlight-color:transparent] [unicode-bidi:isolate] min-[600px]:max-w-[600px] min-[768px]:max-w-[768px] min-[992px]:max-w-[992px] min-[992px]:py-16 min-[1200px]:max-w-[1200px]">
          <div
            className={cn(
              'flex w-full flex-col',
              stackAlign === 'center' ?
                'items-center text-center'
              : stackAlign === 'right' ?
                'items-end text-right'
              : 'items-start text-left',
              'w-full max-w-full ms-0 me-auto self-start',
              widthNorm === '4/5' && 'md:max-w-[80%]',
              widthNorm === '3/4' && 'md:max-w-[75%]',
              widthNorm === '2/3' && 'md:max-w-[66.666%]',
              widthNorm === '1/2' && 'md:max-w-[50%]',
            )}
          >
            <div
              className={cn(
                'w-full',
                isWhiteHeading &&
                  'box-border rounded-none bg-surface-strong px-4 py-4 md:px-5 md:py-5',
              )}
            >
              {showEyebrow && (
                <Text
                  tag="p"
                  field={eyebrowField}
                  className="mb-2 m-0 font-media-tile text-sm font-bold uppercase leading-snug tracking-wide text-ink-muted md:text-base"
                />
              )}
              {showHeading && (
                <HeadingComponentTitle
                  field={titleField}
                  headingTag={headingTag}
                  colorKey={colorKey}
                  uppercaseHeading={uppercaseHeading}
                />
              )}
              {includeDivider && (
                <hr
                  className="mt-4 box-border block h-px w-full shrink-0 border-0 border-t border-solid border-stroke-default"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
