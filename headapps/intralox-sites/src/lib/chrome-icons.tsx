import { JSX, type ComponentType, type SVGProps } from "react";
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Facebook,
  Globe,
  Headphones,
  Image,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Phone,
  PhoneCall,
  PiggyBankSolid,
  Play,
  PlayCircle,
  Search,
  Share2,
  Star,
  StethoscopeSolid,
  Twitter,
  X,
  Youtube,
  Zap,
  ZoomIn,
} from "@laitram-l-l-c/intralox-icon-library";

import {
  cmsIconIsOutlineCircleBadge,
  cmsIconToFontAwesome,
  type FontAwesomeStyle,
} from "lib/cms-icon-to-fontawesome";
import {
  detectSocialPlatform,
  SocialPlatform,
} from "components/footer/footerUtils";

export type ChromeSvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

/** Base classes — SVG inherits `currentColor` from parent. */
export const CHROME_ICON_BASE = "inline-block shrink-0";

/**
 * SVG icons do not scale like FA webfont `<i>` tags — pair with `size-[1em]` (or explicit `size-*`)
 * so `text-*` on a parent or `font-size` utility actually sets width/height.
 */
export const CHROME_ICON_SIZE_EM = "size-[1em]";

/** FA `fa-2xs` (0.625rem / 10px @ 16px root) — nav mega-menu / quick-link chevrons. */
export const CHROME_ICON_SIZE_2XS = "size-2.5";

/** FA `fa-xs` (0.75rem / 12px). */
export const CHROME_ICON_SIZE_XS = "size-3";

/** FA `fa-sm` (0.875rem / 14px). */
export const CHROME_ICON_SIZE_SM = "size-4";

/** Header utility bar phone + globe — live intralox.com computed (18.6667 × 19px). */
export const CHROME_ICON_SIZE_UTILITY_STRIP = `${CHROME_ICON_BASE} block leading-none shrink-0 w-[length:var(--width-utility-strip-icon)] h-[length:var(--height-utility-strip-icon)] -translate-y-px`;

/** 12px trailing chevron — Featured News View All. */
export const CHROME_ICON_SIZE_12PX = "size-3";

/** Standard trailing chevron / link arrow (live parity). */
export const CHROME_ICON_SIZE_14PX = "size-[14px]";

/** 16px trailing chevron — media tile text links. */
export const CHROME_ICON_SIZE_16PX = "size-4";

/** FA `fa-lg` (1.25rem / 20px). */
export const CHROME_ICON_SIZE_LG = "size-5";

/** Slot wrappers for 14px chevron SVG children (callouts, related case studies). */
export const CHROME_ICON_SLOT_14PX =
  "[&_i]:m-0 [&_i]:block [&_i]:!text-[14px] [&_i]:leading-none [&_i]:origin-center [&_i]:max-h-full [&_i]:max-w-full [&_svg]:m-0 [&_svg]:block [&_svg]:!size-[14px] [&_svg]:shrink-0 [&_svg]:origin-center [&_svg]:max-h-full [&_svg]:max-w-full";

/** Slot wrappers for 16px chevron SVG children (quick links). */
export const CHROME_ICON_SLOT_16PX =
  "[&_i]:m-0 [&_i]:block [&_i]:!text-[16px] [&_i]:leading-none [&_i]:origin-center [&_i]:max-h-full [&_i]:max-w-full [&_svg]:m-0 [&_svg]:block [&_svg]:!size-[16px] [&_svg]:shrink-0 [&_svg]:origin-center [&_svg]:max-h-full [&_svg]:max-w-full";

/** Header search box magnifying glass + close (live: 21.34 × 21px). */
export const CHROME_ICON_SLOT_SEARCH_BOX =
  "[&_i]:m-0 [&_i]:block [&_i]:!text-[length:var(--text-search-box-icon)] [&_i]:leading-none [&_i]:origin-center [&_i]:max-h-full [&_i]:max-w-full [&_svg]:m-0 [&_svg]:block [&_svg]:!w-[length:var(--width-search-box-icon)] [&_svg]:!h-[length:var(--height-search-box-icon)] [&_svg]:shrink-0 [&_svg]:origin-center [&_svg]:max-h-full [&_svg]:max-w-full";

/** Main header strip search trigger beside SEARCH label / hamburger (live: 20.41 × 20px). */
export const CHROME_ICON_SLOT_HEADER_SEARCH =
  "[&_i]:m-0 [&_i]:block [&_i]:!text-[length:var(--text-header-search-icon)] [&_i]:leading-none [&_i]:origin-center [&_i]:max-h-full [&_i]:max-w-full [&_svg]:m-0 [&_svg]:block [&_svg]:!w-[length:var(--width-header-search-icon)] [&_svg]:!h-[length:var(--height-header-search-icon)] [&_svg]:shrink-0 [&_svg]:origin-center [&_svg]:max-h-full [&_svg]:max-w-full";

/** @deprecated Use {@link CHROME_ICON_SLOT_14PX}. */
export const CHROME_ICON_SLOT_10PX = CHROME_ICON_SLOT_14PX;

/** @deprecated Use {@link CHROME_ICON_SLOT_14PX}. */
export const CHROME_ICON_SLOT_11PX = CHROME_ICON_SLOT_14PX;

/** Footer social: FA brands were solid; library glyphs are stroke — fill paths for parity. */
export const FOOTER_SOCIAL_ICON_CLASS =
  "size-6 shrink-0 align-middle stroke-0 [&_path]:fill-current [&_path]:stroke-0 [&_circle]:fill-current [&_circle]:stroke-0";

/** YouTube glyph has frame + play paths; play stays dark (ink) inside white frame. */
export const FOOTER_SOCIAL_YOUTUBE_ICON_CLASS =
  "size-6 shrink-0 align-middle stroke-0 [&_path:first-of-type]:fill-current [&_path:first-of-type]:stroke-0 [&_path:last-of-type]:fill-ink [&_path:last-of-type]:stroke-0";

export const isFooterYoutubeSocialIcon = (
  iconClass?: string,
  href?: string,
): boolean => {
  const platform = detectSocialPlatform(href);
  if (platform === SocialPlatform.YouTube) return true;
  return /youtube|youtu\.be/i.test(iconClass ?? "");
};

export const HEADER_ICON_DEFAULTS = {
  search: "fa-solid fa-magnifying-glass",
  language: "fa-solid fa-globe",
  utilityPhone: "fa-solid fa-phone",
} as const;

/** FA glyph suffix (after `fa-`) → intralox-icon-library component. */
const FA_GLYPH_TO_ICON: Record<string, ChromeSvgIcon> = {
  phone: Phone,
  /** FA `phone-volume` / FAB call — handset with wave arcs (not plain `Phone`). */
  "phone-volume": PhoneCall,
  headset: Headphones,
  headphones: Headphones,
  "magnifying-glass": Search,
  search: Search,
  "magnifying-glass-plus": ZoomIn,
  "zoom-in": ZoomIn,
  globe: Globe,
  image: Image,
  "file-image": Image,
  photo: Image,
  award: Award,
  ribbon: Award,
  medal: Award,
  xmark: X,
  times: X,
  close: X,
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "circle-chevron-down": ChevronDown,
  "chevron-circle-down": ChevronDown,
  bars: Menu,
  linkedin: Linkedin,
  "linkedin-in": Linkedin,
  youtube: Youtube,
  "facebook-f": Facebook,
  facebook: Facebook,
  "x-twitter": Twitter,
  twitter: Twitter,
  instagram: Instagram,
  "arrow-right": ArrowRight,
  "arrow-left": ChevronLeft,
  play: Play,
  "circle-play": PlayCircle,
  "play-circle": PlayCircle,
  "circle-check": CheckCircle,
  "check-circle": CheckCircle,
  check: CheckCircle,
  copy: Copy,
  share: Share2,
  calendar: Calendar,
  "location-dot": MapPin,
  "map-marker": MapPin,
  "map-marker-alt": MapPin,
  "map-pin": MapPin,
  star: Star,
  envelope: Mail,
  mail: Mail,
  message: MessageCircle,
  "message-square": MessageSquare,
  comment: MessageCircle,
  "comment-dots": MessageCircle,
  lightbulb: Zap,
  "piggy-bank": PiggyBankSolid,
  stethoscope: StethoscopeSolid,
  "heart-pulse": StethoscopeSolid,
};

const SOCIAL_PLATFORM_ICON: Record<SocialPlatform, ChromeSvgIcon> = {
  [SocialPlatform.LinkedIn]: Linkedin,
  [SocialPlatform.YouTube]: Youtube,
  [SocialPlatform.Facebook]: Facebook,
  [SocialPlatform.Twitter]: Twitter,
  [SocialPlatform.Instagram]: Instagram,
};

/** 12px trailing chevron — Featured News View All. */
export const ICON_CHEVRON_RIGHT_12PX = (
  <ChevronRight
    className={`${CHROME_ICON_BASE} ${CHROME_ICON_SIZE_12PX}`}
    aria-hidden="true"
  />
);

/** 14px trailing chevron — callouts, featured news Read More, quick links, nav CTAs. */
export const ICON_CHEVRON_RIGHT_14PX = (
  <ChevronRight
    className={`${CHROME_ICON_BASE} ${CHROME_ICON_SIZE_14PX}`}
    aria-hidden="true"
  />
);

/** 16px trailing chevron — media tile text links. */
export const ICON_CHEVRON_RIGHT_16PX = (
  <ChevronRight
    className={`${CHROME_ICON_BASE} ${CHROME_ICON_SIZE_16PX}`}
    aria-hidden="true"
  />
);

/** 14px expand / dropdown chevron — language selector (UtilityBar) only. */
export const ICON_CHEVRON_DOWN_14PX = (
  <ChevronDown
    className={`${CHROME_ICON_BASE} ${CHROME_ICON_SIZE_14PX}`}
    aria-hidden="true"
  />
);

export const UI_ICONS = {
  chevronRight: ICON_CHEVRON_RIGHT_14PX,
  localNavMobilePrimaryRowChevron: ICON_CHEVRON_RIGHT_14PX,
  /** Legacy: `fa-solid fa-chevron-down fa-xs` */
  chevronDown: (
    <ChevronDown
      className={`${CHROME_ICON_BASE} ${CHROME_ICON_SIZE_XS}`}
      aria-hidden="true"
    />
  ),
  /** Legacy: `fa-solid fa-xmark fa-sm` */
  close: (
    <X
      className={`${CHROME_ICON_BASE} ${CHROME_ICON_SIZE_SM}`}
      aria-hidden="true"
    />
  ),
  searchClose: (
    <X
      className={`${CHROME_ICON_BASE} w-[length:var(--width-search-box-icon)] h-[length:var(--height-search-box-icon)]`}
      aria-hidden="true"
    />
  ),
  /** Legacy: `fa-solid fa-bars fa-lg` */
  hamburger: (
    <Menu
      className={`${CHROME_ICON_BASE} ${CHROME_ICON_SIZE_LG}`}
      aria-hidden="true"
    />
  ),
} as const;

/** @deprecated Use {@link UI_ICONS}. */
export const ICONS = UI_ICONS;

/** @deprecated Use {@link ICON_CHEVRON_RIGHT_14PX}. */
export const ICON_CHEVRON_RIGHT_XS = ICON_CHEVRON_RIGHT_14PX;

/** @deprecated Use {@link ICON_CHEVRON_RIGHT_14PX}. */
export const ICON_CHEVRON_RIGHT_SM = ICON_CHEVRON_RIGHT_14PX;

export const ICON_CHEVRON_LEFT_XS = (
  <ChevronLeft
    className={`${CHROME_ICON_BASE} size-[10px]`}
    aria-hidden="true"
  />
);

export const ICON_CHEVRON_RIGHT_8PX = (
  <ChevronRight
    className={`${CHROME_ICON_BASE} size-[8px] md:size-[9px]`}
    aria-hidden="true"
  />
);
/** Alert box link indicator — 12px mobile (≤767px), 14px tablet/desktop (`md+`). */
export const ICON_CHEVRON_RIGHT = (
  <ChevronRight
    className={`${CHROME_ICON_BASE} size-[12px] md:size-[14px]`}
    aria-hidden="true"
  />
);

const PLAY_STROKE_CLASS =
  "[-webkit-text-fill-color:transparent] [-webkit-text-stroke:2px_currentColor]";

/** Poster / modal overlay play (parity with legacy `fa-solid fa-play` at 32px). */
export const ICON_PLAY_OVERLAY_LG = (
  <Play
    className={`${CHROME_ICON_BASE} h-8 w-8`}
    style={{ width: "32px", height: "32px" }}
    aria-hidden="true"
  />
);

/** Stroked play for cover controls that used FA stroke styling. */
export const ICON_PLAY_STROKED_LG = (
  <Play
    className={`${CHROME_ICON_BASE} h-8 w-8 pl-0.5 ${PLAY_STROKE_CLASS} [-webkit-text-stroke:2px_currentColor]`}
    style={{ width: "32px", height: "32px" }}
    aria-hidden="true"
  />
);

/** Media Box rail play control (legacy 12px stroked triangle). */
export const ICON_PLAY_STROKED_SM = (
  <Play
    className={`${CHROME_ICON_BASE} h-3 w-3 pl-0.5 ${PLAY_STROKE_CLASS} [-webkit-text-stroke:1px_currentColor]`}
    style={{ width: "12px", height: "12px" }}
    aria-hidden="true"
  />
);

/** Inline CTA circle-play (legacy `fa-regular fa-circle-play` at 14px). */
export const ICON_PLAY_CIRCLE = (
  <PlayCircle
    className={`${CHROME_ICON_BASE} h-[14px] w-[14px] shrink-0 leading-[17.5px]`}
    aria-hidden="true"
  />
);

/** Circle-play with optional color utility classes (link / button CTAs). */
export const CirclePlayIcon = ({
  className,
}: {
  className?: string;
}): JSX.Element => (
  <PlayCircle
    className={[
      CHROME_ICON_BASE,
      "h-[14px] w-[14px] shrink-0 leading-[17.5px]",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    aria-hidden="true"
  />
);

export const ICON_CALENDAR = (
  <Calendar
    className={`${CHROME_ICON_BASE} w-[1em] h-[1em]`}
    aria-hidden="true"
  />
);

export const ICON_MAP_PIN = (
  <MapPin
    className={`${CHROME_ICON_BASE} w-[1em] h-[1em]`}
    aria-hidden="true"
  />
);

export const ICON_INFO_LIGHTBULB = (
  <Zap
    className={`${CHROME_ICON_BASE} m-0 block p-0 text-ink-primary antialiased`}
    aria-hidden="true"
  />
);

export const ICON_CHECK_CIRCLE = (
  <CheckCircle
    className={`${CHROME_ICON_BASE} m-0 block p-0 text-accent-cyan antialiased`}
    aria-hidden="true"
  />
);

export const ICON_ZOOM_IN = (
  <ZoomIn
    className={`${CHROME_ICON_BASE} w-[1em] h-[1em]`}
    aria-hidden="true"
  />
);

/** Chevron inside thin circular border (link pill buttons). */
export const OutlineCircleChevronIcon = ({
  className,
}: {
  className?: string;
}): JSX.Element => (
  <span
    className="mr-1 inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center self-center rounded-full border border-solid border-current align-middle"
    aria-hidden="true"
  >
    <ChevronDown
      className={className ?? `${CHROME_ICON_BASE} size-[8px] leading-normal`}
    />
  </span>
);

export const isFontAwesomeClassString = (cssClass: string): boolean =>
  /^fa(-\w+)+/.test(cssClass.trim());

const UNSAFE_ICON_CLASS_ATTR = /[<>"']|\bstyle\s*=/i;

/** FA6 + Intralox utility kit prefixes (e.g. `fa-utility-fill fa-semibold fa-phone-volume`). */
const FA_STYLE_PREFIXES = new Set([
  "fa-solid",
  "fa-regular",
  "fa-brands",
  "fa-light",
  "fa-duotone",
  "fa-utility-fill",
  "fa-utility-stroke",
  "fa-utility",
  "fa-semibold",
  "fa-bold",
  "fa-medium",
]);

export function normalizeFontAwesomeClassList(input: string): string {
  const t = input.trim();
  if (!t) return t;

  let s = t;
  const fa5 = /^(fas|far|fab|fal|fad)\s+/i;
  const m = s.match(fa5);
  if (m) {
    const styleMap: Record<string, string> = {
      fas: "fa-solid",
      far: "fa-regular",
      fab: "fa-brands",
      fal: "fa-light",
      fad: "fa-duotone",
    };
    const key = m[1].toLowerCase();
    s = `${styleMap[key] ?? "fa-solid"} ${s.slice(m[0].length)}`.trim();
  }

  if (/^fa\s+fa-/i.test(s)) {
    s = `fa-solid ${s.replace(/^fa\s+/i, "").trim()}`;
  }

  return coerceFaRegularToSolidForFreeGlyphs(s);
}

function coerceFaRegularToSolidForFreeGlyphs(s: string): string {
  return s
    .replace(/\bfa-regular\s+fa-phone\b/gi, "fa-solid fa-phone")
    .replace(/\bfa-regular\s+fa-globe\b/gi, "fa-solid fa-globe")
    .replace(
      /\bfa-regular\s+fa-magnifying-glass\b/gi,
      "fa-solid fa-magnifying-glass",
    )
    .replace(/\bfa-regular\s+fa-xmark\b/gi, "fa-solid fa-xmark")
    .replace(/\bfa-regular\s+fa-search\b/gi, "fa-solid fa-magnifying-glass")
    .replace(/\bfa-regular\s+fa-circle-play\b/gi, "fa-solid fa-circle-play");
}

function extractFaGlyphName(normalized: string): string | null {
  const tokens = normalized.trim().split(/\s+/);
  const glyphTokens = tokens.filter(
    (token) =>
      token.startsWith("fa-") && !FA_STYLE_PREFIXES.has(token.toLowerCase()),
  );
  const glyphToken = glyphTokens.at(-1);
  return glyphToken ? glyphToken.slice(3).toLowerCase() : null;
}

/** FA variant suffixes (e.g. `phone-volume`) → base glyph when only the base is mapped. */
const FA_GLYPH_VARIANT_SUFFIXES = ["-volume"] as const;

function lookupFaGlyphIcon(glyph: string): ChromeSvgIcon | undefined {
  const direct = FA_GLYPH_TO_ICON[glyph];
  if (direct) return direct;

  for (const suffix of FA_GLYPH_VARIANT_SUFFIXES) {
    if (!glyph.endsWith(suffix)) continue;
    const base = glyph.slice(0, -suffix.length);
    const fromBase = FA_GLYPH_TO_ICON[base];
    if (fromBase) return fromBase;
  }

  return undefined;
}

function resolveIconFromNormalizedClasses(
  normalized: string,
  className?: string,
): JSX.Element | null {
  const glyph = extractFaGlyphName(normalized);
  if (!glyph) return null;

  const Icon = lookupFaGlyphIcon(glyph);
  if (!Icon) return null;

  return (
    <Icon
      className={className ?? `${CHROME_ICON_BASE} ${CHROME_ICON_SIZE_EM}`}
      aria-hidden="true"
    />
  );
}

/** FAB icon shell — sized to fill the 48px / 32px circular affordance (was legacy 14px FA). */
export const FAB_ICON_SIZE_CLASS = `${CHROME_ICON_BASE} block h-5 w-5 shrink-0 layout-mobile:h-[18px] layout-mobile:w-[18px] tablet-only:h-[18px] tablet-only:w-[18px] tablet-up:h-6 tablet-up:w-6`;

/** Solid fill for FAB `fa-phone-volume` (library glyph is stroke-based). */
const FAB_PHONE_VOLUME_SOLID_CLASS =
  "fill-current stroke-0 [&_path]:fill-current [&_path]:stroke-0";

const isFaPhoneVolumeClass = (normalized: string): boolean =>
  /\bfa-phone-volume\b/i.test(normalized);

/** Renders intralox SVG for a normalized FA class list (used by FAB when CMS class is resolved). */
export function renderChromeIconFromFaClass(
  cssClass: string | undefined,
  className: string = FAB_ICON_SIZE_CLASS,
): JSX.Element | null {
  const raw = cssClass?.trim() ?? "";
  if (!raw || UNSAFE_ICON_CLASS_ATTR.test(raw)) return null;

  const normalized = normalizeFontAwesomeClassList(raw).trim();
  if (!normalized || UNSAFE_ICON_CLASS_ATTR.test(normalized)) return null;
  if (!isFontAwesomeClassString(normalized)) return null;

  const mergedClassName = isFaPhoneVolumeClass(normalized)
    ? `${className} ${FAB_PHONE_VOLUME_SOLID_CLASS}`.trim()
    : className;

  return resolveIconFromNormalizedClasses(normalized, mergedClassName);
}

export const ChromeIconFromCms = ({
  cssClass,
  className,
}: {
  cssClass?: string;
  className?: string;
}): JSX.Element | null => {
  const raw = cssClass?.trim() ?? "";
  if (!raw) return null;
  if (UNSAFE_ICON_CLASS_ATTR.test(raw)) return null;

  const normalized = normalizeFontAwesomeClassList(raw).trim();
  if (!normalized || UNSAFE_ICON_CLASS_ATTR.test(normalized)) return null;

  if (!isFontAwesomeClassString(normalized)) return null;

  return resolveIconFromNormalizedClasses(normalized, className);
};

/** @deprecated Use {@link ChromeIconFromCms}. */
export const FaIconFromCms = ChromeIconFromCms;

/** @deprecated Use {@link ChromeIconFromCms}. */
export const CmsIcon = ChromeIconFromCms;

/**
 * Renders an icon from a Sitecore CMS icon field value (slug or FA class list).
 * Handles outline-circle chevron badges used on link buttons.
 */
export const ChromeIconFromCmsValue = ({
  cmsValue,
  className,
  style = "solid",
}: {
  cmsValue?: string | null;
  className?: string;
  style?: FontAwesomeStyle;
}): JSX.Element | null => {
  if (!cmsValue || typeof cmsValue !== "string") return null;

  if (cmsIconIsOutlineCircleBadge(cmsValue)) {
    return <OutlineCircleChevronIcon className={className} />;
  }

  const faClass = cmsIconToFontAwesome(cmsValue, style);
  return faClass ? (
    <ChromeIconFromCms cssClass={faClass} className={className} />
  ) : null;
};

export const SocialPlatformIcon = ({
  platform,
}: {
  platform: SocialPlatform;
}): JSX.Element | null => {
  const Icon = SOCIAL_PLATFORM_ICON[platform];
  if (!Icon) return null;

  const iconClass =
    platform === SocialPlatform.YouTube
      ? FOOTER_SOCIAL_YOUTUBE_ICON_CLASS
      : FOOTER_SOCIAL_ICON_CLASS;

  return (
    <Icon className={`${CHROME_ICON_BASE} ${iconClass}`} aria-hidden="true" />
  );
};
