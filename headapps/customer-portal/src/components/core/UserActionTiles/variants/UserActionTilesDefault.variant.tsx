import { NextImage, RichText, Text, type LinkField } from "@sitecore-content-sdk/nextjs";
import React from "react";

import ChevronRightIcon from "@/components/shared/icons/ChevronRightIcon";
import type { ComponentProps } from "@/lib/component-props";
import {
  getOrderManagementTabLinkRaw,
  toOrderManagementLinkFieldWithHref,
} from "@/lib/orderManagementUtils";

import type { IUserActionTilesFields, IUserActionTileItem } from "../UserActionTiles.type";
import { prepareUserActionTilesForDisplay } from "@/lib/userActionTilesUtils";

import { RenderLocalizedLink } from "./components/RenderLocalizedLink";

interface UserActionTilesDefaultVariantProps {
  testId: string;
  fields: IUserActionTilesFields | null;
  params: ComponentProps["params"];
  page: ComponentProps["page"];
}

function UserActionTileCard({
  tile,
  isEditing,
  pillPosition,
}: {
  tile: IUserActionTileItem;
  isEditing: boolean;
  pillPosition: number;
}): React.ReactElement {
  const f = tile.fields ?? {};
  const rawHref = getOrderManagementTabLinkRaw(f.TileURL)?.trim() ?? "";
  const linkField: LinkField | undefined =
    toOrderManagementLinkFieldWithHref(f.TileURL) ?? f.TileURL;
  const ariaLabel = String(f.TileTitle?.value ?? tile.displayName ?? "Navigation pill");
  const pillLabelForAnalytics = String(f.TileTitle?.value ?? tile.displayName ?? "").trim();

  const body = (
    <div className="flex flex-col gap-[20px]">
      <div className="flex h-[28px] w-[28px] items-center justify-start">
        {f.TileIcon?.value?.src ? (
          <NextImage field={f.TileIcon} width={28} height={28} sizes="40px" />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-[6px]">
        <div className="flex min-w-0 items-center gap-1">
          {(f.TileTitle?.value || isEditing) && (
            <span className="text-[var(--color-bg-black)] md:text-[16px] lg:text-[18px] font-[500] leading-[1.38]">
              <Text field={f.TileTitle} tag="span" />
            </span>
          )}
          {rawHref || isEditing ? (
            <ChevronRightIcon
              width="28px"
              height="28px"
              className="shrink-0 pt-0.5 text-[12.5px] text-[var(--color-bg-black)]"
            />
          ) : null}
        </div>
        {(f.TileDescription?.value || isEditing) && (
          <span className="text-[var(--color-gray-700)] md:text-[12px] lg:text-[14px] font-[400] leading-[1.38]">
            <RichText field={f.TileDescription} tag="div" />
          </span>
        )}
      </div>
    </div>
  );

  if (linkField && rawHref) {
    return (
      <RenderLocalizedLink
        ariaLabel={ariaLabel}
        linkField={linkField}
        body={body}
        pillLabelForAnalytics={pillLabelForAnalytics}
        pillPosition={pillPosition}
      />
    );
  }
  return (
    <div
      className="box-border flex min-w-[140px] flex-1 flex-col rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)]"
      role="listitem"
      aria-label={ariaLabel}
    >
      <div className="box-border flex min-h-0 min-w-0 flex-1 flex-col px-[18px] py-[20px] text-inherit no-underline outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-action-primary)] lg:p-[24px]">
        {body}
      </div>
    </div>
  );
}

export function UserActionTilesDefaultVariant({
  testId,
  fields,
  params,
  page,
}: UserActionTilesDefaultVariantProps): React.ReactElement | null {
  const { styles: paramsStyles, RenderingIdentifier: id, HideUserActionTiles } = params;
  const { isEditing } = page.mode;
  const showUserActionTiles = isEditing || !Boolean(Number(HideUserActionTiles));

  if (!fields) {
    return (
      <div
        className={`component user-action-tiles ${paramsStyles ?? ""}`.trim()}
        id={id}
        data-testid={testId}
      >
        <div className="component-content">
          <span className="is-empty-hint">User action tiles</span>
        </div>
      </div>
    );
  }

  const tilesPrepared = prepareUserActionTilesForDisplay(fields.TilesSelection, isEditing);

  if (!showUserActionTiles || tilesPrepared.length === 0) {
    return null;
  }

  return (
    <section
      className={`component user-action-tiles ${paramsStyles ?? ""}`.trim()}
      id={id}
      data-testid={testId}
      aria-label="User action tiles"
    >
      <div className="mb-[21px]">
        {tilesPrepared.length > 0 ? (
          <div
            className="flex w-full min-w-0 flex-wrap items-stretch gap-4 lg:gap-[20px]"
            role="list"
          >
            {tilesPrepared.map((tile, index) => (
              <UserActionTileCard
                key={tile.id}
                tile={tile}
                isEditing={isEditing}
                pillPosition={index + 1}
              />
            ))}
          </div>
        ) : undefined}
      </div>
    </section>
  );
}
