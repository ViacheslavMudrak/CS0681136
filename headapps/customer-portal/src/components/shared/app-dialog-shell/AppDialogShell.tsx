"use client";

import { cn } from "@/lib/utils";
import { Modal, ModalOverlay } from "@laitram-l-l-c/intralox-ui-components";
import type { ReactNode } from "react";
import { Dialog, Heading } from "react-aria-components";

export interface AppDialogShellProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  children: ReactNode;
  overlayClassName?: string;
  modalClassName?: string;
  dialogClassName?: string;
  isDismissable?: boolean;
}

export function AppDialogShell({
  isOpen,
  onOpenChange,
  title,
  children,
  overlayClassName,
  modalClassName,
  dialogClassName,
  isDismissable = true,
}: AppDialogShellProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      className={cn("fixed inset-0 z-[1040] overscroll-y-contain", overlayClassName)}
    >
      <Modal className={cn("z-[2050] box-border outline-none", modalClassName)}>
        <Dialog className={cn("outline-none w-full flex flex-col flex-1 min-w-0", dialogClassName)}>
          {({ close }) => (
            <>
              {title != null && title !== "" && (
                <Heading slot="title" className="text-lg font-semibold text-text-heading-color">
                  {title}
                </Heading>
              )}
              {children}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
