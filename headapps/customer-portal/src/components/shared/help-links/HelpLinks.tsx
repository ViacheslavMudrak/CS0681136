import Link from "next/link";
import React from "react";

interface HelpLink {
  text: string;
  href: string;
  linkText: string;
}

interface HelpLinksProps {
  links: HelpLink[];
}

export default function HelpLinks({ links }: HelpLinksProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 md:gap-5 lg:gap-5 items-center w-full">
      <div className="bg-[rgba(0,0,0,0.08)] h-px shrink-0 w-full" />
      <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-2.5 lg:gap-2.5 items-center w-full">
        {links.map((link, index) => (
          <div key={index} className="relative shrink-0 w-full">
            <div className="box-border flex flex-wrap gap-1 items-center justify-center leading-[18px] sm:leading-[19px] md:leading-[19.25px] lg:leading-[19.25px] text-[11px] sm:text-[11.5px] md:text-xs lg:text-xs">
              <span className="font-normal shrink-0 text-[#222222] text-center">{link.text} </span>
              <Link
                href={link.href}
                className="font-medium h-auto shrink-0 text-[#0377ba] whitespace-pre-wrap hover:underline"
              >
                {link.linkText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
