"use client";

import { OrderDetailHeaderStatusVariant } from "@/lib/orderDetailUtils";
import { faCircleXmark, faClock, faTruck } from "@fortawesome/free-solid-svg-icons";
import { NextImage, Text, type ImageField } from "@sitecore-content-sdk/nextjs";

import { Icon } from "@laitram-l-l-c/intralox-ui-components";

export const RenderStatusIcon = ({
  variant,
  cmsField,
}: {
  variant: OrderDetailHeaderStatusVariant;
  cmsField: ImageField | undefined;
}) => {
  if (cmsField?.value?.src) {
    return (
      <NextImage
        field={cmsField}
        width={10}
        height={10}
        className="size-[10px] shrink-0 object-contain"
        sizes="12px"
        aria-hidden
      />
    );
  }
  if (variant === "shipped") {
    return (
      <Icon
        icon={faTruck}
        className="size-[10px] shrink-0 text-[10px] text-current"
        width={10}
        height={10}
        aria-hidden
      />
    );
  }
  if (variant === "cancelled") {
    return (
      <Icon
        icon={faCircleXmark}
        className="size-[10px] shrink-0 text-[10px] text-current"
        width={10}
        height={10}
        aria-hidden
      />
    );
  }
  return (
    <Icon
      icon={faClock}
      className="size-[10px] shrink-0 text-[10px] text-current"
      width={10}
      height={10}
      aria-hidden
    />
  );
};
