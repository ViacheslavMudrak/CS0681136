import Heading from "@/components/ui/Heading";
import { cn } from "@/lib/utils";
import React from "react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:gap-2.5 md:gap-3 lg:gap-3",
        "items-center text-center w-full whitespace-pre-wrap"
      )}
    >
      <Heading
        level={1}
        className={cn(
          "h-auto sm:h-[30px] md:h-[32px] lg:h-[34px]",
          "leading-[1.2] sm:leading-[1.25] md:leading-[1.3] lg:leading-normal",
          "text-[24px] sm:text-[26px] md:text-[27px] lg:text-[28px]",
          "text-[#222222]",
          "tracking-[-0.4px] sm:tracking-[-0.45px] md:tracking-[-0.48px] lg:tracking-[-0.5px]",
          "w-full"
        )}
      >
        {title}
      </Heading>
      <p
        className={cn(
          "leading-[1.2] text-sm text-[#4d4d4f] tracking-[-0.14px] w-full",
          "sm:leading-[1.22] sm:text-[15px] sm:tracking-[-0.15px]",
          "md:leading-[1.24] md:text-[15.5px] md:tracking-[-0.155px]",
          "lg:leading-[1.25]   lg:tracking-[-0.16px]"
        )}
      >
        {subtitle}
      </p>
    </div>
  );
}
