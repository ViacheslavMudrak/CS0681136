import {
  NextImage as ContentSdkImage,
  ImageField,
  Link,
  LinkField,
} from "@sitecore-content-sdk/nextjs";
import ChevronRightIcon from "components/shared/icons/ChevronRightIcon";
import React from "react";
import { FEATURED_CONTENT_VARIANTS } from "src/helpers/enums";
import { cn } from "@/lib/utils";

interface FeaturedContentCardProps {
  icon: ImageField;
  iconAlt: string;
  title: React.ReactNode;
  description: React.ReactNode;
  arrowIcon?: React.ReactNode;
  variant?:
    | FEATURED_CONTENT_VARIANTS.DEFAULT
    | FEATURED_CONTENT_VARIANTS.LOBBY_EXPERIENCE
    | FEATURED_CONTENT_VARIANTS.NO_CARD;
  link: LinkField;
  isSitecoreEditMode: boolean;
}

const FeaturedContentCard: React.FC<FeaturedContentCardProps> = ({
  icon,
  iconAlt,
  title,
  description,
  variant = FEATURED_CONTENT_VARIANTS.DEFAULT,
  link,
  isSitecoreEditMode,
}) => {
  const iconValue = icon?.value;
  const baseId = React.useId();
  const descriptionId = `${baseId}-description`;
  const titleId = `${baseId}-title`;
  const isLobby = variant === FEATURED_CONTENT_VARIANTS.LOBBY_EXPERIENCE;

  return (
    <article
      className="relative inline-flex w-full items-center justify-start gap-5 rounded-[8px] border border-[rgba(147,160,198,0.1)] bg-[rgba(7,5,48,0.05)] px-3 py-3.5 backdrop-blur-sm backdrop-filter md:p-5"
      role="listitem"
    >
      <div className="relative flex size-[38px] shrink-0 items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="flex size-full items-center justify-center rounded-[23.75px] border-[1.188px] border-[rgba(71,158,188,0.19)] bg-[rgba(71,158,188,0.08)] [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_picture]:block [&_picture]:h-auto [&_picture]:max-w-full">
            {iconValue?.src ? (
              <ContentSdkImage
                field={icon}
                loading="lazy"
                width={iconValue.width ? Number(iconValue.width) : undefined}
                height={iconValue.height ? Number(iconValue.height) : undefined}
                alt={iconAlt || ""}
                aria-label={iconAlt || undefined}
              />
            ) : null}
          </div>
        </div>
      </div>
      <div className="inline-flex min-h-0 min-w-0 flex-1 flex-col items-start justify-start gap-2">
        <a
          href={link.value.href}
          target={link.value.target}
          className="inline-flex items-center no-underline hover:text-[var(--color-action-primary)] text-[var(--color-action-primary)] self-stretch"
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
        >
          <div className="flex items-start justify-start">
            <div
              id={titleId}
              className={cn(
                "flex-1 whitespace-pre-wrap font-medium leading-normal tracking-[-0.08px] [&_p]:m-0",
                isLobby
                  ? "text-[14px] font-[500] leading-[100%] text-[#00287B] hover:text-[#00287B] md:text-[15px]"
                  : "text-[var(--color-action-link)]"
              )}
            >
              {title}
            </div>
          </div>
          <div
            className={cn(
              "relative ms-3 flex size-4 shrink-0 items-center justify-center overflow-hidden",
              isLobby
                ? "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-[#00287B]"
                : "[&_svg]:size-full [&_svg]:text-[#49B7F6]"
            )}
            aria-hidden="true"
          >
            <ChevronRightIcon decorative={true} />
          </div>
          {isSitecoreEditMode && (
            <Link field={link} className="text-xs text-blue-500 underline" editable={true}>
              Edit Link
            </Link>
          )}
        </a>

        <div className="inline-flex items-center justify-start self-stretch leading-[1.25]">
          <div
            id={descriptionId}
            className={cn(
              "justify-start self-stretch font-normal [&_p]:m-0",
              isLobby
                ? "whitespace-pre-wrap text-[12px] font-[400] leading-[1.25] text-[#222222] md:text-[14px] md:leading-[1.38] [&_span]:text-[#646467]"
                : "text-[15px] leading-[22px] md:text-[14px] md:font-[400] md:leading-[1.38] [&_span]:text-white"
            )}
          >
            {description}
          </div>
        </div>
      </div>
    </article>
  );
};

export default FeaturedContentCard;
