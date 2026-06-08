'use client';

import { JSX, type ReactNode } from 'react';

import { Link as SitecoreLink, Text } from '@sitecore-content-sdk/nextjs';

import { ICON_CHEVRON_RIGHT } from 'lib/chrome-icons';

import {
  ALERT_BOX_ARIA_FALLBACK,
  LAYOUT_ALERT_BOX_STRIP_ID,
} from 'components/alert-box/alertBoxUtils';
import type { AlertBoxStripProps } from 'components/alert-box/AlertBox.type';
import UiAlertBox from 'components/ui/AlertBox';
import UiLink from 'components/ui/Link';

const LAYOUT_ALERT_BOX_ID = 'layout-alert-box';

/**
 * Standard Sitecore wrapper for the layout alert strip (Tailwind `!` resets SXA padding).
 *
 * @param children - Strip content or authoring hint.
 */
export function AlertBoxShell({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div
      className="component alert-box !m-0 !box-border !w-full !max-w-none !p-0"
      id={LAYOUT_ALERT_BOX_ID}
      data-testid="alert-box"
    >
      <div className="component-content !m-0 !box-border !w-full !max-w-none !p-0">
        {children}
      </div>
    </div>
  );
}

export function AlertBoxEmptyStrip({ hint }: { hint: string }): JSX.Element {
  return (
    <section
      id={LAYOUT_ALERT_BOX_STRIP_ID}
      role="status"
      aria-live="polite"
      aria-label={ALERT_BOX_ARIA_FALLBACK}
    >
      <UiAlertBox layoutStrip hideIcon variant="warning">
        <div className="box-border !m-0 w-full max-w-[1920px] !p-0 !text-center max-md:col-span-full max-md:flex max-md:w-full max-md:min-h-[46.6667px] max-md:h-auto max-md:flex-wrap max-md:items-center max-md:justify-center max-md:px-2 max-md:py-1 md:flex md:h-full md:w-full md:flex-nowrap md:items-center md:justify-center md:px-4 md:py-0 text-ink-primary text-callout-label-xs leading-callout-label-xs md:text-font-media-tile-eyebrow md:leading-font-media-tile-eyebrow text-center">
          <span className="is-empty-hint">{hint}</span>
        </div>
      </UiAlertBox>
    </section>
  );
}

function AlertBoxCopyCluster({
  textField,
  showText,
  showLink,
  hasClickableLink,
  linkTextPlain,
  textPlain,
}: Pick<
  AlertBoxStripProps,
  'textField' | 'showText' | 'showLink' | 'hasClickableLink'
> & {
  linkTextPlain: string;
  textPlain: string;
}): JSX.Element {
  const showInlineLinkLabel =
    showLink &&
    !hasClickableLink &&
    linkTextPlain.length > 0 &&
    !textPlain.toLowerCase().includes(linkTextPlain.toLowerCase());

  return (
    <>
      {showText && textField ? (
        <Text
          field={textField}
          tag="span"
          className="text-ink-primary text-callout-label-xs leading-callout-label-xs md:text-font-media-tile-eyebrow md:leading-font-media-tile-eyebrow inline align-middle max-md:inline max-md:max-w-full max-md:!text-center max-md:leading-inherit md:inline"
        />
      ) : null}
      {showInlineLinkLabel ? (
        <span className="text-ink-primary text-callout-label-xs leading-callout-label-xs md:text-font-media-tile-eyebrow md:leading-font-media-tile-eyebrow font-bold underline underline-offset-2 decoration-1">
          {linkTextPlain}
        </span>
      ) : null}
      {showLink ? (
        <span
          className="inline-flex shrink-0 items-center justify-center leading-none text-current max-md:ml-px max-md:inline-flex max-md:h-[12px] max-md:max-h-[12px] max-md:align-middle max-md:translate-y-px max-md:!leading-none md:translate-y-px [&_svg]:m-0 [&_svg]:block [&_svg]:shrink-0 [&_svg]:leading-none"
          aria-hidden="true"
        >
          {ICON_CHEVRON_RIGHT}
        </span>
      ) : null}
    </>
  );
}

/**
 * Centered warning strip; entire message navigates when a link href is configured.
 *
 * @param props - Field refs, visibility flags, and accessibility label.
 */
export function AlertBoxStrip({
  textField,
  linkField,
  showText,
  showLink,
  hasClickableLink,
  isEditing,
  ariaLabel,
}: AlertBoxStripProps): JSX.Element {
  const linkTarget = linkField?.value?.target;

  let textPlain = '';
  if (textField?.value != null && textField.value !== '') {
    textPlain = String(textField.value).trim();
  }

  let linkTextPlain = '';
  if (linkField?.value?.text != null && linkField.value.text !== '') {
    linkTextPlain = String(linkField.value.text).trim();
  }

  const copy = (
    <AlertBoxCopyCluster
      textField={textField}
      showText={showText}
      showLink={showLink}
      hasClickableLink={hasClickableLink}
      linkTextPlain={linkTextPlain}
      textPlain={textPlain}
    />
  );

  const href = String(linkField?.value?.href ?? '').trim();
  const linkRel = linkTarget === '_blank' ? 'noopener noreferrer' : undefined;
  const copyCluster = (
    <span className="m-0 box-border max-w-full !text-center text-ink-primary text-callout-label-xs leading-callout-label-xs md:text-font-media-tile-eyebrow md:leading-font-media-tile-eyebrow max-md:inline-block max-md:w-full max-md:whitespace-normal max-md:px-1 max-md:!leading-[12px] max-md:[&_*]:leading-inherit md:inline-flex md:h-[25.5px] md:w-auto md:items-center md:justify-center md:gap-x-px md:whitespace-nowrap md:[&_*]:!m-0 md:[&_*]:inline md:[&_*]:align-middle">
      {copy}
    </span>
  );

  const linkBody =
    hasClickableLink && linkField && !isEditing ? (
      <UiLink
        href={href}
        className="box-border !m-0 cursor-pointer items-center justify-center !text-center no-underline text-ink-primary text-callout-label-xs leading-callout-label-xs md:text-font-media-tile-eyebrow md:leading-font-media-tile-eyebrow transition-colors duration-150 hover:text-link-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-inset [&_*]:cursor-pointer max-md:flex max-md:w-full max-md:max-w-full max-md:flex-wrap max-md:justify-center md:inline-flex md:mx-auto md:h-[25.5px] md:w-auto md:max-w-full md:flex-nowrap"
        aria-label={ariaLabel}
        target={linkTarget || undefined}
        rel={linkRel}
      >
        {copyCluster}
      </UiLink>
    ) : hasClickableLink && linkField ? (
      <SitecoreLink
        field={linkField}
        editable={isEditing}
        className="box-border !m-0 cursor-pointer items-center justify-center !text-center no-underline text-ink-primary text-callout-label-xs leading-callout-label-xs md:text-font-media-tile-eyebrow md:leading-font-media-tile-eyebrow transition-colors duration-150 hover:text-link-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-interactive focus-visible:ring-inset [&_*]:cursor-pointer max-md:flex max-md:w-full max-md:max-w-full max-md:flex-wrap max-md:justify-center md:inline-flex md:mx-auto md:h-[25.5px] md:w-auto md:max-w-full md:flex-nowrap"
        aria-label={ariaLabel}
        target={linkTarget || undefined}
        rel={linkRel}
      >
        {copyCluster}
      </SitecoreLink>
    ) : (
      <p className="m-0 box-border max-w-full !text-center text-ink-primary text-callout-label-xs leading-callout-label-xs md:text-font-media-tile-eyebrow md:leading-font-media-tile-eyebrow max-md:inline-block max-md:w-full max-md:whitespace-normal max-md:px-1 max-md:!leading-[12px] max-md:[&_*]:leading-inherit md:inline-flex md:h-[25.5px] md:w-auto md:items-center md:justify-center md:gap-x-px md:whitespace-nowrap md:[&_*]:!m-0 md:[&_*]:inline md:[&_*]:align-middle">
        {copy}
      </p>
    );

  return (
    <section
      id={LAYOUT_ALERT_BOX_STRIP_ID}
      role="status"
      aria-live="polite"
      aria-label={hasClickableLink ? undefined : ariaLabel}
    >
      <UiAlertBox layoutStrip hideIcon variant="warning">
        <div className="box-border !m-0 w-full max-w-[1920px] !p-0 !text-center max-md:col-span-full max-md:flex max-md:w-full max-md:min-h-[46.6667px] max-md:h-auto max-md:flex-wrap max-md:items-center max-md:justify-center max-md:px-2 max-md:py-1 md:flex md:h-full md:w-full md:flex-nowrap md:items-center md:justify-center md:px-4 md:py-0 text-ink-primary text-callout-label-xs leading-callout-label-xs md:text-font-media-tile-eyebrow md:leading-font-media-tile-eyebrow">{linkBody}</div>
      </UiAlertBox>
    </section>
  );
}
