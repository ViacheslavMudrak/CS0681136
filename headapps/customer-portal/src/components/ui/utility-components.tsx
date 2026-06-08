"use client";

import { cn } from "@/lib/utils";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

import Button from "@/components/ui/Button";

interface IModalCloseIconProps {
  handleCloseBtn: () => void;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const ModalCloseIcon = (props: IModalCloseIconProps) => {
  const { handleCloseBtn, width = "32px", height = "32px", className } = props;
  const is36 = width === "36px" || height === "36px" || width === 36 || height === 36;

  return (
    <Button
      type="button"
      btnVariant="iconBtn"
      variant="transparent"
      onPress={handleCloseBtn}
      aria-label="Close panel"
      className={cn(
        "rounded-full z-10 bg-bg-light-gray hover:bg-bg-light-gray-active",
        "text-text-basic",
        is36 ? "!h-9 !w-9 !min-h-9 !min-w-9" : "!h-8 !w-8 !min-h-8 !min-w-8",
        className
      )}
    >
      <Icon icon={faClose} aria-hidden className="text-xl leading-none" />
    </Button>
  );
};
