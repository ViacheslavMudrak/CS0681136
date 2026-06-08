import { JSX } from "react";

import { Link as ContentSdkLink } from "@sitecore-content-sdk/nextjs";

import type { FloatingActionButtonPresentationProps } from "./FloatingActionButton.type";
import {
  FLOATING_ACTION_ARIA_FALLBACK,
  buildFloatingActionAriaLabel,
  getFloatingIconLabel,
  hasUsableLinkHref,
  pickFloatingButtonIconRef,
  resolveFloatingFabIcon,
  unwrapSitecoreItemRef,
} from "./floatingActionButtonUtils";
import type {
  FloatingButtonItemFields,
  FloatingButtonReference,
} from "./FloatingActionButton.type";
import {
  FabComponentShell,
  FloatingActionButtonPill,
} from "./partial/FloatingActionButtonPartials";
import { FloatingFabFooterAwareWrap } from "./partial/FloatingFabFooterAwareWrap";

const FAB_AUTHOR_EMPTY_HINT = "Floating action button";

export { FloatingActionButtonPill } from "./partial/FloatingActionButtonPartials";
export type { FloatingActionButtonPillProps } from "./FloatingActionButton.type";

/**
 * Renders the layout floating CTA from route fields (`ShowFloatingButton` + `FloatingButton` item).
 * @param props - Presentation props from `Layout`.
 * @param props.showFloatingButton - Route field toggling FAB visibility.
 * @param props.floatingButton - Referenced item with heading, text, icon, and link fields.
 * @param props.isEditing - Whether XM Cloud Pages editing mode is active.
 * @returns FAB UI, an `is-empty-hint` when misconfigured in editing mode, or null when hidden.
 */
export function FloatingActionButton({
  showFloatingButton,
  floatingButton,
  isEditing,
}: FloatingActionButtonPresentationProps): JSX.Element | null {
  if (!showFloatingButton) {
    return null;
  }

  const floatingButtonItem =
    unwrapSitecoreItemRef<FloatingButtonReference>(floatingButton);
  const fields =
    unwrapSitecoreItemRef<NonNullable<FloatingButtonItemFields>>(
      floatingButtonItem?.fields,
    ) ?? floatingButtonItem?.fields;
  if (!floatingButtonItem || !fields) {
    if (!isEditing) {
      return null;
    }
    return (
      <FloatingFabFooterAwareWrap>
        <FabComponentShell>
          <span className="is-empty-hint">{FAB_AUTHOR_EMPTY_HINT}</span>
        </FabComponentShell>
      </FloatingFabFooterAwareWrap>
    );
  }

  const { Heading, Text: textField, Link: linkField } = fields;
  const iconRef = pickFloatingButtonIconRef(
    fields as Record<string, unknown>,
  );

  const iconLabel = getFloatingIconLabel(iconRef);
  const iconResolved = resolveFloatingFabIcon(iconRef);
  const hrefRaw = linkField?.value?.href;
  const hrefStr =
    typeof hrefRaw === "string"
      ? hrefRaw
      : hrefRaw != null
        ? String(hrefRaw)
        : "";
  const hasHref = hasUsableLinkHref(hrefStr);

  if (!isEditing && (!linkField || !hasHref)) {
    return null;
  }

  const headingPlain =
    Heading?.value != null && Heading.value !== ""
      ? String(Heading.value).trim()
      : "";
  const textPlain =
    textField?.value != null && textField.value !== ""
      ? String(textField.value).trim()
      : "";
  const linkTextPlain =
    linkField?.value?.text != null && linkField.value.text !== ""
      ? String(linkField.value.text).trim()
      : "";
  const linkTitlePlain =
    linkField?.value?.title != null && linkField.value.title !== ""
      ? String(linkField.value.title).trim()
      : "";

  const showHeading = headingPlain.length > 0 || (isEditing && Heading != null);
  const showText = textPlain.length > 0 || (isEditing && textField != null);
  const showIcon = iconResolved != null || (isEditing && iconRef != null);

  const ariaLabel = buildFloatingActionAriaLabel(
    {
      heading: headingPlain || undefined,
      text: textPlain || undefined,
      linkText: linkTextPlain || undefined,
      linkTitle: linkTitlePlain || undefined,
      itemDisplayName: floatingButtonItem.displayName,
      itemName: floatingButtonItem.name,
      iconLabel: iconLabel || undefined,
    },
    FLOATING_ACTION_ARIA_FALLBACK,
  );

  const linkTarget = linkField?.value?.target;

  const pill = (
    <FloatingActionButtonPill
      headingField={Heading}
      textField={textField}
      iconResolved={iconResolved}
      showHeading={showHeading}
      showText={showText}
      showIcon={showIcon}
    />
  );

  if (linkField) {
    return (
      <FloatingFabFooterAwareWrap>
        <FabComponentShell>
          <ContentSdkLink
            field={linkField}
            editable={isEditing}
            className="absolute bottom-0 end-0 z-10 mb-6 me-6 mt-0 ms-0 layout-mobile:mb-4 layout-mobile:me-2 box-border flex h-[70.5px] max-h-[70.5px] min-h-[70.5px] w-[291px] max-w-[291px] shrink-0 cursor-pointer items-center justify-start layout-mobile:w-[240px] layout-mobile:max-w-[240px] overflow-visible p-2 rounded-full border border-solid border-stroke-default bg-surface text-ink-primary font-media-tile layout-mobile:text-font-medium layout-mobile:leading-6 tablet-up:leading-none no-underline outline-none [text-decoration-color:var(--color-ink-primary)] [-webkit-tap-highlight-color:transparent] layout-mobile:[transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to] tablet-up:[transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,box-shadow,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-fab hover:bg-surface-panel-active! hover:text-ink-primary active:bg-surface-active! active:border-accent-teal active:text-ink-primary focus-visible:[outline:2px_solid_var(--color-focus-interactive)] focus-visible:[outline-offset:-4px]"
            aria-label={ariaLabel}
            target={linkTarget || undefined}
            rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}
          >
            {pill}
          </ContentSdkLink>
        </FabComponentShell>
      </FloatingFabFooterAwareWrap>
    );
  }

  return (
    <FloatingFabFooterAwareWrap>
      <FabComponentShell>
        <div
          className="absolute bottom-0 end-0 z-10 mb-6 me-6 mt-0 ms-0 layout-mobile:mb-4 layout-mobile:me-2 box-border flex h-[70.5px] max-h-[70.5px] min-h-[70.5px] w-[291px] max-w-[291px] shrink-0 cursor-pointer items-center justify-start layout-mobile:w-[240px] layout-mobile:max-w-[240px] overflow-visible p-2 rounded-full border border-solid border-stroke-default bg-surface text-ink-primary font-media-tile layout-mobile:text-font-medium layout-mobile:leading-6 tablet-up:leading-none no-underline outline-none [text-decoration-color:var(--color-ink-primary)] [-webkit-tap-highlight-color:transparent] layout-mobile:[transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to] tablet-up:[transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,box-shadow,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-fab hover:bg-surface-panel-active! hover:text-ink-primary active:bg-surface-active! active:border-accent-teal active:text-ink-primary focus-visible:[outline:2px_solid_var(--color-focus-interactive)] focus-visible:[outline-offset:-4px]"
          role="group"
          aria-label={ariaLabel}
        >
          {pill}
        </div>
      </FabComponentShell>
    </FloatingFabFooterAwareWrap>
  );
}

/**
 * Variant alias for XM Cloud component conventions (`Default` export pattern).
 */
export const Default = FloatingActionButton;
