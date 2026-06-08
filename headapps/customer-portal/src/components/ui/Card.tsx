import { cn } from "@/lib/utils";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white box-border flex flex-col",
        "gap-6 sm:gap-7 md:gap-8 lg:gap-[30px]",
        "items-start max-w-[450px] lg:w-full min-w-0 sm:min-w-[320px] md:min-w-[350px]",
        "relative rounded-[8px]",
        "shadow-[0px_10px_30px_0px_rgba(0,0,0,0.1)]",
        "shrink-0",
        className
      )}
    >
      {children}
    </div>
  );
}
