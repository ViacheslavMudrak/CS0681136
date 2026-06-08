import { cn } from "@/lib/utils";
import React from "react";
import ChevronLeftIcon from "../icons/ChevronLeftIcon";

interface SuccessMessageProps {
  title?: string;
  message: string;
  actionButton?: React.ReactNode;
  secondaryLink?: React.ReactNode;
  onSecondaryLinkClick?: () => void;
}

export default function SuccessMessage({
  title,
  message,
  actionButton,
  secondaryLink,
  onSecondaryLinkClick,
}: SuccessMessageProps) {
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  const handleSecondaryLinkClick = () => {
    if (onSecondaryLinkClick) {
      onSecondaryLinkClick();
    } else if (secondaryLink && typeof secondaryLink === "object" && "props" in secondaryLink) {
      const element = secondaryLink as React.ReactElement<{
        onClick?: () => void;
      }>;
      if (element.props?.onClick) {
        element.props.onClick();
      }
    }
  };

  return (
    <div
      className={cn("bg-white w-full px-[30px] py-[10px]", "flex flex-col gap-3")}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {title && (
        <p
          className={cn(
            "text-[28px] leading-[35px] text-[#222] text-center",
            "font-['Helvetica_Neue_LT_Pro',sans-serif] font-normal",
            "tracking-[-0.5px] m-0"
          )}
        >
          {title}
        </p>
      )}
      <p
        className={cn(
          "leading-[24px] text-[#4d4d4f] text-center",
          "font-normal tracking-[-0.16px] m-0 mb-5",
          "whitespace-pre-wrap"
        )}
      >
        {message}
      </p>

      {actionButton && <div className="w-full mt-0">{actionButton}</div>}

      {(secondaryLink || onSecondaryLinkClick) && (
        <div className="w-full mt-0 pt-[21px]">
          <div className="bg-[rgba(0,0,0,0.08)] h-px w-full mb-[21px]" />
          <button
            type="button"
            onClick={handleSecondaryLinkClick}
            className="text-[#0377ba] text-[13px] cursor-pointer bg-transparent border-none p-0 font-['Helvetica_Neue_LT_Pro',sans-serif] font-bold leading-normal flex items-center gap-[5px] transition-colors duration-200 hover:text-[#025a94] hover:no-underline"
            aria-label="Back to Login"
          >
            <ChevronLeftIcon decorative={true} className={isRtl ? "rotate-180" : ""} />
            <span>Back to Login</span>
          </button>
        </div>
      )}
    </div>
  );
}
