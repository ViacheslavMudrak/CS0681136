"use client";

import {
  EmailIcon,
  HelpCenterIcon,
  PhoneIcon,
  SupportCaseIcon,
  SupportIcon,
} from "@/components/shared/icons";
import Button from "@/components/ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface SupportContact {
  name: string;
  initials: string;
  email: string;
  phone: string;
}

const supportContacts: SupportContact[] = [
  {
    name: "Sarah Jenkins",
    initials: "SJ",
    email: "sarah.jenkins@intralox.com",
    phone: "+1 (504) 555-0123",
  },
  {
    name: "Michael Chen",
    initials: "MC",
    email: "michael.chen@intralox.com",
    phone: "+1 (504) 555-0189",
  },
];

export default function Help() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

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

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, "")}`;
  };

  const handleHelpCenterClick = () => {
    window.open("https://help.intralox.com", "_blank");
  };

  const handleSupportCaseClick = () => {
    window.open("https://support.intralox.com", "_blank");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="transparent"
        onPress={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 px-2.5 rounded-sm",
          "flex justify-center items-center gap-1",
          "transition-colors duration-150",
          "hover:bg-gray-50 text-[12px]"
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Contact"
      >
        <SupportIcon
          width={16}
          height={16}
          className="text-gray-900 size-4 shrink-0"
          decorative={false}
          aria-label="Contact"
        />
        <span className="text-gray-900 font-medium leading-4">Contact</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-2 end-0 bg-white border border-gray-200 border-solid rounded-lg shadow-lg w-[338px] overflow-hidden z-50 max-md:w-[320px] max-md:start-0 max-md:end-auto">
          <div className="bg-slate-50 border-b border-slate-100 border-solid flex flex-col gap-1 p-4 pt-4 h-[73px]">
            <h4 className="text-[#0f172b] text-[14px] font-semibold leading-[20px] tracking-[-0.1504px] h-[20px]">
              Your Support Team
            </h4>
            <p className="text-slate-500 text-xs font-normal leading-4 flex-1">
              Contact your dedicated representatives directly.
            </p>
          </div>

          <div className="flex flex-col">
            {supportContacts.map((contact, index) => (
              <div
                key={contact.email}
                className={cn(
                  "flex gap-3 p-4 border-b border-slate-100 border-solid h-[97px]",
                  index === supportContacts.length - 1 && "border-b-0"
                )}
              >
                <div className="w-10 h-10 rounded-full border border-gray-200 border-solid bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-gray-900 font-normal leading-6 tracking-[-0.3125px]">
                    {contact.initials}
                  </span>
                </div>
                <div className="flex flex-col gap-[6px] flex-1 min-w-0">
                  <h5 className="text-slate-900 text-sm font-semibold leading-5 tracking-[-0.1504px] h-5">
                    {contact.name}
                  </h5>
                  <div className="flex flex-col gap-[6px] h-[38px]">
                    <Button
                      variant="muted"
                      onPress={() => handleEmailClick(contact.email)}
                      className={cn(
                        "flex items-center gap-2",
                        "text-gray-600 text-xs font-normal leading-4",
                        "hover:text-blue-600 transition-colors duration-150",
                        "h-4 bg-transparent border-none p-0"
                      )}
                      style={{ textAlign: "start" }}
                      aria-label={`Email ${contact.name}`}
                    >
                      <EmailIcon
                        className="w-[14px] h-[14px] shrink-0"
                        aria-description="Email"
                        decorative={false}
                      />
                      <span>{contact.email}</span>
                    </Button>
                    <Button
                      variant="muted"
                      onPress={() => handlePhoneClick(contact.phone)}
                      className={cn(
                        "flex items-center gap-2",
                        "text-gray-600 text-xs font-normal leading-4",
                        "hover:text-blue-600 transition-colors duration-150",
                        "h-4 bg-transparent border-none p-0"
                      )}
                      style={{ textAlign: "start" }}
                      aria-label={`Call ${contact.name}`}
                    >
                      <PhoneIcon
                        className="w-[14px] h-[14px] shrink-0"
                        aria-description="Phone"
                        decorative={false}
                      />
                      <span>{contact.phone}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-slate-100" />

          <div className="bg-slate-50/30 p-2 flex flex-col gap-0.5 h-[82px]">
            <Button
              variant="muted"
              onPress={handleHelpCenterClick}
              className={cn(
                "flex items-center gap-2",
                "h-[33px] px-3 rounded-lg",
                "text-gray-600 text-sm font-medium leading-[19.5px]",
                "tracking-[-0.0762px]",
                "transition-colors duration-150",
                "hover:bg-white relative"
              )}
            >
              <HelpCenterIcon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-center">Visit Help Center</span>
            </Button>
            <Button
              variant="muted"
              onPress={handleSupportCaseClick}
              className={cn(
                "flex items-center gap-2",
                "h-[33px] px-3 rounded-lg",
                "text-gray-600 text-sm font-medium leading-[19.5px]",
                "tracking-[-0.0762px]",
                "transition-colors duration-150",
                "hover:bg-white relative"
              )}
            >
              <SupportCaseIcon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-center">Submit a Support Case</span>
            </Button>
          </div>

          <div className="bg-slate-50 border-t border-slate-100 border-solid p-3 pt-[13px] h-[41.5px]">
            <p className="text-slate-500 text-xs font-normal leading-[16.5px] tracking-[0.0645px] text-center">
              Available Mon-Fri, 8am - 6pm EST
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
