"use client";

import Button from "@/components/ui/Button";
import { useAccountContacts } from "@/hooks/use-account-contacts";
import { useDeviceType } from "@/hooks/use-device-type";
import useClickOutside from "@/hooks/useClickOutside";
import { useContactSupportModal } from "@/lib/contact-support-modal-context";
import { resolveContactSupportLinkText } from "@/lib/contact-support-utils";
import { NextImage as ContentSdkImage, Text as ContentSdkText } from "@sitecore-content-sdk/nextjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { IParams } from "src/helpers/interface";
import type { IContactSupportFields } from "../ContactSupport.type";

import { ContactSupportPanelContent } from "./ContactSupportPanelContent";
import { useProfileContext } from "@/lib/profile-context";

interface IContactSupportVariantProps {
  testId: string;
  fields: IContactSupportFields | null;
  params: IParams;
}

const ContactSupportDefaultVariantBase = ({
  testId,
  fields,
}: IContactSupportVariantProps): React.ReactElement => {
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isMobileContactViewport, setIsMobileContactViewport] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const { isMobile, isTablet } = useDeviceType();
  const { selectedAccount } = useProfileContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountContacts = useAccountContacts(fields?.ServicesSelection);
  const {
    registerContactSupportFields,
    openMobileContactDrawer,
    closeMobileContactDrawer,
    isMobileContactDrawerOpen,
  } = useContactSupportModal();

  useEffect(() => {
    if (!fields) {
      registerContactSupportFields(null);
      return () => registerContactSupportFields(null);
    }
    registerContactSupportFields(fields);
    return () => registerContactSupportFields(null);
  }, [fields, registerContactSupportFields]);

  const isMenuOpen = isMobileContactViewport ? isMobileContactDrawerOpen : isDesktopOpen;

  useEffect(() => {
    const updateViewport = () => {
      setIsMobileContactViewport(window.innerWidth <= 767);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (isMobileContactViewport) setIsDesktopOpen(false);
  }, [isMobileContactViewport]);

  useClickOutside(
    containerRef,
    () => setIsDesktopOpen(false),
    isDesktopOpen && !isMobileContactViewport
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDesktopOpen(false);
    };
    if (isDesktopOpen && !isMobileContactViewport)
      document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isDesktopOpen, isMobileContactViewport]);

  const handleEmailClick = useCallback((email: string) => {
    window.location.href = `mailto:${email}`;
  }, []);

  const handlePhoneClick = useCallback(
    (phone: string) => {
      const normalized = phone.replace(/\s/g, "");
      if (isMobile || isTablet) {
        window.location.href = `tel:${normalized}`;
        return;
      }
      navigator.clipboard?.writeText(normalized).then(() => {
        setCopiedPhone(phone);
        setTimeout(() => setCopiedPhone(null), 2000);
      });
    },
    [isMobile, isTablet]
  );

  if (!fields) {
    return <div data-testid={testId} />;
  }

  const supportLinkHref = String(
    fields.SupportLink?.value?.href ?? fields.SupportLink?.value?.url ?? "#"
  );
  const supportLinkText = resolveContactSupportLinkText(
    selectedAccount?.hotlineNumber,
    fields.SupportLink?.value?.text
  );
  const popupTitle = fields.PopupTitle?.value ?? "Your Account Contacts";

  return (
    <div className={"relative me-[12px] max-md:me-0"} ref={containerRef} data-testid={testId}>
      <Button
        variant="transparent"
        onPress={() => {
          if (isMobileContactViewport) {
            if (isMobileContactDrawerOpen) {
              closeMobileContactDrawer();
            } else {
              openMobileContactDrawer();
            }
          } else {
            setIsDesktopOpen((prev) => !prev);
          }
        }}
        className={"group flex items-center gap-[6px] h-[35px] px-[10px] rounded-[4px] min-w-0 transition-colors duration-150 border-0 cursor-pointer bg-[transparent] hover:bg-[var(--color-contact-trigger-bg)]"}
        aria-expanded={isMenuOpen}
        aria-haspopup="dialog"
        aria-label={fields.Title?.value ?? "Contact"}
        type="button"
      >
        {fields.Icon?.value?.src && (
          <ContentSdkImage
            field={fields.Icon}
            className={"shrink-0 w-[20px] h-[20px] object-contain"}
            width={Number(fields.Icon?.value?.width) || 16}
            height={Number(fields.Icon?.value?.height) || 16}
            alt={(fields.Icon?.value?.alt as string) ?? "Contact"}
            aria-hidden
          />
        )}
        {fields.Title?.value && fields.Title && !isMobileContactViewport && (
          <ContentSdkText
            field={fields.Title}
            tag="span"
            className={"text-[14px] font-medium leading-[100%] tracking-[-0.0762px] text-[var(--color-black)] group-hover:text-[var(--color-text-active)]"}
          />
        )}
      </Button>

      {isDesktopOpen && !isMobileContactViewport && (
        <div
          ref={dropdownRef}
          className={`${"flex flex-col overflow-hidden absolute top-full mt-[8px] min-w-[280px] max-w-[280px] rounded-[8px] border border-solid z-[51] inset-e-0 bg-[var(--color-contact-panel-bg)] border-[var(--color-contact-panel-border)] max-h-[var(--contact-panel-max-height)] max-w-[calc(100vw_-_16px)] w-[min(338px,calc(100vw_-_16px))] min-w-[min(320px,calc(100vw_-_16px))] shadow-[var(--contact-panel-shadow)]"}`}
          role="dialog"
          aria-label={popupTitle}
        >
          <ContactSupportPanelContent
            isMobile={isMobile}
            isTablet={isTablet}
            fields={fields}
            accountContacts={accountContacts}
            supportLinkHref={supportLinkHref}
            supportLinkText={supportLinkText}
            copiedPhone={copiedPhone}
            onClose={() => setIsDesktopOpen(false)}
            onEmailClick={handleEmailClick}
            onPhoneClick={handlePhoneClick}
          />
        </div>
      )}
    </div>
  );
};

export const ContactSupportDefaultVariant = React.memo(ContactSupportDefaultVariantBase);
