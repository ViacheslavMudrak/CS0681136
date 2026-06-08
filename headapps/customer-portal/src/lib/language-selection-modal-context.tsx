"use client";

import { Text as ContentSdkText } from "@sitecore-content-sdk/nextjs";
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
import { CloseIcon } from "@/components/shared/icons";
import Button from "@/components/ui/Button";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useLanguageSwitcherHandlers } from "@/hooks/use-language-switcher-handlers";
import type { ILanguageSwitcherFields } from "@/components/core/LanguageSwitcher/LanguageSwitcher.type";
import { cn } from "@/lib/utils";

export interface LanguageSelectionModalContextValue {
  /** Registers CMS fields from LanguageSwitcher when it mounts; clears on unmount. */
  registerLanguageSwitcherFields: (fields: ILanguageSwitcherFields | null) => void;
  setLanguageSwitcherDisabled: (disabled: boolean) => void;
  isLanguageSwitcherDisabled: boolean;
  openMobileLanguageDrawer: () => void;
  closeMobileLanguageDrawer: () => void;
  isMobileLanguageDrawerOpen: boolean;
  /** Last registered fields from LanguageSwitcher (for the global mobile drawer). */
  registeredFields: ILanguageSwitcherFields | null;
}

const LanguageSelectionModalContext = createContext<LanguageSelectionModalContextValue | undefined>(
  undefined
);

/** Stable fallback when context is missing (avoids new function refs each render). */
function noopClose(): void {}

function LanguageSelectionMobileModalRoot() {
  const context = useContext(LanguageSelectionModalContext);
  const [mounted, setMounted] = useState(false);

  const registeredFields = context?.registeredFields ?? null;
  const isOpen = context?.isMobileLanguageDrawerOpen ?? false;
  const closeMobileLanguageDrawer = context?.closeMobileLanguageDrawer ?? noopClose;

  const langCount = registeredFields?.LanguageSelection?.length ?? 0;
  const hasMultipleLanguages = langCount > 1;
  useBodyScrollLock(isOpen && !!registeredFields && hasMultipleLanguages);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { handleLanguageSelect, currentLanguage } = useLanguageSwitcherHandlers(registeredFields, {
    onAfterNavigate: closeMobileLanguageDrawer,
  });

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileLanguageDrawer();
    };
    if (isOpen) document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isOpen, closeMobileLanguageDrawer]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  if (!isOpen || !registeredFields || !hasMultipleLanguages) {
    return null;
  }

  return createPortal(
    <>
      <Button
        type="button"
        variant="transparent"
        onPress={closeMobileLanguageDrawer}
        className="fixed inset-0 z-50 bg-black/50 rounded-none overscroll-y-contain"
        aria-label="Close language selection"
      >
        <span aria-hidden="true" />
      </Button>
      <div
        className="fixed bottom-0 z-50 flex w-full max-w-[343px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[12px] border border-b-0 bg-white max-h-[85vh] left-1/2 border-[var(--color-border-default)] shadow-[var(--color-shadow-dropdown)]"
        role="listbox"
        aria-label="Language selection"
      >
        <div className="flex flex-row items-center justify-between gap-[16px] p-[16px] border-b border-b-[var(--color-border-default)]">
          <span className="flex-1 min-w-0 text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[var(--color-text-black)]">
            Select Language
          </span>
          <Button
            type="button"
            variant="transparent"
            onPress={closeMobileLanguageDrawer}
            className="flex w-[32px] h-[32px] shrink-0 items-center justify-end rounded-full border-0 px-0 py-0 transition-colors duration-150 cursor-pointer hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            aria-label="Close"
          >
            <CloseIcon width={20} height={20} decorative />
          </Button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto overscroll-y-contain p-[1px]">
          {registeredFields.LanguageSelection.map((language) => {
            const isSelected = currentLanguage?.id === language.id;

            return (
              <Button
                key={language.id}
                variant="transparent"
                onPress={() => handleLanguageSelect(language)}
                className={cn(
                  "flex w-full items-center justify-start border-0 border-b border-[#F1F5F9] px-[12px] py-[10px] text-start transition-colors duration-150 cursor-pointer rounded-none last:border-b-0 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset",
                  isSelected && "bg-[#0377BA0D]"
                )}
                role="option"
                aria-selected={isSelected}
                type="button"
              >
                <ContentSdkText
                  field={language.fields.LanguageTitle}
                  tag="span"
                  className={cn(
                    "text-[#222222] text-[12px] font-normal leading-[100%] tracking-[-0.0762px]",
                    isSelected && "text-[#19174F] font-medium text-[13px]"
                  )}
                />
              </Button>
            );
          })}
        </div>
      </div>
    </>,
    document.body
  );
}

export function LanguageSelectionModalProvider({ children }: { children: ReactNode }) {
  const [registeredFields, setRegisteredFields] = useState<ILanguageSwitcherFields | null>(null);
  const [isLanguageSwitcherDisabled, setIsLanguageSwitcherDisabled] = useState(false);
  const [isMobileLanguageDrawerOpen, setMobileLanguageDrawerOpen] = useState(false);

  const registerLanguageSwitcherFields = useCallback((fields: ILanguageSwitcherFields | null) => {
    setRegisteredFields(fields);
  }, []);

  const setLanguageSwitcherDisabled = useCallback((disabled: boolean) => {
    setIsLanguageSwitcherDisabled(disabled);
  }, []);

  const openMobileLanguageDrawer = useCallback(() => {
    setMobileLanguageDrawerOpen(true);
  }, []);

  const closeMobileLanguageDrawer = useCallback(() => {
    setMobileLanguageDrawerOpen(false);
  }, []);

  const value = useMemo<LanguageSelectionModalContextValue>(
    () => ({
      registerLanguageSwitcherFields,
      setLanguageSwitcherDisabled,
      isLanguageSwitcherDisabled,
      openMobileLanguageDrawer,
      closeMobileLanguageDrawer,
      isMobileLanguageDrawerOpen,
      registeredFields,
    }),
    [
      registerLanguageSwitcherFields,
      setLanguageSwitcherDisabled,
      isLanguageSwitcherDisabled,
      openMobileLanguageDrawer,
      closeMobileLanguageDrawer,
      isMobileLanguageDrawerOpen,
      registeredFields,
    ]
  );

  return (
    <LanguageSelectionModalContext.Provider value={value}>
      {children}
      <LanguageSelectionMobileModalRoot />
    </LanguageSelectionModalContext.Provider>
  );
}

export function useLanguageSelectionModal(): LanguageSelectionModalContextValue {
  const context = useContext(LanguageSelectionModalContext);
  if (context === undefined) {
    throw new Error(
      "useLanguageSelectionModal must be used within a LanguageSelectionModalProvider"
    );
  }
  return context;
}
