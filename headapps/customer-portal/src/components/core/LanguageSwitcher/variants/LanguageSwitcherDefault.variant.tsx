"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  NextImage as ContentSdkImage,
  Text as ContentSdkText,
  useSitecore,
} from "@sitecore-content-sdk/nextjs";
import { IParams } from "src/helpers/interface";
import type { ILanguageSwitcherFields } from "../LanguageSwitcher.type";
import ChevronUpIcon from "components/shared/icons/ChevronUpIcon";
import ChevronDownIcon from "components/shared/icons/ChevronDownIcon";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useLanguageSwitcherHandlers } from "@/hooks/use-language-switcher-handlers";
import { useLanguageSelectionModal } from "@/lib/language-selection-modal-context";

interface ILanguageSwitcherVariantProps {
  testId: string;
  fields: ILanguageSwitcherFields;
  params: IParams;
}

const LanguageSwitcherDefaultVariantBase = ({
  testId,
  fields,
  params,
}: ILanguageSwitcherVariantProps): React.ReactElement => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  const isLanguageSwitcherDisabled = params?.DisableLanguageSwitcher === "1";
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isMobileLanguageViewport, setIsMobileLanguageViewport] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    registerLanguageSwitcherFields,
    setLanguageSwitcherDisabled,
    openMobileLanguageDrawer,
    closeMobileLanguageDrawer,
    isMobileLanguageDrawerOpen,
  } = useLanguageSelectionModal();

  const onAfterNavigate = useCallback(() => {
    setIsDesktopOpen(false);
    closeMobileLanguageDrawer();
  }, [closeMobileLanguageDrawer]);

  const { currentLanguage, isLocaleInRoute, handleLanguageSelect } = useLanguageSwitcherHandlers(
    fields,
    { onAfterNavigate }
  );

  useEffect(() => {
    const clearRegistration = () => {
      setLanguageSwitcherDisabled(false);
      registerLanguageSwitcherFields(null);
    };

    if (!fields) {
      clearRegistration();
      return clearRegistration;
    }
    if (isLanguageSwitcherDisabled && !isEditing) {
      setLanguageSwitcherDisabled(true);
      registerLanguageSwitcherFields(null);
      return () => {
        setLanguageSwitcherDisabled(false);
        registerLanguageSwitcherFields(null);
      };
    }
    setLanguageSwitcherDisabled(false);
    const hasMultiple = Boolean(fields.LanguageSelection && fields.LanguageSelection.length > 1);
    if (hasMultiple) {
      registerLanguageSwitcherFields(fields);
    } else {
      registerLanguageSwitcherFields(null);
    }
    return () => clearRegistration();
  }, [
    fields,
    isLanguageSwitcherDisabled,
    isEditing,
    registerLanguageSwitcherFields,
    setLanguageSwitcherDisabled,
  ]);

  // Close dropdown when clicking outside (desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDesktopOpen(false);
      }
    };

    if (isDesktopOpen && !isMobileLanguageViewport) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktopOpen, isMobileLanguageViewport]);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobileLanguageViewport(window.innerWidth <= 767);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Close desktop dropdown on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDesktopOpen(false);
    };
    if (isDesktopOpen && !isMobileLanguageViewport)
      document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isDesktopOpen, isMobileLanguageViewport]);

  const isMenuOpen = isMobileLanguageViewport ? isMobileLanguageDrawerOpen : isDesktopOpen;

  const toggleMenu = () => {
    if (isMobileLanguageViewport) {
      if (isMobileLanguageDrawerOpen) {
        closeMobileLanguageDrawer();
      } else {
        openMobileLanguageDrawer();
      }
    } else {
      setIsDesktopOpen((prev) => !prev);
    }
  };

  if (!fields || (isLanguageSwitcherDisabled && !isEditing)) {
    return <div data-testid={testId} />;
  }

  const hasMultipleLanguages = fields.LanguageSelection && fields.LanguageSelection.length > 1;
  if (!hasMultipleLanguages) {
    return <div data-testid={testId} />;
  }

  return (
    <div
      className={"relative me-[16px] max-md:me-[-30px] rtl:max-md:me-[8px]"}
      ref={dropdownRef}
      data-testid={testId}
    >
      <Button
        variant="transparent"
        onPress={toggleMenu}
        className={
          "group flex items-center gap-[4px] h-[36px] px-[10px] rounded-[4px] hover:bg-[var(--color-contact-trigger-bg)] max-md:hidden"
        }
        aria-expanded={isMenuOpen}
        aria-haspopup="listbox"
        aria-label="Select Language"
        type="button"
      >
        {fields.Icon?.value?.src && (
          <ContentSdkImage
            field={fields.Icon}
            className={"shrink-0 w-[15px] h-[15px] object-contain"}
            width={Number(fields.Icon?.value?.width) || 15}
            height={Number(fields.Icon?.value?.height || 15)}
            alt={String(fields.Icon?.value?.alt || "Language")}
            aria-hidden="true"
          />
        )}
        {isLocaleInRoute && currentLanguage ? (
          <ContentSdkText
            field={currentLanguage.fields.LanguageTitle}
            tag="span"
            className={
              "text-[var(--color-text-black)] text-[14px] font-medium leading-[100%] tracking-[-0.0762px] group-hover:text-[var(--color-text-active)]"
            }
          />
        ) : (
          <ContentSdkText
            field={fields.Title}
            tag="span"
            className={
              "text-[var(--color-text-black)] text-[14px] font-medium leading-[100%] tracking-[-0.0762px] group-hover:text-[var(--color-text-active)]"
            }
          />
        )}
        {isMenuOpen ? (
          <ChevronUpIcon
            width={10}
            height={10}
            stroke="#45556c"
            className={"shrink-0 w-[10px] h-[10px] max-md:hidden"}
            decorative={true}
          />
        ) : (
          <ChevronDownIcon
            width={12}
            height={12}
            stroke="#45556c"
            className={"shrink-0 w-[10px] h-[10px] max-md:hidden"}
            decorative={true}
          />
        )}
      </Button>

      {isDesktopOpen && !isMobileLanguageViewport && (
        <div
          className={
            "absolute top-full mt-2 inset-e-0 inset-s-auto flex flex-col items-start box-border w-[200px] max-w-[calc(100vw_-_16px)] bg-white border border-solid border-[#E2E8F0] rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] p-[1px] z-50 overflow-hidden max-md:hidden"
          }
          role="listbox"
          aria-label="Language selection"
        >
          {fields.LanguageSelection.map((language) => {
            const isSelected = currentLanguage?.id === language.id;

            return (
              <Button
                key={language.id}
                variant="transparent"
                onPress={() => handleLanguageSelect(language)}
                className={cn(
                  "flex items-center justify-start w-full px-[12px] py-[10px] transition-colors duration-150 border-0 cursor-pointer border-b border-[#F1F5F9] last:border-b-0 rounded-none",
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
      )}
    </div>
  );
};

export const LanguageSwitcherDefaultVariant = React.memo(LanguageSwitcherDefaultVariantBase);
