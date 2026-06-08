
import { NextImage as ContentSdkImage } from "@sitecore-content-sdk/nextjs";
import type { ImageField } from "@sitecore-content-sdk/nextjs";
import type { ReactElement } from "react";

import { CheckIcon } from "@/components/shared/icons";

export interface RolePermissionsCheckmarkCellProps {
  hasPermission: boolean;
  iconField?: ImageField;
}

/**
 * View mode cell: Sitecore tick image when granted, empty when not.
 */
export function RolePermissionsCheckmarkCell({
  hasPermission,
  iconField,
}: RolePermissionsCheckmarkCellProps): ReactElement {
  if (!hasPermission) {
    return (
      <div className="text-center" aria-label="Permission not granted" />
    );
  }

  const src = iconField?.value?.src;
  if (src) {
    return (
      <div
        className="text-center flex justify-center items-center"
        role="img"
        aria-label="Permission granted"
      >
        <ContentSdkImage
          field={iconField}
          width={16}
          height={16}
          alt={(iconField?.value?.alt ?? "") as string}
          className="size-[16px] object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center text-[16px] text-[var(--color-role-permissions-checkmark)]"
      role="img"
      aria-label="Permission granted"
    >
      <CheckIcon />
    </div>
  );
}
