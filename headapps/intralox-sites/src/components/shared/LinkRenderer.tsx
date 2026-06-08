"use client";

import { Link as SitecoreLink, useSitecore } from "@sitecore-content-sdk/nextjs";

import {
  CHROME_ICON_BASE,
  CHROME_ICON_SIZE_EM,
  ChromeIconFromCmsValue,
} from "lib/chrome-icons";
import { cn } from "lib/utils";
import { ILinkFields } from "src/utils/interface";

import UiLink from "components/ui/Link";
import {
  linkFieldHref,
  linkFieldRel,
  normalizeLinkRendererTheme,
} from "components/shared/linkCtaChrome";
import { ctaButtonClasses } from "components/ui/ctaVariants";

export type AllignmentType = "left" | "right" | "center";
export interface LinkRendererProps {
  links: ILinkFields[];
  className?: string;
  isLinkable?: boolean;
  alt?: string;
  alignment?: AllignmentType;
  contrast?: boolean;
  /** When omitted, uses `useSitecore().page.mode.isEditing`. */
  isEditing?: boolean;
}

/** CMS may use title case (e.g. "Before Label"); compare case-insensitively. */
function isIconBeforeLabel(iconPosition: string | undefined): boolean {
  return iconPosition?.trim().toLowerCase() === "before label";
}

function isIconAfterLabel(iconPosition: string | undefined): boolean {
  return iconPosition?.trim().toLowerCase() === "after label";
}

function LinkRendererButtonIconGlyph({
  iconRaw,
}: {
  iconRaw: string | undefined;
}) {
  const icon = iconRaw ? (
    <ChromeIconFromCmsValue
      cmsValue={iconRaw}
      className={`${CHROME_ICON_BASE} ${CHROME_ICON_SIZE_EM} `}
    />
  ) : null;
  return icon;
}

const LinkRenderer = ({
  links,
  className,
  alt,
  alignment = "center",
  contrast = true,
  isEditing: isEditingProp,
}: LinkRendererProps) => {
  const { page } = useSitecore();
  const isEditing = isEditingProp ?? page?.mode?.isEditing ?? false;

  let justify = "justify-center";

  switch (alignment) {
    case "left":
      justify = "justify-start";
      break;
    case "right":
      justify = "justify-end";
      break;
    case "center":
    default:
      justify = "justify-center";
      break;
  }

  const isCentered = alignment === "center";
  return (
    <div
      className={cn(
        "flex divide-x",
        isCentered && "flex-col md:flex-row md:divide-x",
        contrast ? "divide-ink-inverse/60" : "divide-stroke-default",
        justify,
        className,
      )}
    >
      {links &&
        links.length > 0 &&
        links.map((link, index) => {
          const iconRaw =
            typeof link.fields.Icon?.fields?.Value?.value === "string"
              ? link.fields.Icon.fields.Value.value
              : undefined;
          const hasIcon = Boolean(iconRaw?.trim());
          const iconPosition = link.fields.IconPosition?.fields?.Value?.value;
          const colorscheme = link.fields.Colorscheme?.fields?.Value?.value;
          const buttonTheme = normalizeLinkRendererTheme(colorscheme);
          const linkField = link.fields.Link;
          const href = linkFieldHref(linkField);
          const target = linkField?.value?.target;
          const rel = linkFieldRel(target);
          const ariaLabel = alt ?? linkField?.value?.text;
          const style = link.fields.Style.fields.Value.value;

          const renderButtonStyleLink = () => {
            const content = (
              <>
                {isIconBeforeLabel(iconPosition) && hasIcon && (
                  <LinkRendererButtonIconGlyph iconRaw={iconRaw} />
                )}
                {linkField?.value?.text}
                {isIconAfterLabel(iconPosition) && hasIcon && (
                  <LinkRendererButtonIconGlyph iconRaw={iconRaw} />
                )}
              </>
            );

            if (isEditing) {
              return (
                <SitecoreLink
                  field={linkField}
                  className={cn(
                    ctaButtonClasses({
                      buttonType: "pill",
                      buttonTheme,
                      contrast,
                    }),
                    "items-center",
                    hasIcon && "pr-3.5",
                  )}
                  aria-label={ariaLabel}
                  tabIndex={0}
                >
                  {content}
                </SitecoreLink>
              );
            }

            return (
              <UiLink
                href={href ?? "#"}
                target={target}
                rel={rel}
                buttonType="pill"
                buttonTheme={buttonTheme}
                contrast={contrast}
                className={cn(
                  ctaButtonClasses({
                    buttonType: "pill",
                    buttonTheme,
                    contrast,
                  }),
                  "items-center",
                  hasIcon && "pr-3.5",
                )}
                aria-label={ariaLabel}
              >
                {content}
              </UiLink>
            );
          };

          const renderTextStyleLink = (moreStyle: boolean) => {
            const content = (
              <>
                {moreStyle && isIconBeforeLabel(iconPosition) && hasIcon && (
                  <span style={{ width: "1em", marginLeft: "-1em" }}>
                    <ChromeIconFromCmsValue cmsValue={iconRaw} />
                  </span>
                )}
                {linkField?.value?.text}
                {moreStyle && isIconAfterLabel(iconPosition) && hasIcon && (
                  <span style={{ width: "1em", marginRight: "-1em" }}>
                    <ChromeIconFromCmsValue cmsValue={iconRaw} />
                  </span>
                )}
              </>
            );

            if (isEditing) {
              return (
                <SitecoreLink
                  field={linkField}
                  className={cn(
                    "font-normal transition-colors no-underline hover:underline focus:outline-none focus:ring",
                    contrast
                      ? "text-ink-inverse hover:text-chrome-chevron"
                      : "text-action-link hover:text-action",
                  )}
                  aria-label={ariaLabel}
                >
                  {content}
                </SitecoreLink>
              );
            }

            return (
              <UiLink
                href={href ?? "#"}
                target={target}
                rel={rel}
                className={cn(
                  "font-normal transition-colors no-underline hover:underline focus:outline-none focus:ring",
                  contrast
                    ? "text-ink-inverse hover:text-chrome-chevron"
                    : "text-action-link hover:text-action",
                )}
                aria-label={ariaLabel}
              >
                {content}
              </UiLink>
            );
          };

          return (
            <div
              key={
                link.fields.Link?.value?.href ??
                link.fields.Link?.value?.text ??
                index
              }
              className={cn(
                "flex justify-center items-center text-base",
                isCentered ? "mt-5 first:mt-0 md:mt-0 md:px-5" : "px-5",
                alignment === "left" && "first:pl-0",
                alignment === "right" && "last:pr-0",
              )}
            >
              {style === "Button"
                ? renderButtonStyleLink()
                : style === "More"
                  ? renderTextStyleLink(true)
                  : renderTextStyleLink(false)}
            </div>
          );
        })}
    </div>
  );
};

export default LinkRenderer;
