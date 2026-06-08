import LibraryIcon from "@/components/shared/icons/Icon";
import React from "react";

/** Single even-odd path: outer frame, inner fill, and arrow stay aligned. */
const EXTERNAL_LINK_ICON_PATH =
  "M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm5.854 8.803a.5.5 0 1 1-.708-.707L9.243 6H6.475a.5.5 0 1 1 0-1h3.975a.5.5 0 0 1 .5.5v3.975a.5.5 0 1 1-1 0V6.707z";

type ShipmentsExternalLinkIconProps = {
  size?: number;
};

export function ShipmentsExternalLinkIcon({
  size = 16,
}: ShipmentsExternalLinkIconProps): React.ReactElement {
  const strokeWidth = size <= 13 ? 0.35 : 0.65;

  return (
    <LibraryIcon
      width={size}
      height={size}
      viewBox="-0.75 -0.75 17.5 17.5"
      decorative
      className="overflow-visible"
    >
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        paintOrder="stroke fill"
        fillRule="evenodd"
        d={EXTERNAL_LINK_ICON_PATH}
      />
    </LibraryIcon>
  );
}
