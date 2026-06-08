import { ReactNode } from "react";

import { cn } from "lib/utils";

interface CaptionProps {
  className?: string;
  border?: "left" | "right" | "top" | "bottom";
  children: ReactNode;
}

const Caption = ({ className = "", border, children }: CaptionProps) => {
  return (
    <div
      className={cn(
        "text-left",
        border === "left" && "border-l",
        border === "right" && "border-r",
        border === "top" && "border-t",
        border === "bottom" && "border-b",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Caption;
