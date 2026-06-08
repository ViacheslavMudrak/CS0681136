"use client";

import { JSX } from "react";
import { RichText } from "@sitecore-content-sdk/nextjs";
import { CHROME_ICON_BASE } from "lib/chrome-icons";
import { ChevronRight } from "@laitram-l-l-c/intralox-icon-library";
import { cn } from "lib/utils";

import type { IServiceListingsFields } from "../LinkGrid.type";
import { ImageView } from "components/shared/ImageView/ImageView";
import LinkView from "components/callToAction/partial/LinkVIew";

/** True when the listing should render as an anchor (non-empty URL after trim). */
export function isLinkGridListingClickable(
  linkUrl: string | undefined,
): boolean {
  return Boolean(linkUrl?.trim());
}

export interface LinkGridCardProps {
  item: IServiceListingsFields;
  size?: "compact" | "base" | "standalone";
  linkCardColorScheme?: "light" | "dark";
  isMobile?: boolean;
  hasSubIndustries?: boolean;
}

/**
 * Single link-grid tile: image, title, description; wraps in Sitecore Link when URL is set, else article.
 */
export function LinkGridCard({
  item,
  size,
  linkCardColorScheme,
  isMobile,
  hasSubIndustries,
}: LinkGridCardProps): JSX.Element {
  const isClickable = isLinkGridListingClickable(item.LinkURL);
  const isSubIndustries = Boolean(hasSubIndustries && size === `standalone`);

  const cardBody = (
    <>
      <figure
        className={cn({
          "min-h-1px": size === `compact` || size === `base`,
          "w-24 max-w-full mx-auto": size === `compact`,
          "block w-full": size === `base`,
          "relative sm:w-56 w-full self-stretch sm:shrink-0":
            size === `standalone`,
          "md:w-2/3": isSubIndustries,
        })}
      >
        {item?.Image && (
          <ImageView
            image={{
              value: {
                src: item.Image,
                alt: item.Title,
                width: size === `standalone` && isSubIndustries ? 780 : 568,
                height: size === `standalone` && isSubIndustries ? 439 : 298,
              },
            }}
            objectFit={
              !isMobile
                ? size === `standalone`
                  ? "cover"
                  : undefined
                : undefined
            }
            imageClass={
              size === `standalone` && isSubIndustries && !isMobile
                ? "relative"
                : ""
            }
          />
        )}
      </figure>
      <div
        className={cn("space-y-1", {
          "flex flex-col flex-auto": size === `compact` || size === `base`,
          "px-4 pb-6 pt-4": size === `base`,
          "pt-2": size === `compact`,
          "p-4 pb-5 sm:p-6": size === `standalone`,
          "p-4 md:p-10 w-full md:w-1/3 ": isSubIndustries,
        })}
      >
        {isSubIndustries ? (
          <LinkView
            link={{ value: { href: item.LinkURL as string } }}
            data-analytics-title={item.Title}
            className="!no-underline group/title-link inline-block mb-0"
          >
            <div
              className={cn({
                "text-ink-primary":
                  linkCardColorScheme === "light" || !linkCardColorScheme,
                "group-hover:text-ink-secondary":
                  isClickable &&
                  (linkCardColorScheme === "light" || !linkCardColorScheme),
              })}
            >
              <RichText
                field={{ value: item?.Title?.trim() }}
                tag="h2"
                className={cn({
                  inline: isClickable,
                  "text-ink-primary":
                    linkCardColorScheme === "light" || !linkCardColorScheme,
                  "text-sm sm:text-lg": size === `standalone`,
                  "font-bold leading-snug duration-150 transition-colors":
                    size === `standalone`,
                  "text-ink-inverse": linkCardColorScheme === "dark",
                  "text-xl sm:text-xl leading-snug md:tracking-[-0.4px]":
                    hasSubIndustries,
                })}
              />
              {isClickable && size === `standalone` ? (
                <span
                  className={cn("inline-flex item-center", {
                    "text-ink-inverse": linkCardColorScheme === "dark",
                    "group-hover:text-ink-primary":
                      isSubIndustries && linkCardColorScheme === "light",
                    "group-hover:text-ink-inverse":
                      isSubIndustries && linkCardColorScheme === "dark",
                  })}
                >
                  <ChevronRight
                    className={`${CHROME_ICON_BASE} size-[13px] md:size-[0.875rem]`}
                    aria-hidden="true"
                  />
                </span>
              ) : null}
            </div>
          </LinkView>
        ) : (
          <div
            className={cn({
              "text-ink-primary":
                linkCardColorScheme === "light" || !linkCardColorScheme,
              "group-hover:text-ink-secondary":
                isClickable &&
                (linkCardColorScheme === "light" || !linkCardColorScheme),
            })}
          >
            <RichText
              field={{ value: item.Title }}
              tag="h2"
              className={cn({
                "my-0": size === `base`,
                inline: isClickable,
                "text-ink-primary":
                  linkCardColorScheme === "light" || !linkCardColorScheme,
                "group-hover:text-ink-secondary":
                  isClickable &&
                  (linkCardColorScheme === "light" || !linkCardColorScheme),
                "group-hover:text-chrome-chevron":
                  isClickable && linkCardColorScheme === "dark",
                "text-lg": size === `base`,
                "text-sm sm:text-lg": size === `standalone`,
                "text-sm font-bold text-ink-primary leading-snug":
                  size === `compact`,
                "font-bold leading-snug duration-150 transition-colors":
                  size === `base` || size === `standalone`,
                "text-ink-inverse": linkCardColorScheme === "dark",
                "group-hover:text-ink-primary":
                  isSubIndustries && linkCardColorScheme === "light",
                "group-hover:text-ink-inverse":
                  isSubIndustries && linkCardColorScheme === "dark",
              })}
            />
            {isClickable && (size === `base` || size === `standalone`) ? (
              <span
                className={cn("inline-block h-[14px]", {
                  "text-ink-inverse group-hover:text-chrome-chevron":
                    linkCardColorScheme === "dark",
                  "group-hover:text-ink-primary":
                    isSubIndustries && linkCardColorScheme === "light",
                  "group-hover:text-ink-inverse":
                    isSubIndustries && linkCardColorScheme === "dark",
                })}
              >
                <ChevronRight
                  className={`${CHROME_ICON_BASE} size-5`}
                  aria-hidden="true"
                />
              </span>
            ) : null}
          </div>
        )}
        <RichText
          className={cn("leading-snug", {
            "text-ink-secondary":
              linkCardColorScheme === "light" || !linkCardColorScheme,
            "text-ink-inverse": linkCardColorScheme === "dark",
            "text-xs": size === `compact`,
            "text-sm": size === `base`,
            "text-sm sm:text-base": size === `standalone`,
            "text-base leading-normal m-0 mt-0 md:mt-2": isSubIndustries,
          })}
          field={{ value: item.Description }}
        />
        {item?.SubIndustries?.length > 0 && (
          <>
            <hr className="block border-t border-stroke-default my-4 md:my-8"></hr>
            <ul className="!ml-0 w-full !p-0">
              {item.SubIndustries.map((subIndustry, index) => (
                <li
                  key={index}
                  className="block text-base leading-normal mt-1 !ml-0 w-full"
                >
                  {subIndustry.Title && subIndustry.Url && (
                    <LinkView
                      link={{ value: { href: subIndustry.Url } }}
                      className={cn(
                        "!no-underline pointer-events-auto",
                        linkCardColorScheme === "dark"
                          ? "text-ink-inverse hover:text-ink-inverse"
                          : "text-action-link hover:text-action-link",
                        "focus:ring-0 focus-visible:ring-1 focus-visible:shadow-none focus-visible:ring-stroke-default focus-visible:ring-offset-2",
                      )}
                    >
                      {subIndustry.Title}
                      {subIndustry.Url && (
                        <span
                          className={cn(
                            "inline-block h-[14px] text-action-link",
                            {
                              "text-ink-inverse ":
                                linkCardColorScheme === "dark",
                            },
                          )}
                        >
                          <ChevronRight
                            className={`${CHROME_ICON_BASE} size-5`}
                            aria-hidden="true"
                          />
                        </span>
                      )}
                    </LinkView>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );

  if (isSubIndustries) {
    return (
      <div
        className={cn(
          "w-full no-underline! group border border-stroke-default transition-shadow duration-150 overflow-hidden focus:outline-none focus:ring",
          {
            "bg-surface":
              linkCardColorScheme === "light" || !linkCardColorScheme,
            "bg-chrome-bar": linkCardColorScheme === "dark",
            "flex flex-col": size === "compact" || size === "base",
            "text-center rounded py-4 px-4": size === "compact",
            "hover:shadow-md": isClickable && size === "compact",
            "transition-shadow duration-150": isClickable,
            "text-left rounded-lg": size === "base",
            "shadow-md hover:shadow-lg":
              size === "base" || size === "standalone",
            "text-left flex flex-wrap sm:flex-nowrap rounded-lg w-full":
              size === "standalone",
            "md:flex-row-reverse hover:shadow-md rounded-2xl": isSubIndustries,
          },
        )}
      >
        {cardBody}
      </div>
    );
  }

  if (isClickable) {
    return (
      <LinkView
        link={{ value: { href: item.LinkURL as string } }}
        isTile
        data-analytics-title={item.Title}
        className={cn(
          "w-full no-underline! group border border-stroke-default transition-shadow duration-150 overflow-hidden focus:outline-none focus:ring",
          {
            "bg-surface":
              linkCardColorScheme === "light" || !linkCardColorScheme,
            "bg-chrome-bar": linkCardColorScheme === "dark",
            "flex flex-col": size === "compact" || size === "base",
            "text-center rounded py-4 px-4": size === "compact",
            "hover:shadow-md": isClickable && size === "compact",
            "transition-shadow duration-150": isClickable,
            "text-left rounded-lg": size === "base",
            "shadow-md hover:shadow-lg":
              size === "base" || size === "standalone",
            "text-left flex flex-wrap sm:flex-nowrap rounded-lg w-full ":
              size === "standalone",
            "md:flex-row-reverse hover:shadow-md rounded-2xl": isSubIndustries,
            "[&_>_div]:p-0": size === `base` || size === `compact`,
          },
        )}
      >
        {cardBody}
      </LinkView>
    );
  }

  return (
    <article
      className={cn(
        "w-full no-underline! group border border-stroke-default transition-shadow duration-150 overflow-hidden focus:outline-none focus:ring",
        {
          "bg-surface": linkCardColorScheme === "light" || !linkCardColorScheme,
          "bg-chrome-bar": linkCardColorScheme === "dark",
          "flex flex-col": size === "compact" || size === "base",
          "text-center rounded py-4 px-4": size === "compact",
          "hover:shadow-md": isClickable && size === "compact",
          "transition-shadow duration-150": isClickable,
          "text-left rounded-lg": size === "base",
          "shadow-md hover:shadow-lg": size === "base" || size === "standalone",
          "text-left flex flex-wrap sm:flex-nowrap rounded-lg w-full":
            size === "standalone",
          "md:flex-row-reverse hover:shadow-md rounded-2xl": isSubIndustries,
          "[&_>_div]:p-0": size === `base` || size === `compact`,
        },
      )}
    >
      {cardBody}
    </article>
  );
}
