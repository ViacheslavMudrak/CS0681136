"use client";

import Button from "@/components/ui/Button";
import { ReactNode } from "react";

interface IBackToLoginProps {
  className?: string;
  children: ReactNode;
  handleClick: () => void;
}

export const WidgetBackButton = (props: IBackToLoginProps) => {
  const { children, handleClick } = props;

  return (
    <div className="[&_button]:mt-0 [&_button]:cursor-pointer [&_button]:border-none [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-[13px] [&_button]:font-[700] [&_button]:leading-[1.25] [&_button]:text-[#0377ba]">
      <Button type="button" variant="transparent" onPress={handleClick} className="link-btn">
        {children}
      </Button>
    </div>
  );
};
