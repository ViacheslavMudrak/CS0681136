
import { cn } from "@/lib/utils";
import React from "react";

export interface InfoBannerProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description: React.ReactNode;
  className?: string;
}

export default function InfoBanner({
  icon,
  title,
  description,
  className,
}: InfoBannerProps): React.ReactElement {
  return (
    <section
      className={cn(
        "flex min-w-0 items-center gap-[16px] rounded-[6px] border border-[var(--color-border-default)] px-[20px] py-[24px] bg-[#f0f4f9]",
        className
      )}
      role="status"
    >
      <div
        className="flex shrink-0 items-center justify-center rounded-full w-[54px] h-[54px] bg-[#e9edf5]"
        aria-hidden
      >
        <div className="[&_img]:max-h-[28px] [&_img]:max-w-[28px] [&_img]:object-contain">{icon}</div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        {title ? (
          <div className="w-full text-[12px] font-bold uppercase leading-[15px] tracking-[0.5px] text-[var(--color-text-placeholder)]">
            {title}
          </div>
        ) : null}
        <div className="text-[14px] leading-[1.25] text-[var(--color-text-black)] [&_a]:text-[var(--color-link-text)] [&_p]:m-0 [&_p+p]:mt-0">
          {description}
        </div>
      </div>
    </section>
  );
}
