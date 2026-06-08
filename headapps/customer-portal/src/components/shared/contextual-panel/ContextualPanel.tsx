"use client";

import Button from "@/components/ui/Button";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";
import {
  Heading as AriaHeading,
  Dialog,
  ModalOverlay as DialogOverlay,
} from "react-aria-components";

interface ContextualPanelProps {
  isOpen: boolean;
  title?: string;
  titleContent?: React.ReactNode;
  descriptionContent?: React.ReactNode;
  headerFooterContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerShellClassName?: string;
  headerClassName?: string;
  headerTopClassName?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
  contentClassName?: string;
  width?: string;
  position?: "left" | "right";
  onClose: () => void;
}

export default function ContextualPanel({
  isOpen,
  onClose,
  title,
  titleContent,
  descriptionContent,
  headerFooterContent,
  children,
  className,
  headerShellClassName,
  headerClassName,
  headerTopClassName,
  titleClassName,
  closeButtonClassName,
  contentClassName,
  width = "w-96",
  position = "right",
}: ContextualPanelProps) {
  const isRtl = useMemo(
    () => typeof document !== "undefined" && document.documentElement.dir === "rtl",
    []
  );

  const resolvedPosition = useMemo<"left" | "right">(() => {
    if (position === "right") return isRtl ? "left" : "right";
    return isRtl ? "right" : "left";
  }, [isRtl, position]);

  useBodyScrollLock(isOpen);

  if (!isOpen) {
    return <></>;
  }

  const hasHeader = titleContent != null || (title != null && String(title).trim().length > 0);

  const hasDescriptionOrFooter = descriptionContent != null || headerFooterContent != null;

  const positionClasses = {
    left: "left-0",
    right: "right-0",
  };

  return (
    <DialogOverlay
      isOpen={isOpen}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      className={cn(
        "fixed inset-0 z-[1040] overscroll-y-contain",
        "bg-black/50 backdrop-blur-sm",
        "data-[entering]:animate-in data-[entering]:fade-in-0",
        "data-[exiting]:animate-out data-[exiting]:fade-out-0"
      )}
    >
      <Dialog
        className={cn(
          "fixed top-0 z-[1050] h-[100dvh] max-h-[100dvh]",
          positionClasses[resolvedPosition],
          width,
          "bg-white shadow-xl",
          "flex flex-col",
          "outline-none",
          "data-[entering]:animate-in",
          resolvedPosition === "right"
            ? "data-[entering]:slide-in-from-right"
            : "data-[entering]:slide-in-from-left",
          "data-[exiting]:animate-out",
          resolvedPosition === "right"
            ? "data-[exiting]:slide-out-to-right"
            : "data-[exiting]:slide-out-to-left",
          className
        )}
      >
        {({ close }) => {
          const handleClose = () => {
            close();
            onClose();
          };
          return (
            <>
              {hasHeader && (
                <div
                  className={cn(
                    "flex min-h-0 flex-shrink-0 flex-col",
                    headerShellClassName != null && String(headerShellClassName).length > 0
                      ? headerShellClassName
                      : "bg-white"
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col",
                      headerTopClassName?.trim()
                        ? headerTopClassName
                        : headerClassName?.trim()
                          ? headerClassName
                          : hasDescriptionOrFooter
                            ? "border-b border-border-gray bg-white px-6 pb-5 pt-5"
                            : "border-b border-border-gray px-6 pb-4 pt-6"
                    )}
                  >
                    <div
                      className={cn(
                        "flex w-full min-w-0 justify-between gap-3",
                        hasDescriptionOrFooter || Boolean(headerTopClassName?.trim())
                          ? "items-start"
                          : "items-center"
                      )}
                    >
                      <AriaHeading
                        className={cn(
                          "min-w-0 flex-1",
                          !headerTopClassName?.trim() &&
                            !headerClassName?.trim() &&
                            !titleClassName &&
                            "text-xl font-semibold text-text-heading-color",
                          titleClassName
                        )}
                        slot="title"
                      >
                        {titleContent ?? title}
                      </AriaHeading>
                      <Button
                        type="button"
                        btnVariant="iconBtn"
                        variant="transparent"
                        onPress={handleClose}
                        className={cn(
                          "text-text-basic hover:text-text-heading-color flex h-6 w-6 min-h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-full border-0 transition-colors",
                          "hover:bg-bg-lighter-gray focus:outline-none focus:ring-2 focus:ring-border-gray focus:ring-offset-2",
                          closeButtonClassName
                        )}
                        aria-label="Close panel"
                      >
                        <span className="text-[1.25rem] leading-none">×</span>
                      </Button>
                    </div>
                    {descriptionContent != null ? (
                      <div
                        className={cn(
                          "w-full min-w-0",
                          !headerTopClassName?.trim() &&
                            "mt-1 text-[0.875rem] leading-[1.375] text-text-heading-color"
                        )}
                      >
                        {descriptionContent}
                      </div>
                    ) : null}
                  </div>
                  {headerFooterContent != null ? (
                    <div className="w-full min-w-0 flex-shrink-0">{headerFooterContent}</div>
                  ) : null}
                </div>
              )}
              {!hasHeader && (
                <div className="absolute top-4 z-10" style={{ insetInlineEnd: "1rem" }}>
                  <Button
                    type="button"
                    btnVariant="iconBtn"
                    variant="transparent"
                    onPress={handleClose}
                    className={cn(
                      "text-text-basic hover:text-text-heading-color transition-colors",
                      "w-6 h-6 flex items-center justify-center",
                      "rounded-full hover:bg-bg-lighter-gray",
                      "focus:outline-none focus:ring-2 focus:ring-border-gray focus:ring-offset-2"
                    )}
                    aria-label="Close panel"
                  >
                    <span className="text-xl leading-none">×</span>
                  </Button>
                </div>
              )}
              <div
                className={cn(
                  "flex-1 overflow-y-auto",
                  "px-6 py-4",
                  hasHeader ? "" : "pt-6",
                  contentClassName
                )}
              >
                {children}
              </div>
            </>
          );
        }}
      </Dialog>
    </DialogOverlay>
  );
}
