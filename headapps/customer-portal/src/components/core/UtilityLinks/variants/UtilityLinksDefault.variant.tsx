import { NextImage, RichText, Text } from "@sitecore-content-sdk/nextjs";
import type { JSX } from "react";

import { LocalizedImageFieldLink } from "@/components/image/LocalizedImageFieldLink";
import type { ComponentProps } from "@/lib/component-props";

import { UtilityLinksClickTracker } from "../partial/UtilityLinksClickTracker";
import type { IUtilityLinksFields } from "../UtilityLinks.type";
import { parseUtilityLinkDisplayPosition, resolveUtilityLinkField } from "../utilityLinksUtils";
import ChevronRightIcon from "@/components/shared/icons/ChevronRightIcon";

interface UtilityLinksDefaultVariantProps {
  testId: string;
  fields: IUtilityLinksFields | null;
  params: ComponentProps["params"];
  page: ComponentProps["page"];
}

export function UtilityLinksDefaultVariant({
  testId,
  fields,
  params,
  page,
}: UtilityLinksDefaultVariantProps): JSX.Element | null {
  const {
    styles: paramsStyles,
    RenderingIdentifier: id,
    HideTile,
  } = params as ComponentProps["params"] & {
    HideTile?: unknown;
  };
  const { isEditing } = page.mode;
  const showSection = isEditing || !Boolean(Number(HideTile));

  if (!fields) {
    return (
      <div
        className={`component utility-links w-full ${paramsStyles ?? ""}`.trim()}
        id={id}
        data-testid={testId}
      >
        <div className="component-content">
          <span className="is-empty-hint">Utility links</span>
        </div>
      </div>
    );
  }

  if (!showSection) {
    return null;
  }

  const linkField = resolveUtilityLinkField(fields);
  const linkPosition = parseUtilityLinkDisplayPosition(fields);
  const linkLabel = String(fields.Label?.value ?? "").trim();
  const aria = linkLabel || "Utility link";

  const body = (
    <>
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-gray-100,#f8f8f8)]">
        {fields.Icon?.value?.src ? (
          <NextImage
            field={fields.Icon}
            width={24}
            height={24}
            className="size-6 max-h-6 max-w-6 object-contain"
            sizes="32px"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 items-center gap-0.5">
        {fields.Label?.value ? (
          <span className="text-[16px] font-[700] leading-[1.38] text-[var(--color-link-text)]">
            <Text field={fields.Label} tag="span" />
          </span>
        ) : null}
        <ChevronRightIcon
          width="28px"
          height="28px"
          className="shrink-0 pt-0.5 text-[12.5px] text-[var(--color-link-text)]"
        />
      </div>
      {fields.Description?.value ? (
        <div className="text-[14px] font-[400] leading-[1.375] text-[var(--color-gray-700,#646467)]">
          <RichText field={fields.Description} tag="div" />
        </div>
      ) : null}
    </>
  );

  return (
    <section
      className={`component utility-links w-full ${paramsStyles ?? ""}`.trim()}
      id={id}
      data-testid={testId}
      aria-label="Utility links"
    >
      <div className="flex w-full min-w-0 flex-wrap items-stretch gap-[16px]">
        {linkField ? (
          <article
            className="box-border flex min-w-[200px] flex-1 flex-col rounded-lg border border-[var(--color-border-default)] bg-white p-[20px]"
            aria-label={aria}
          >
            <UtilityLinksClickTracker
              linkLabel={linkLabel}
              linkPosition={linkPosition}
              isEditing={isEditing}
            >
              <LocalizedImageFieldLink
                field={linkField}
                className="flex min-h-0 min-w-0 flex-1 flex-col gap-[8px] text-inherit no-underline outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-action-primary)]"
              >
                {body}
              </LocalizedImageFieldLink>
            </UtilityLinksClickTracker>
          </article>
        ) : (
          <article
            className="box-border flex min-w-[200px] flex-1 flex-col rounded-lg border border-[var(--color-border-default)] bg-white p-[20px]"
            aria-label={aria}
          >
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-[8px] text-inherit no-underline outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-action-primary)]">
              {body}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
