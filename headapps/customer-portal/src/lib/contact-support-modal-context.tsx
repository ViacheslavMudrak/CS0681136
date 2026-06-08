"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import Button from "@/components/ui/Button";
import { ContactSupportPanelContent } from "@/components/core/ContactSupport/variants/ContactSupportPanelContent";
import type { IContactSupportFields } from "@/components/core/ContactSupport/ContactSupport.type";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useAccountContacts } from "@/hooks/use-account-contacts";
import { useDeviceType } from "@/hooks/use-device-type";
import { resolveContactSupportLinkText } from "@/lib/contact-support-utils";
import { useProfileContextOptional } from "@/lib/profile-context";

export interface ContactSupportModalContextValue {
  /** Registers CMS fields from ContactSupport when it mounts; clears on unmount. */
  registerContactSupportFields: (fields: IContactSupportFields | null) => void;
  openMobileContactDrawer: () => void;
  closeMobileContactDrawer: () => void;
  isMobileContactDrawerOpen: boolean;
  registeredFields: IContactSupportFields | null;
}

const ContactSupportModalContext = createContext<ContactSupportModalContextValue | undefined>(
  undefined
);

/** Stable fallback when context is missing (avoids new function refs each render). */
function noopClose(): void {}

function ContactSupportMobileDrawerRoot() {
  const context = useContext(ContactSupportModalContext);
  const [mounted, setMounted] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const { isMobile, isTablet } = useDeviceType();
  const registeredFields = context?.registeredFields ?? null;
  const accountContacts = useAccountContacts(registeredFields?.ServicesSelection);
  const selectedAccount = useProfileContextOptional()?.selectedAccount ?? null;
  const isOpen = context?.isMobileContactDrawerOpen ?? false;
  const closeMobileContactDrawer = context?.closeMobileContactDrawer ?? noopClose;

  useBodyScrollLock(isOpen && !!registeredFields);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileContactDrawer();
    };
    if (isOpen) document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isOpen, closeMobileContactDrawer]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  if (!isOpen || !registeredFields) {
    return null;
  }

  const supportLinkHref = String(
    registeredFields.SupportLink?.value?.href ?? registeredFields.SupportLink?.value?.url ?? "#"
  );
  const supportLinkText = resolveContactSupportLinkText(
    selectedAccount?.hotlineNumber,
    registeredFields.SupportLink?.value?.text
  );
  const popupTitle = registeredFields.PopupTitle?.value ?? "Your Account Contacts";
  const isRtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  return createPortal(
    <>
      <Button
        type="button"
        variant="transparent"
        onPress={closeMobileContactDrawer}
        className="fixed inset-0 z-50 bg-black/50 rounded-none overscroll-y-contain md:hidden"
        aria-label="Close contact panel"
      >
        <span aria-hidden="true" />
      </Button>
      <div
        className="fixed bottom-0 z-50 flex flex-col bg-white rounded-t-[12px] max-h-[85vh] overflow-hidden border border-b-0 w-full max-w-[343px] left-1/2 -translate-x-1/2 border-[var(--color-border-default)] shadow-[var(--color-shadow-dropdown)] md:hidden"
        role="dialog"
        aria-label={popupTitle}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex flex-col overflow-y-auto overscroll-y-contain flex-1">
          <ContactSupportPanelContent
            isMobile
            isTablet={isTablet}
            fields={registeredFields}
            accountContacts={accountContacts}
            supportLinkHref={supportLinkHref}
            supportLinkText={supportLinkText}
            copiedPhone={copiedPhone}
            onClose={closeMobileContactDrawer}
            onEmailClick={handleEmailClick}
            onPhoneClick={handlePhoneClick}
          />
        </div>
      </div>
    </>,
    document.body
  );
}

export function ContactSupportModalProvider({ children }: { children: ReactNode }) {
  const [registeredFields, setRegisteredFields] = useState<IContactSupportFields | null>(null);
  const [isMobileContactDrawerOpen, setMobileContactDrawerOpen] = useState(false);

  const registerContactSupportFields = useCallback((fields: IContactSupportFields | null) => {
    setRegisteredFields(fields);
  }, []);

  const openMobileContactDrawer = useCallback(() => {
    setMobileContactDrawerOpen(true);
  }, []);

  const closeMobileContactDrawer = useCallback(() => {
    setMobileContactDrawerOpen(false);
  }, []);

  const value = useMemo<ContactSupportModalContextValue>(
    () => ({
      registerContactSupportFields,
      openMobileContactDrawer,
      closeMobileContactDrawer,
      isMobileContactDrawerOpen,
      registeredFields,
    }),
    [
      registerContactSupportFields,
      openMobileContactDrawer,
      closeMobileContactDrawer,
      isMobileContactDrawerOpen,
      registeredFields,
    ]
  );

  return (
    <ContactSupportModalContext.Provider value={value}>
      {children}
      <ContactSupportMobileDrawerRoot />
    </ContactSupportModalContext.Provider>
  );
}

export function useContactSupportModal(): ContactSupportModalContextValue {
  const context = useContext(ContactSupportModalContext);
  if (context === undefined) {
    throw new Error("useContactSupportModal must be used within a ContactSupportModalProvider");
  }
  return context;
}
