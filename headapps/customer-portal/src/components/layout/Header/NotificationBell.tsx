"use client";

import Button from "@/components/ui/Button";
import React from "react";

interface NotificationBellProps {
  hasNotifications?: boolean;
  onClick?: () => void;
}

export default function NotificationBell({
  hasNotifications = true,
  onClick,
}: NotificationBellProps) {
  return (
    <Button
      type="button"
      btnVariant="iconBtn"
      variant="transparent"
      className="relative w-[36px] h-[36px] rounded-full flex items-center justify-center transition-colors duration-150 hover:bg-gray-100"
      onPress={() => onClick?.()}
      aria-label="Notifications"
    >
      <div className="w-[16px] h-[16px]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 2.66667C6.52724 2.66667 5.33333 3.86057 5.33333 5.33333V8L4 9.33333V10.6667H12V9.33333L10.6667 8V5.33333C10.6667 3.86057 9.47276 2.66667 8 2.66667Z"
            stroke="#45556c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 10.6667V11.3333C6 12.4379 6.89543 13.3333 8 13.3333C9.10457 13.3333 10 12.4379 10 11.3333V10.6667"
            stroke="#45556c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {hasNotifications && (
        <div
          className="absolute top-[6px] end-[18px] w-[12px] h-[12px] rounded-full bg-[#fb2c36] border-2 border-white border-solid shadow-[0px_0px_0px_1px_white]"
          aria-hidden="true"
        />
      )}
    </Button>
  );
}
