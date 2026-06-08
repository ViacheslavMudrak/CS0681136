"use client";

import { NextImage as ContentSdkImage } from "@sitecore-content-sdk/nextjs";
import type { ImageField } from "@sitecore-content-sdk/nextjs";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import { I18N } from "@/lib/dictionary-keys";
import type { PortalShellAccount } from "../PortalShellSideNav.type";


interface SwitchCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: PortalShellAccount[];
  currentAccountId: string;
  companyIcon?: ImageField;
  anchorRef: React.RefObject<HTMLElement | null>;
  onSelectAccount: (accountId: string) => void;
}

export function SwitchCompanyModal({
  isOpen,
  onClose,
  accounts,
  currentAccountId,
  companyIcon,
  anchorRef,
  onSelectAccount,
}: SwitchCompanyModalProps): React.ReactElement | null {
  const DEFAULT_MODAL_WIDTH = 360;
  const VIEWPORT_PADDING = 8;
  const MODAL_OFFSET = 8;
  const t = useTranslations();
  useBodyScrollLock(isOpen);
  const isRtl = typeof document !== "undefined" && document.querySelector('[dir="rtl"]') !== null;
  const [position, setPosition] = useState<{ top: number; left: number; width: number }>({
    top: VIEWPORT_PADDING,
    left: VIEWPORT_PADDING,
    width: DEFAULT_MODAL_WIDTH,
  });

  const updatePosition = useMemo(
    () => () => {
      if (typeof window === "undefined") {
        return;
      }

      const modalWidth = Math.min(
        DEFAULT_MODAL_WIDTH,
        Math.max(0, window.innerWidth - VIEWPORT_PADDING * 2)
      );
      const anchorElement = anchorRef.current;
      if (!anchorElement) {
        setPosition({ top: VIEWPORT_PADDING, left: VIEWPORT_PADDING, width: modalWidth });
        return;
      }

      const rect = anchorElement.getBoundingClientRect();
      const maxLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - modalWidth - VIEWPORT_PADDING);
      const desiredLeft = isRtl ? rect.right - modalWidth : rect.left;
      const nextLeft = Math.min(Math.max(desiredLeft, VIEWPORT_PADDING), maxLeft);
      const nextTop = Math.max(rect.bottom + MODAL_OFFSET, VIEWPORT_PADDING);

      setPosition({ top: nextTop, left: nextLeft, width: modalWidth });
    },
    [anchorRef, isRtl]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    if (id !== currentAccountId) {
      onSelectAccount(id);
      onClose();
    }
  };

  const modalContent = (
    <div
      className={"fixed inset-0 z-[var(--z-modal-backdrop)] overscroll-y-contain"}
      role="dialog"
      aria-modal="true"
      aria-labelledby="switch-company-title"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Button
        type="button"
        variant="transparent"
        className={"fixed inset-0 w-full h-full border-0 p-0 cursor-default rounded-none bg-[transparent]"}
        onPress={onClose}
        aria-label="Close modal"
      >
        <span className="sr-only">Close</span>
      </Button>
      <div
        className={"absolute flex flex-col w-[360px] max-h-[75vh] overflow-visible border rounded-[var(--Border-Radius-md)] border-[var(--color-portal-switch-modal-border)] bg-[var(--color-portal-switch-modal-dialog-bg)] shadow-[var(--color-portal-switch-modal-shadow)]"}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${position.width}px`,
        }}
      >
        <div className={"flex items-center justify-between shrink-0 h-[43px] pt-3 px-4 pb-px border-b"}>
          <span id="switch-company-title">
            <Heading level={2} className={"text-[12px] leading-none font-bold m-0 uppercase tracking-[0.5px] whitespace-nowrap text-[var(--color-portal-switch-modal-title)]"}>
              {t(I18N.PortalShellSwitch)}
            </Heading>
          </span>
        </div>
        <div className={"flex-1 min-h-0 overflow-y-auto overscroll-y-contain flex flex-col max-h-[60dvh]"}>
          {accounts.map((account) => {
            const isCurrent = account.id === currentAccountId;
            return (
              <Button
                key={account.id}
                type="button"
                variant="transparent"
                className={`${"flex gap-[10px] items-start shrink-0 px-[16px] py-[12px] border-b cursor-pointer transition-colors duration-150 w-full rounded-none bg-[transparent]"} ${isCurrent ? "bg-[var(--color-portal-switch-modal-row-active-bg)]" : ""}`}
                onPress={() => handleSelect(account.id)}
              >
                <div className={"shrink-0 w-[38px] h-[38px] flex items-center justify-center rounded-full border pt-1 bg-[var(--color-portal-switch-modal-icon-bg)]"}>
                  {companyIcon?.value?.src ? (
                    <ContentSdkImage
                      field={companyIcon}
                      width={12}
                      height={16}
                      alt={(companyIcon.value.alt ?? "Company") as string}
                      loading="lazy"
                      className={"w-[12px] h-[16px] object-contain"}
                    />
                  ) : (
                    <span className={"w-[12px] h-[16px] object-contain"} aria-hidden />
                  )}
                </div>
                <div className={"flex-1 min-w-0 flex flex-col gap-0.5 text-left"}>
                  <div className={"flex items-start gap-2 w-full"}>
                    <span className={"text-[12px] leading-[1.25] font-medium flex-1 min-w-0 line-clamp-2 text-[var(--color-portal-switch-modal-text)]"}>{account.companyName}</span>
                    {isCurrent && <span className={"shrink-0 rounded-full w-2 h-2 mt-1.5 bg-[var(--color-portal-switch-modal-dot)]"} aria-hidden />}
                  </div>
                  <span className={"text-[12px] leading-[1.25] line-clamp-2 text-[var(--color-portal-switch-modal-text-muted)]"}>{account.address}</span>
                  <span className={"text-[12px] leading-[1.375] text-[var(--color-portal-switch-modal-text-muted)]"}>
                    {t(I18N.PortalShellAccount)} #{account.accountNumber}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
