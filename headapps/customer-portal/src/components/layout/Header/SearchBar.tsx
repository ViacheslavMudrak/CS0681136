"use client";

import {
  ChevronDownIcon,
  DocumentsIcon,
  InvoicesIcon,
  OrdersIcon,
  PartsIcon,
  SearchIcon,
  ShipmentsIcon,
  SupportTicketsIcon,
} from "@/components/shared/icons";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useClickOutside from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";

interface SearchType {
  id: string;
  label: string;
  icon: ReactElement;
}

const searchTypes: SearchType[] = [
  { id: "orders", label: "Orders", icon: <OrdersIcon /> },
  { id: "invoices", label: "Invoices", icon: <InvoicesIcon /> },
  { id: "shipments", label: "Shipments", icon: <ShipmentsIcon /> },
  { id: "documents", label: "Documents", icon: <DocumentsIcon /> },
  {
    id: "support-tickets",
    label: "Support Tickets",
    icon: <SupportTicketsIcon />,
  },
  { id: "parts", label: "Parts", icon: <PartsIcon /> },
];

export default function SearchBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchType, setSearchType] = useState<SearchType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false), isDropdownOpen);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isDropdownOpen]);

  const handleTypeSelect = (type: SearchType) => {
    setSearchType(type);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const displayText = searchType ? searchType.label : "Search Type";
  const placeholder = "Start typing to search orders, documents, parts, etc";

  return (
    <div
      className="box-border flex flex-row items-center overflow-visible relative pe-4 gap-4 w-[622px] max-w-full bg-white border border-[#d7d9da] rounded-[2px]"
      ref={dropdownRef}
    >
      <div className="flex items-center relative shrink-0">
        <Button
          variant="muted"
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1.5 h-[34px] px-3 bg-slate-100 rounded-none border-0 border-e border-[#d7d9da] text-slate-900 text-sm font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap min-w-[116.797px] hover:bg-slate-200"
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
          aria-label="Select search type"
        >
          <span className="flex-1 min-w-0 leading-[19.5px] tracking-[-0.0762px]">{displayText}</span>
          <ChevronDownIcon
            width={14}
            height={14}
            className={cn(
              "w-[14px] h-[14px] shrink-0 transition-transform duration-150 rotate-180",
              isDropdownOpen && "rotate-0"
            )}
            decorative={true}
          />
        </Button>
        {isDropdownOpen && (
          <div className="absolute top-full mt-1.5 start-0 bg-white border border-gray-200 border-solid rounded-lg shadow-md py-1.5 px-1.5 z-50 min-w-[116.797px] w-full">
            {searchTypes.map((type) => (
              <Button
                key={type.id}
                variant="muted"
                onPress={() => handleTypeSelect(type)}
                className="flex items-center justify-start h-[31.5px] px-2 rounded-md w-full text-start bg-transparent border-none cursor-pointer transition-colors duration-150 relative hover:bg-gray-50"
              >
                <div className="w-[16px] h-[16px] shrink-0 relative [&_img]:block [&_img]:max-w-none [&_img]:w-full [&_img]:h-full">
                  {type.icon}
                </div>
                <span className="ms-2 text-gray-900 text-sm font-normal leading-[19.5px] tracking-[-0.0762px]">
                  {type.label}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-start items-center gap-2 flex-1 min-w-0 px-0">
        <div className="w-[16px] h-[16px] shrink-0">
          <SearchIcon width={16} height={16} className="text-gray-600" decorative={true} />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          aria-label="Search across orders, documents, parts and more"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 h-4 border-0 outline-none text-gray-600 text-sm font-normal placeholder:text-gray-600 bg-transparent disabled:cursor-not-allowed"
          disabled={!searchType}
        />
      </div>
    </div>
  );
}
