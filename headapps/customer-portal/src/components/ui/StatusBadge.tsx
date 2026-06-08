"use client";

import {
  faCircleCheck,
  faCircleXmark,
  faStop,
  faCheckCircle,
  faClock,
  faTruckFast,
  faFileInvoiceDollar,
  faCircleExclamation,
  faCheck,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type StatusType =
  | "Delivered"
  | "Shipped"
  | "Placed"
  | "Cancelled"
  | "Paid"
  | "Invoiced"
  | "Expired"
  | "Ready";

interface IStatusBadge {
  type: StatusType | null;
  statusLabel?: Element | string;
  statusIcon?: Element | ReactNode;
}

const getIconAndLabel = (type: StatusType) => {
  let label: string = "";
  let icon: IconDefinition;

  switch (type) {
    case "Cancelled":
      label = "Cancelled";
      icon = faStop;
      break;

    case "Delivered":
      label = "Delivered";
      icon = faCheckCircle;
      break;

    case "Shipped":
      label = "Shipped";
      icon = faTruckFast;
      break;

    case "Placed":
      label = "Placed";
      icon = faClock;
      break;

    case "Paid":
      label = "Paid";
      icon = faCheckCircle;
      break;

    case "Invoiced":
      label = "Invoiced";
      icon = faFileInvoiceDollar;
      break;

    case "Expired":
      label = "Expired";
      icon = faCircleExclamation;
      break;

    case "Ready":
      label = "Ready";
      icon = faCheck;
      break;
  }

  return { label, icon };
};

export const StatusBadge = (props: IStatusBadge) => {
  const { type, statusLabel, statusIcon } = props;

  if (!type) {
    return null;
  }

  const { label, icon } = getIconAndLabel(type);

  const displayLabel = statusLabel || label;

  return (
    <span
      className={cn({
        "inline-flex items-center justify-self-end gap-[4px] py-[5px] px-[6px] rounded-[4px] border border-solid text-[12px] font-[500] leading-[100%] ": true,
        "border-[#25803F] bg-[#D1E9D6] text-[#1F7437]": ["Delivered", "Paid", "Ready"].includes(
          type
        ),
        "border-[#479EBC] bg-[#E3F0F5] text-[#00708D]": type === "Shipped",
        "border-[#A8AAAE] bg-[#F8F8F8] text-[#646467]": type === "Placed",
        "border-[#970000] bg-[#FBDADB] text-[#970000]": ["Cancelled", "Expired"].includes(type),
        "border-[#E36C00] bg-[#FFF1D9] text-[#E36C00]": type === "Invoiced",
      })}
      aria-label={label ?? displayLabel}
    >
      {statusIcon ? (
        <>{statusIcon}</>
      ) : (
        <Icon
          icon={icon}
          width={14}
          height={14}
          className="shrink-0 text-[currentColor]"
          aria-hidden
        />
      )}
      <>{displayLabel}</>
    </span>
  );
};
