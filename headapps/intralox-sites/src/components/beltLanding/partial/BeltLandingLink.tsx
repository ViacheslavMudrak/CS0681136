"use client";
import { usePathname } from "next/navigation";
import { cn } from "lib/utils";
import NextLink from "next/link";

const BeltLandingLink = ({
  link,
  index,
}: {
  link: { label: string; url: string };
  index: number;
}) => {
  const pathname = usePathname();
  const normalizePath = (url: string) => {
    const trimmed = (url || "").trim();
    if (!trimmed) return "/";
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  };
  const href = normalizePath(link.url);
  const isActive = pathname === href;
  return (
    <li key={index} className="!ml-0">
      <NextLink
        href={href}
        className={cn(
          "ids-tab text-sm flex justify-center px-1 py-3 cursor-pointer border-transparent disabled:text-ink-tertiary outline-hidden focus-visible:ring whitespace-nowrap border-b-[3px]",
          isActive && "text-ink-primary border-accent-danger font-medium",
          !isActive &&
            "text-ink-secondary hover:border-stroke-default focus-visible:border-stroke-default focus:border-stroke-default active:border-stroke-default active:text-ink-primary",
        )}
        scroll={false}
      >
        {link.label}
      </NextLink>
    </li>
  );
};

export default BeltLandingLink;
