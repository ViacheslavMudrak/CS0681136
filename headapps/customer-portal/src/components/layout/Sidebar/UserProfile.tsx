"use client";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface UserProfileProps {
  name: string;
  company: string;
  initials: string;
  avatarUrl?: string;
}

export default function UserProfile({ name, company, initials, avatarUrl }: UserProfileProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Button
      type="button"
      variant="transparent"
      className={cn(
        "flex items-center gap-[10.5px] h-[52.5px] px-[14px] rounded-[7px]",
        "bg-[rgba(51,65,85,0.5)] w-full",
        "transition-colors duration-150",
        "hover:bg-[rgba(51,65,85,0.7)]"
      )}
      onPress={() => setIsExpanded(!isExpanded)}
      aria-expanded={isExpanded}
    >
      <div className="w-[60px] h-[36px] rounded-[10px] flex-none order-0 self-stretch grow-0 bg-white flex items-center justify-center shrink-0 overflow-hidden">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover rounded-[10px]"
            width={60}
            height={36}
            sizes="60px"
          />
        ) : (
          <span className="text-[#1d293d] text-[12.25px] font-normal leading-[17.5px]">
            {initials}
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col items-start gap-0">
        <div className="text-white text-[12.25px] font-normal leading-[17.5px]">{name}</div>
        <div className="text-[#99a1af] text-[10.5px] font-normal leading-[14px]">{company}</div>
      </div>
      <div
        className={cn(
          "w-[14px] h-[14px] shrink-0 transition-transform duration-150 text-white",
          isExpanded && "rotate-180"
        )}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.5 5.25L7 8.75L10.5 5.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Button>
  );
}
