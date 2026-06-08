import { JSX } from 'react';

import type { AlertBoxPresentationProps } from './AlertBox.type';
import {
  ALERT_BOX_ARIA_FALLBACK,
  ALERT_BOX_EMPTY_HINT,
  buildAlertAriaLabel,
  hasUsableLinkHref,
} from './alertBoxUtils';
import {
  AlertBoxEmptyStrip,
  AlertBoxShell,
  AlertBoxStrip,
} from './partial/AlertBoxPartials';

export { AlertBoxStrip } from './partial/AlertBoxPartials';
export type { AlertBoxStripProps } from './AlertBox.type';

/**
 * Renders the layout alert strip from route fields (`EnableAlert` + `AlertInfoBox` item).
 *
 * @param props - Presentation props from `Layout`.
 * @param props.enableAlert - Route field toggling alert visibility.
 * @param props.alertInfoBox - Referenced item with text and optional link fields.
 * @param props.isEditing - Whether XM Cloud Pages editing mode is active.
 * @returns Alert strip UI, an `is-empty-hint` when misconfigured in editing mode, or null when hidden.
 */
export function AlertBox({
  enableAlert,
  alertInfoBox,
  isEditing,
}: AlertBoxPresentationProps): JSX.Element | null {
  if (!enableAlert) {
    return null;
  }

  const fields = alertInfoBox?.fields;
  if (!alertInfoBox || !fields) {
    if (!isEditing) {
      return null;
    }
    return (
      <AlertBoxShell>
        <AlertBoxEmptyStrip hint={ALERT_BOX_EMPTY_HINT} />
      </AlertBoxShell>
    );
  }

  const { Text: textField, Link: linkField } = fields;

  const textPlain =
    textField?.value != null && textField.value !== ''
      ? String(textField.value).trim()
      : '';
  const linkTextPlain =
    linkField?.value?.text != null && linkField.value.text !== ''
      ? String(linkField.value.text).trim()
      : '';
  const linkTitlePlain =
    linkField?.value?.title != null && linkField.value.title !== ''
      ? String(linkField.value.title).trim()
      : '';

  const hrefRaw = linkField?.value?.href;
  const hrefStr =
    typeof hrefRaw === 'string'
      ? hrefRaw
      : hrefRaw != null
        ? String(hrefRaw)
        : '';
  const hasHref = hasUsableLinkHref(hrefStr);

  const hasVisibleContent =
    textPlain.length > 0 || (hasHref && linkTextPlain.length > 0);

  if (!isEditing && !hasVisibleContent) {
    return null;
  }

  const showText = textPlain.length > 0 || (isEditing && textField != null);
  const showLink =
    (hasHref && linkTextPlain.length > 0) || (isEditing && linkField != null);
  const hasClickableLink = hasHref && (isEditing || textPlain.length > 0 || linkTextPlain.length > 0);

  const ariaLabel = buildAlertAriaLabel(
    {
      text: textPlain || undefined,
      linkText: linkTextPlain || undefined,
      linkTitle: linkTitlePlain || undefined,
      itemDisplayName: alertInfoBox.displayName,
      itemName: alertInfoBox.name,
    },
    ALERT_BOX_ARIA_FALLBACK,
  );

  if (!showText && !showLink && isEditing) {
    return (
      <AlertBoxShell>
        <AlertBoxEmptyStrip hint={ALERT_BOX_EMPTY_HINT} />
      </AlertBoxShell>
    );
  }

  return (
    <AlertBoxShell>
      <AlertBoxStrip
        textField={textField}
        linkField={linkField}
        showText={showText}
        showLink={showLink || hasClickableLink}
        hasClickableLink={hasClickableLink}
        isEditing={isEditing}
        ariaLabel={ariaLabel}
      />
    </AlertBoxShell>
  );
}

export const Default = AlertBox;