"use client";

import { ChevronDownIcon, GlobeIcon, LanguageCheckIcon } from "@/components/shared/icons";
import Button from "@/components/ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

import { languages, useLanguage } from "lib/language-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function Language() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const { currentLanguage, setLanguage } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePosition = () => {
      if (!containerRef.current) {
        return;
      }

      const triggerElement = containerRef.current.querySelector(
        '[data-language-trigger="true"]'
      ) as HTMLElement | null;

      if (!triggerElement) {
        return;
      }

      const rect = triggerElement.getBoundingClientRect();
      const dropdownWidth = menuRef.current?.offsetWidth ?? 200;
      const viewportPadding = 8;
      const left = Math.max(
        viewportPadding,
        Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - viewportPadding)
      );

      setDropdownPosition({
        top: rect.bottom + 8,
        left,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleLanguageSelect = (language: (typeof languages)[0]) => {
    setLanguage(language);
    setIsOpen(false);
    router.push(pathname);
  };

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <Button
        variant="transparent"
        onPress={() => setIsOpen(!isOpen)}
        className="w-32 h-9 px-2.5 rounded-sm flex items-center justify-center gap-1 transition-colors duration-150 text-[12px] hover:bg-[var(--color-contact-trigger-bg)]"
        data-language-trigger="true"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Select Language"
      >
        <GlobeIcon
          width={16}
          height={16}
          className="text-gray-900 size-4 shrink-0"
          decorative={false}
          aria-label="Select Language"
        />
        <span className="text-gray-900 text-[12px] font-medium leading-4">Language</span>
        <ChevronDownIcon
          width={12}
          height={12}
          className={cn(
            "shrink-0 transition-transform duration-150 size-3",
            isOpen && "rotate-180"
          )}
          decorative={true}
        />
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          className="box-border flex flex-col items-start p-px w-[200px] overflow-hidden z-50 bg-white border border-[#e8eaeb] shadow-[0px_0px_12px_0px_rgba(0,0,0,0.13)] rounded-[6px]"
          style={{
            position: "fixed",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          <div className="h-[26.5px] px-[4px] pt-[4px]">
            <p className="text-slate-500 text-xs font-medium leading-[16.5px] tracking-[0.6145px] uppercase px-2 pt-1.5">
              Select Language
            </p>
          </div>
          <div className="h-px mt-1 bg-[#e8eaeb]" />
          <div className="py-[4px] px-[4px]">
            {languages.map((language) => {
              const isSelected = language.code === currentLanguage.code;
              return (
                <Button
                  key={language.code}
                  variant="transparent"
                  onPress={() => handleLanguageSelect(language)}
                  className={cn(
                    "flex items-center justify-between h-[56.266px] px-3 py-0 rounded-md w-full text-start transition-colors duration-150 hover:bg-[#fafafa]",
                    isSelected && "bg-[#eaf1fb]"
                  )}
                  aria-selected={isSelected}
                >
                  <div className="flex flex-col gap-[2px] flex-1">
                    <div
                      className={cn(
                        "text-slate-900 text-sm font-medium leading-[18.571px] tracking-[-0.0762px]",
                        isSelected && "text-blue-600"
                      )}
                    >
                      {language.name}
                    </div>
                    <div className="text-slate-500 text-xs font-normal leading-[15.714px] tracking-[0.0645px]">
                      {language.country}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-[16px] h-[16px] shrink-0 [&_img]:block [&_img]:max-w-none [&_img]:w-full [&_img]:h-full">
                      <LanguageCheckIcon aria-description="Selected" decorative={false} />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
