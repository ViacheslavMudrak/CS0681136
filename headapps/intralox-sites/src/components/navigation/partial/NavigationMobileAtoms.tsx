"use client";

import type {
  ComponentPropsWithoutRef,
  JSX,
  MouseEventHandler,
  ReactNode,
} from "react";

import type { LinkField } from "@sitecore-content-sdk/nextjs";
import { Link as SitecoreLink } from "@sitecore-content-sdk/nextjs";
import { cn } from "lib/utils";

import { UI_ICONS } from "./NavigationIcons";

type MobileNavRowVariant =
  | "primaryLink"
  | "primaryStatic"
  | "primaryExpand"
  | "secondaryExpand"
  | "secondaryRow"
  | "tertiaryRow"
  | "nestedSectionOverview"
  | "primarySectionOverview";

const MOBILE_OVERLAY_SLIDE_TRANSITION =
  "transition-transform duration-500 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none motion-reduce:duration-0";

interface MobileNavRowSitecoreLinkProps {
  field: LinkField;
  editable: boolean;
  target?: string;
  rel?: string;
  variant: MobileNavRowVariant;
  isCurrent: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
  "aria-current"?: "page" | undefined;
}

/** Mobile nav row Sitecore link — shared row chrome `cn()` per variant. */
export function MobileNavRowSitecoreLink({
  field,
  editable,
  target,
  rel,
  variant,
  isCurrent,
  onClick,
  children,
  "aria-current": ariaCurrent,
}: MobileNavRowSitecoreLinkProps): JSX.Element {
  return (
    <SitecoreLink
      field={field}
      editable={editable}
      target={target}
      rel={rel}
      className={cn(
        "rounded",
        variant === "primaryLink" ||
          variant === "primaryStatic" ||
          variant === "primaryExpand"
          ? "text-base"
          : "text-sm",
        "font-nav-belt-finder font-normal [-webkit-tap-highlight-color:transparent] [-webkit-font-smoothing:auto] cursor-default transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] bg-transparent border-0 block w-full text-left",
        variant === "primaryLink" ||
          variant === "primaryStatic" ||
          variant === "primaryExpand"
          ? "relative leading-loose py-1 pl-1 pr-4"
          : variant === "secondaryRow" ||
              variant === "secondaryExpand" ||
              variant === "primarySectionOverview"
            ? "relative leading-loose py-1 px-4"
            : "leading-loose py-1 pl-8 pr-4",
        "hover:bg-black/25 focus:bg-black/25",
        variant === "primaryLink" ||
          variant === "primaryStatic" ||
          variant === "primaryExpand"
          ? "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-0"
          : "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0",
        "my-[1px]",
        variant === "primaryExpand" || variant === "secondaryExpand"
          ? "text-ink-inverse! focus:text-ink-inverse"
          : isCurrent
            ? "box-border !bg-stroke-default !text-ink-primary !leading-7 hover:!bg-stroke-default focus:!bg-stroke-default hover:!text-ink-primary focus:!text-ink-primary focus-visible:ring-2 focus-visible:ring-ink-primary/30 focus-visible:ring-offset-0"
            : "text-ink-inverse! focus:text-ink-inverse",
        (variant === "primaryLink" ||
          variant === "secondaryRow" ||
          variant === "tertiaryRow" ||
          variant === "primarySectionOverview" ||
          variant === "nestedSectionOverview") &&
          "no-underline!",
      )}
      aria-current={ariaCurrent}
      onClick={onClick}
    >
      {children}
    </SitecoreLink>
  );
}

interface MobileNavRowAnchorLinkProps {
  href: string;
  variant: MobileNavRowVariant;
  isCurrent: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
  "aria-current"?: "page" | undefined;
  "aria-label"?: string;
}

/** Mobile nav row native anchor — shared row chrome `cn()` per variant. */
export function MobileNavRowAnchorLink({
  href,
  variant,
  isCurrent,
  onClick,
  children,
  "aria-current": ariaCurrent,
  "aria-label": ariaLabel,
}: MobileNavRowAnchorLinkProps): JSX.Element {
  return (
    <a
      href={href}
      className={cn(
        "rounded",
        variant === "primaryLink" ||
          variant === "primaryStatic" ||
          variant === "primaryExpand"
          ? "text-base"
          : "text-sm",
        "font-nav-belt-finder font-normal [-webkit-tap-highlight-color:transparent] [-webkit-font-smoothing:auto] cursor-default transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] bg-transparent border-0 block w-full text-left",
        variant === "primaryLink" ||
          variant === "primaryStatic" ||
          variant === "primaryExpand"
          ? "relative leading-loose py-1 pl-1 pr-4"
          : variant === "secondaryRow" ||
              variant === "secondaryExpand" ||
              variant === "primarySectionOverview"
            ? "relative leading-loose py-1 px-4"
            : "leading-loose py-1 pl-8 pr-4",
        "hover:bg-black/25 focus:bg-black/25",
        variant === "primaryLink" ||
          variant === "primaryStatic" ||
          variant === "primaryExpand"
          ? "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-0"
          : "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0",
        "my-[1px]",
        variant === "primaryExpand" || variant === "secondaryExpand"
          ? "text-ink-inverse! focus:text-ink-inverse"
          : isCurrent
            ? "box-border !bg-stroke-default !text-ink-primary !leading-7 hover:!bg-stroke-default focus:!bg-stroke-default hover:!text-ink-primary focus:!text-ink-primary focus-visible:ring-2 focus-visible:ring-ink-primary/30 focus-visible:ring-offset-0"
            : "text-ink-inverse! focus:text-ink-inverse",
        (variant === "primaryLink" ||
          variant === "secondaryRow" ||
          variant === "tertiaryRow" ||
          variant === "primarySectionOverview" ||
          variant === "nestedSectionOverview") &&
          "no-underline!",
      )}
      aria-current={ariaCurrent}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}

interface MobileNavRowStaticLabelProps {
  variant: MobileNavRowVariant;
  isCurrent: boolean;
  children: ReactNode;
  "aria-current"?: "page" | undefined;
}

/** Mobile nav row static label — shared row chrome when href is absent. */
export function MobileNavRowStaticLabel({
  variant,
  isCurrent,
  children,
  "aria-current": ariaCurrent,
}: MobileNavRowStaticLabelProps): JSX.Element {
  return (
    <span
      className={cn(
        "rounded",
        variant === "primaryLink" ||
          variant === "primaryStatic" ||
          variant === "primaryExpand"
          ? "text-base"
          : "text-sm",
        "font-nav-belt-finder font-normal [-webkit-tap-highlight-color:transparent] [-webkit-font-smoothing:auto] cursor-default transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] bg-transparent border-0 block w-full text-left",
        variant === "primaryLink" ||
          variant === "primaryStatic" ||
          variant === "primaryExpand"
          ? "relative leading-loose py-1 pl-1 pr-4"
          : variant === "secondaryRow" ||
              variant === "secondaryExpand" ||
              variant === "primarySectionOverview"
            ? "relative leading-loose py-1 px-4"
            : "leading-loose py-1 pl-8 pr-4",
        "hover:bg-black/25 focus:bg-black/25",
        variant === "primaryLink" ||
          variant === "primaryStatic" ||
          variant === "primaryExpand"
          ? "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-0"
          : "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0",
        "my-[1px]",
        variant === "primaryExpand" || variant === "secondaryExpand"
          ? "text-ink-inverse! focus:text-ink-inverse"
          : isCurrent
            ? "box-border !bg-stroke-default !text-ink-primary !leading-7 hover:!bg-stroke-default focus:!bg-stroke-default hover:!text-ink-primary focus:!text-ink-primary focus-visible:ring-2 focus-visible:ring-ink-primary/30 focus-visible:ring-offset-0"
            : "text-ink-inverse! focus:text-ink-inverse",
        (variant === "primaryLink" ||
          variant === "secondaryRow" ||
          variant === "tertiaryRow" ||
          variant === "primarySectionOverview" ||
          variant === "nestedSectionOverview") &&
          "no-underline!",
      )}
      aria-current={ariaCurrent}
    >
      {children}
    </span>
  );
}

interface MobileNavExpandButtonProps {
  variant: "primaryExpand" | "secondaryExpand";
  onClick: () => void;
  isExpanded: boolean;
  "aria-label": string;
  children: ReactNode;
}

/** Mobile nav primary/secondary expand toggle — shared expand button `cn()`. */
export function MobileNavExpandButton({
  variant,
  onClick,
  isExpanded,
  "aria-label": ariaLabel,
  children,
}: MobileNavExpandButtonProps): JSX.Element {
  const chevronPosition =
    variant === "primaryExpand"
      ? "absolute right-0 top-1/2 -translate-y-1/2 mr-1"
      : "absolute right-2 top-1/2 -translate-y-1/2 ";

  return (
    <button
      type="button"
      className={cn(
        "rounded",
        variant === "primaryExpand" ? "text-base" : "text-sm",
        "font-nav-belt-finder font-normal [-webkit-tap-highlight-color:transparent] [-webkit-font-smoothing:auto] cursor-default transition-[color,background-color,border-color,outline-color,text-decoration-color,fill,stroke] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] bg-transparent border-0 block w-full text-left",
        variant === "primaryExpand"
          ? "relative leading-loose py-1 pl-1 pr-4"
          : "relative leading-loose py-1 px-4",
        "hover:bg-black/25 focus:bg-black/25",
        variant === "primaryExpand"
          ? "focus:outline-none focus:ring-0 focus:ring-white/40 focus:ring-offset-0"
          : "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0",
        "my-[1px]",
        "text-ink-inverse! focus:text-ink-inverse",
      )}
      onClick={onClick}
      aria-expanded={isExpanded}
      aria-label={ariaLabel}
    >
      {children}
      <span
        className={cn(
          chevronPosition,
          "transition-transform inline-flex [&_svg]:w-4 [&_svg]:h-4 duration-500 ease-out motion-reduce:transition-none motion-reduce:duration-0",
          isExpanded && "rotate-180",
        )}
        aria-hidden="true"
      >
        {UI_ICONS.chevronDown}
      </span>
    </button>
  );
}

export interface MobileNavExpandCollapseGridProps {
  isExpanded: boolean;
  children: ReactNode;
}

/** Accordion grid wrapper — shared expand/collapse transition `cn()`. */
export function MobileNavExpandCollapseGrid({
  isExpanded,
  children,
}: MobileNavExpandCollapseGridProps): JSX.Element {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none motion-reduce:duration-0",
        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
      aria-hidden={!isExpanded}
    >
      <div
        className="min-h-0 overflow-hidden"
        inert={!isExpanded ? true : undefined}
      >
        {children}
      </div>
    </div>
  );
}

interface MobileOverlayBackdropProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Slide-in menu scrim — backdrop opacity transition `cn()`. */
export function MobileOverlayBackdrop({
  isOpen,
  onClose,
}: MobileOverlayBackdropProps): JSX.Element {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[998] desktop:hidden bg-surface-strong/30",
        "transition-opacity duration-500 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none motion-reduce:duration-0",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
      onClick={onClose}
      aria-hidden={!isOpen}
    />
  );
}

interface MobileOverlayUnderlayProps {
  isOpen: boolean;
}

/** Slide-in menu underlay panel — shared slide transition with main panel. */
export function MobileOverlayUnderlay({
  isOpen,
}: MobileOverlayUnderlayProps): JSX.Element {
  return (
    <div
      className={cn(
        "fixed top-0 right-0 z-[999] h-full w-[300px] max-w-full bg-surface-muted desktop:hidden",
        MOBILE_OVERLAY_SLIDE_TRANSITION,
        isOpen
          ? "translate-x-0 delay-0"
          : "translate-x-full delay-0 motion-reduce:delay-0",
      )}
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
    />
  );
}

export interface MobileOverlayPanelProps extends ComponentPropsWithoutRef<"div"> {
  isOpen: boolean;
  children: ReactNode;
}

/** Slide-in menu content panel — shared slide transition with underlay. */
export function MobileOverlayPanel({
  isOpen,
  children,
  ...rest
}: MobileOverlayPanelProps): JSX.Element {
  return (
    <div
      className={cn(
        "fixed top-0 right-0 z-[1000] h-full w-[300px] max-w-full bg-chrome-stripe font-nav-belt-finder overflow-y-auto [-webkit-overflow-scrolling:touch] shadow-[inset_0.5rem_0_0.5rem_0_rgba(0,0,0,.28235)] desktop:hidden py-16 pl-8 pr-4",
        MOBILE_OVERLAY_SLIDE_TRANSITION,
        isOpen
          ? `translate-x-0 ${"delay-[20ms] motion-reduce:delay-0"}`
          : "translate-x-full delay-0 motion-reduce:delay-0",
      )}
      role="dialog"
      aria-modal={isOpen}
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      style={{ boxSizing: "border-box" }}
      {...rest}
    >
      {children}
    </div>
  );
}
