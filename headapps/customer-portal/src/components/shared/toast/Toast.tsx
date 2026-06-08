"use client";

import {
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";
import { RichText } from "@sitecore-content-sdk/nextjs";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import React from "react";
import { ToastType } from "./ToastProvider";

const TYPE_ICONS: Record<ToastType, IconDefinition> = {
  success: faCircleCheck,
  error: faCircleXmark,
  warning: faTriangleExclamation,
  info: faCircleInfo,
};

const TOAST_SURFACE_CLASS =
  "flex items-start justify-between gap-3 pointer-events-auto animate-[slideIn_0.3s_ease-out] min-w-[min(100%,20rem)] max-w-[28rem] rounded-lg border-2 border-solid py-5 px-6 pe-6 rtl:[--toast-slide-start:-100%]";

const TOAST_TYPE_CLASS: Record<ToastType, string> = {
  success: "bg-[var(--color-gray-100)] border-[var(--color-text-verified)]",
  error: "bg-[var(--color-red-light)] border-[var(--color-text-red)]",
  warning: "bg-[#fffbeb] border-[#d97706]",
  info: "bg-[var(--color-cyan-light)] border-[var(--color-cyan-default)]",
};

const TOAST_ICON_WRAP_CLASS: Record<ToastType, string> = {
  success: "text-[var(--color-text-verified)]",
  error: "text-[var(--color-red-dark)]",
  warning: "text-[#b45309]",
  info: "text-[var(--color-cyan-dark)]",
};

export interface ToastProps {
  title?: string;
  message?: string;
  messageField?: {
    value?: string | number;
    editable?: string;
  };
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ title, message, messageField, type, onClose }: ToastProps) {
  const hasTitle = Boolean(title?.trim());
  const body = (message ?? "").trim();
  const hasBody = Boolean(body);
  const richTextBody = String(messageField?.value ?? "").trim();
  const hasBodyField = Boolean(richTextBody);
  const richTextField = hasBodyField
    ? {
        value: richTextBody,
        editable: messageField?.editable,
      }
    : undefined;

  if (!hasTitle && !hasBody && !hasBodyField) {
    return null;
  }

  const messageClass = hasTitle
    ? "m-0 text-[16px] font-[400] leading-[1.5] text-[var(--color-text-heading-color)]"
    : "m-0 leading-6 text-[var(--color-text-heading-color)]";

  return (
    <div
      className={cn(TOAST_SURFACE_CLASS, TOAST_TYPE_CLASS[type])}
      role="alert"
      data-toast-type={type}
    >
      <div className="flex flex-1 items-start gap-5 min-w-0">
        <div
          className={cn("flex flex-shrink-0 pt-[0.25rem]", TOAST_ICON_WRAP_CLASS[type])}
          aria-hidden
        >
          <Icon icon={TYPE_ICONS[type]} width={20} height={20} />
        </div>
        <div className="flex min-w-0 flex-col items-start gap-[0.5rem]">
          {hasTitle ? (
            <p className="m-0 text-[18px] font-[700] leading-[1.5] text-[var(--color-text-heading-color)]">
              {title}
            </p>
          ) : null}
          {hasBodyField ? (
            <RichText field={richTextField} className={messageClass} />
          ) : hasBody ? (
            <p className={messageClass}>{body}</p>
          ) : null}
        </div>
      </div>
      <Button
        type="button"
        btnVariant="iconBtn"
        variant="ghost"
        onPress={onClose}
        aria-label="Close toast"
        className="shrink-0 text-[var(--color-text-heading-color)] transition-opacity duration-150 ease-in-out hover:opacity-[0.7]"
      >
        <span className="text-xl font-bold leading-none" aria-hidden>
          ×
        </span>
      </Button>
    </div>
  );
}
