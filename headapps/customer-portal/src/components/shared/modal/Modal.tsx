"use client";

import { ModalCloseIcon } from "@/components/ui/utility-components";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";
import { Modal, ModalOverlay } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";
import type { ReactNode } from "react";
import { Heading as AriaHeading, Dialog } from "react-aria-components";

import Button from "@/components/ui/Button";
import CloseIcon from "../icons/CloseIcon";

interface DXModalProps {
  isOpen: boolean;
  title?: ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  closeButtonClassName?: string;
  size?: "sm" | "md" | "lg";
  onClose: () => void;
}

export default function DXPModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  closeButtonClassName,
}: DXModalProps) {
  useBodyScrollLock(isOpen);

  const sizeClasses = {
    sm: "max-w-md max-h-[90vh] sm:max-h-[85vh]",
    md: "w-full sm:w-[480px] h-[226px]",
    lg: "max-w-2xl md:max-w-2xl max-h-[90vh] sm:max-h-[85vh]",
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      className={cn("fixed inset-0 z-[1040] overscroll-y-contain")}
    >
      <Modal
        className={cn(
          "z-[2050] box-border",
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          className
        )}
      >
        <Dialog className="outline-none w-full flex flex-col flex-1 min-w-0 z-[99999]">
          {({ close }) => {
            const handleClose = () => {
              close();
              onClose();
            };
            return (
              <>
                {title != null && title !== "" && (
                  <div className="w-full px-8 pt-6 pb-4 flex items-start justify-between gap-4">
                    <AriaHeading
                      className="text-lg font-semibold text-text-heading-color flex-1 min-w-0"
                      slot="title"
                    >
                      {title}
                    </AriaHeading>
                    <ModalCloseIcon handleCloseBtn={handleClose} />
                  </div>
                )}
                {(title == null || title === "") && (
                  <div className="absolute top-6" style={{ insetInlineEnd: "1.5rem" }}>
                    <Button
                      type="button"
                      btnVariant="iconBtn"
                      variant="transparent"
                      onPress={handleClose}
                      className={cn(
                        "text-text-basic transition-colors",
                        "rounded-full",
                        "bg-bg-light-gray hover:bg-bg-light-gray-active",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-border-basic-color focus-visible:ring-offset-2",
                        closeButtonClassName
                      )}
                      aria-label="Close modal"
                    >
                      <span className="text-lg leading-none text-text-heading-color" aria-hidden>
                        <CloseIcon />
                      </span>
                    </Button>
                  </div>
                )}
                <div>{children}</div>
              </>
            );
          }}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
