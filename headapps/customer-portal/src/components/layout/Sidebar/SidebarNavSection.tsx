import React from "react";

interface SidebarNavSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function SidebarNavSection({
  title,
  children,
}: SidebarNavSectionProps) {
  return (
    <div className="w-full">
      <div className="text-[#6a7282] text-[10px] uppercase tracking-[0.5px] font-normal px-[7px] mb-[10px]">
        {title}
      </div>
      <div className="flex flex-col gap-0">{children}</div>
    </div>
  );
}
