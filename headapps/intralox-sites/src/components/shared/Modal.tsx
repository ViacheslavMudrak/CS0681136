"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import {
  ModalOverlay,
  Modal as IModal,
} from "@laitram-l-l-c/intralox-ui-components";
import {
  DialogProps,
  Button as ReactAriaButton,
  Dialog as ReactAriaDialog,
} from "react-aria-components";
import { CHROME_ICON_BASE, CHROME_ICON_SIZE_SM } from 'lib/chrome-icons';
import { X } from '@laitram-l-l-c/intralox-icon-library';
import { cn } from "lib/utils";
import { Container } from "./BaseContainer";
/* Relies on ./src/css/transitions.css for transition styles */

/**
 * React Aria modal scroll prevention sets overflow:hidden on documentElement,
 * which breaks position:sticky (e.g. layout header). Use a body fixed-position
 * lock instead and clear the html inline lock so the root scrollport stays consistent.
 */
function useBodyFixedScrollLock(isActive: boolean) {
  const scrollYRef = useRef(0);

  useLayoutEffect(() => {
    if (!isActive) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    scrollYRef.current = window.scrollY;

    const applyLock = () => {
      html.style.overflow = "";
      html.style.paddingRight = "";
      html.style.removeProperty("scrollbar-gutter");
      body.style.position = "fixed";
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      body.style.paddingRight = "15px";
    };

    applyLock();
    const t = window.setTimeout(applyLock, 0);

    return () => {
      window.clearTimeout(t);
      html.style.overflow = "";
      html.style.paddingRight = "";
      html.style.removeProperty("scrollbar-gutter");
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      body.style.paddingRight = "";
      window.scrollTo(0, scrollYRef.current);
    };
  }, [isActive]);
}

export interface ModalProps {
  children: React.ReactNode;
  isOpen?: boolean;
  modalSize?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "media";
  autoFocusCloseButton?: boolean;
  onClose?: () => void;
  onChange?: (isOpen: boolean) => void;
  ariaLabel?: DialogProps["aria-label"];
  /** When true, skips default Container width caps; use with `containerClassName`. */
  containerBare?: boolean;
  containerClassName?: string;
  /** Optional classes on the visible modal panel (`IModal`), e.g. banded `max-w` on the white dialog surface. */
  panelClassName?: string;
}

const Modal = ({
  children,
  isOpen,
  modalSize = `sm`,
  variant = `default`,
  autoFocusCloseButton = true,
  onClose,
  ariaLabel,
  onChange,
  containerBare = false,
  containerClassName,
  panelClassName,
}: ModalProps) => {
  useBodyFixedScrollLock(isOpen === true);
  const isMediaVariant = variant === `media`;

  const handleClose = () => {
    if (onClose !== undefined) {
      onClose();
    } else {
      onChange?.(false);
    }
    // Works around issue where headlessui doesn’t remove overflow:hidden from
    // from the document element when a modal is open on initial page (e.g. when
    // a page includes the slug for the modal in the URL) and then closed
    document.documentElement.style.overflow = ``;
    document.documentElement.style.paddingRight = ``;
    document.documentElement.style.removeProperty(`scrollbar-gutter`);
  };

  return (
    <ModalOverlay
      isDismissable
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
      className={"block overflow-y-auto m-0 p-0 bg-surface/90 z-[9999]"}
    >
      <div
        className={cn(
          'flex grow min-h-full items-center justify-center',
          isMediaVariant && 'max-md:px-4 max-md:py-4 md:px-6 md:py-6 lg:px-10 lg:py-10',
        )}
      >
        <Container
          width={containerBare ? undefined : modalSize === "xl" ? "default" : modalSize}
          bare={isMediaVariant || containerBare}
          className={cn(
            isMediaVariant &&
              'mx-auto box-border w-full min-w-0 shrink-0 max-md:max-w-[min(calc(100vw-2rem),36rem)] md:w-full md:max-w-[752px] lg:max-w-[750px]',
            containerClassName,
          )}
          paddingX={isMediaVariant || containerBare ? false : true}
        >
          <IModal
            className={cn(
              'relative box-border min-w-0 bg-surface max-h-none',
              panelClassName ? '!w-full' : 'w-full',
              // Default modals: clear design-system Modal width caps; Container owns layout.
              // Custom `panelClassName` (e.g. product popup bands) supplies banded max-w with `!`.
              !panelClassName && 'md:max-w-none xl:max-w-none',
              panelClassName,
              isMediaVariant &&
                'z-50 box-border block max-w-none overflow-x-visible overflow-y-visible rounded-2xl border-0 border-solid border-stroke-default p-2 font-media-tile leading-6 [unicode-bidi:isolate] [box-shadow:0_0_22.496px_rgba(0,0,0,0.23)] [-webkit-tap-highlight-color:transparent] md:p-4 lg:p-4 lg:text-base lg:leading-6 lg:text-ink-secondary lg:antialiased',
              !isMediaVariant && 'mt-10 mb-10 overflow-visible',
              !isMediaVariant && modalSize === 'sm' && 'p-4',
              !isMediaVariant && modalSize !== 'sm' && 'p-8',
              !isMediaVariant && modalSize === 'lg' && 'lg:p-12',
              !isMediaVariant && modalSize === 'md' && 'lg:p-8',
              !isMediaVariant && modalSize === 'sm' && 'lg:p-4',
            )}
          >
            <ReactAriaDialog
              className="box-border block w-full min-w-0 focus:outline-none focus-visible:outline-none"
              aria-label={ariaLabel}
            >
              <ReactAriaButton
                autoFocus={autoFocusCloseButton}
                aria-label="Close"
                className={cn(
                  'absolute -mt-1 top-0 -translate-y-full right-0 rounded-full border bg-surface transition-colors duration-150 focus:outline-none',
                  isMediaVariant &&
                    'flex size-7 items-center justify-center border-link-strong text-link-strong shadow-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-link-strong focus-visible:ring-offset-2 focus-visible:ring-offset-surface hover:bg-surface-muted',
                  !isMediaVariant &&
                    'shadow-lg w-6 h-6 border-stroke-default focus:ring hover:bg-surface-selected text-ink-subtle',
                  !isMediaVariant &&
                    modalSize !== 'sm' &&
                    'md:bottom-auto md:mt-8 md:mr-2 md:bg-surface-selected md:hover:bg-surface-muted md:shadow-none',
                )}
                onPress={(event) => {
                  handleClose();
                }}
              >
                <X
                  className={cn(
                    CHROME_ICON_BASE,
                    isMediaVariant
                      ? 'text-sm leading-none'
                      : cn(
                          CHROME_ICON_SIZE_SM,
                          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                        ),
                  )}
                  aria-hidden="true"
                />
              </ReactAriaButton>
              {children}
            </ReactAriaDialog>
          </IModal>
        </Container>
      </div>
    </ModalOverlay>
  );
};

export default Modal;
