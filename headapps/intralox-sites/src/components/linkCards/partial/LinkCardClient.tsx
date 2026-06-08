"use client";

import { IParams } from "src/utils/interface";
import { ILinkCardsFields } from "../LinkCards.type";
import { Container, ContainerWidth } from "../../shared/BaseContainer";
import { Link, RichText } from "@sitecore-content-sdk/nextjs";
import { cx } from "@laitram-l-l-c/intralox-ui-components";
import { ImageView } from "../../shared/ImageView/ImageView";
import { ChevronRight } from "@laitram-l-l-c/intralox-icon-library";
import { CHROME_ICON_BASE } from "lib/chrome-icons";
import { FocalPointType } from "../../shared/ImageView/ImageViewTypes";
import { useEffect, useState } from "react";
import { useWindowSize } from "src/hooks/useWindowSize";
import LinkView from "components/callToAction/partial/LinkVIew";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import { Section } from "components/shared/section/Section";
interface LinkCardsProps extends IParams {
  fields: ILinkCardsFields;
  size?: "compact" | "base" | "standalone";
  className?: string;
  linkCardColorScheme?: "light" | "dark";
  headingWidth?: string;
  headingSize?: string;
  headingAlgin?: string;
  containerWidth?: string;
}
const LinkCardClientBase = ({
  fields,
  params,
  size = "base",
  linkCardColorScheme = "light",
  headingSize,
  headingAlgin,
  headingWidth,
  containerWidth,
}: LinkCardsProps) => {
  const anchorId = renderingAnchorIdProps(params?.RenderingIdentifier);
  const [isMobile, setIsMobile] = useState(false);
  const { width } = useWindowSize();
  const columns = fields.TileCount?.fields?.Value?.value;
  const isTopLevel = fields?.Headline?.value || fields?.Description?.value;

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    setIsMobile(window.matchMedia("(max-width: 767px)").matches);
  }, [width]);
  return (
    <Section
      className="link-card w-full max-w-full relative py-12 lg:py-16 [&_+_.search-belt-finder]:-mt-8 [&_+_.search-belt-finder]:md:-mt-16"
      {...anchorId}
      backgroundColor={linkCardColorScheme === "dark" ? "gray" : "white"}
    >
      <Container width={containerWidth as ContainerWidth}>
        <div
          className={cx("w-full", {
            "mb-4 md:mb-6": isTopLevel,
            "mb-8 md:mb-8": isTopLevel && size === `standalone`,
          })}
        >
          <RichText
            className={cx(
              "font-bold w-full text-ink-primary leading-tight mx-auto text-3xl ",
              {
                "text-3xl leading-tight": headingSize === `3xl`,
                "text-2xl leading-tight": headingSize === `2xl`,
                "text-xl": headingSize === `xl`,
                "text-lg": headingSize === `lg`,
                "text-base": headingSize === `base`,
                "text-center": headingAlgin === `center`,
                "md:w-4/5": headingWidth === `4/5`,
                "md:w-3/4": headingWidth === `3/4`,
                "md:w-2/3": headingWidth === `2/3`,
                "md:w-2/3 xl:w-1/2": headingWidth === `1/2`,
              },
            )}
            field={fields.Headline}
            tag="h2"
          />
          <RichText
            className={cx("text-ink-secondary mt-2", {
              "text-center": headingAlgin === `center`,
            })}
            field={fields.Description}
          />
        </div>
        <div
          className={cx("flex flex-wrap -ml-4 -mt-4 md:-ml-6 md:-mt-6", {
            "justify-center ": size === `compact`,
            "-mt-8 md:-mt-8": size === `standalone`,
          })}
        >
          {(fields.Cards ?? []).map((card, index) => {
            const isClickable = card.fields?.Link?.value?.href;
            const analyticsTitle = card.fields?.Link?.value?.text;
            const linkTo = card.fields?.Link?.value?.href;
            const cardColor =
              card.fields?.ColorScheme?.fields?.Value?.value?.toLocaleLowerCase();
            return (
              <div
                key={index}
                className={cx(
                  size === "standalone"
                    ? "w-full mt-8"
                    : cx(
                        {
                          2: "w-full sm:w-1/2",
                          3: "w-full sm:w-1/2 lg:w-1/3",
                          4: "w-full sm:w-1/2 lg:w-1/4",
                          5: "w-1/2 md:w-1/5",
                        }[columns ? columns : size === "compact" ? 5 : 3] ??
                          "w-full sm:w-1/2 lg:w-1/3",
                        "mt-4 md:mt-6",
                      ),
                  "pl-4 md:pl-6 flex items-stretch",
                )}
              >
                <LinkView
                  link={card.fields?.Link}
                  data-analytics-title={
                    analyticsTitle ? analyticsTitle : linkTo
                  }
                  isTile={true}
                  className={cx(
                    `w-full no-underline! transition-shadow duration-150 group border border-stroke-default overflow-hidden focus:outline-none focus:ring`,
                    {
                      "bg-surface": cardColor === "light" || !cardColor,
                      "bg-chrome-bar": cardColor === "dark",
                      "flex flex-col": size === `compact` || size === `base`,
                      "text-center rounded py-4 px-4": size === `compact`,
                      "hover:shadow-md": isClickable && size === `compact`,
                      "transition-shadow duration-150": isClickable,
                      "text-left rounded-lg": size === `base`,
                      "shadow-md hover:shadow-lg":
                        size === `base` || size === `standalone`,
                      "text-left flex flex-wrap sm:flex-nowrap rounded-lg w-full":
                        size === `standalone`,
                      "[&_>_div]:p-0": size === `base` || size === `compact`,
                    },
                  )}
                >
                  <figure
                    className={cx({
                      "min-h-1px": size === `compact` || size === `base`,
                      "w-24 max-w-full mx-auto": size === `compact`,
                      "block w-full": size === `base`,
                      "relative sm:w-56 w-full self-stretch sm:shrink-0":
                        size === `standalone`,
                    })}
                  >
                    <ImageView
                      image={card.fields?.Image}
                      focalPoint={
                        card.fields?.FocalPoint?.fields?.Value
                          ?.value as FocalPointType
                      }
                      objectFit={
                        !isMobile
                          ? size === "standalone"
                            ? "cover"
                            : undefined
                          : undefined
                      }
                      className={`${!isMobile ? (size === "standalone" ? "pb-0" : "!pb-[52.5%]") : ""}`}
                    />
                  </figure>
                  <div
                    className={cx(`space-y-1`, {
                      "flex flex-col flex-auto":
                        size === `compact` || size === `base`,
                      "px-4 pb-6 pt-4": size === `base`,
                      "pt-2": size === `compact`,
                      "p-4 pb-5 sm:p-6": size === `standalone`,
                    })}
                  >
                    <div
                      className={cx({
                        "text-ink-primary": cardColor === "light" || !cardColor,
                        "group-hover:text-ink-secondary":
                          isClickable && (cardColor === "light" || !cardColor),
                      })}
                    >
                      <RichText
                        tag="h2"
                        className={cx({
                          "my-0": size === `base`,
                          inline: isClickable,
                          "text-ink-primary":
                            cardColor === "light" || !cardColor,
                          "group-hover:text-ink-secondary":
                            isClickable &&
                            (cardColor === "light" || !cardColor),
                          "group-hover:text-chrome-chevron":
                            isClickable && cardColor === "dark",
                          "text-lg": size === `base`,
                          "text-sm sm:text-lg": size === `standalone`,
                          "text-sm font-bold text-ink-primary leading-snug":
                            size === `compact`,
                          "font-bold leading-snug duration-150 transition-colors":
                            size === `base` || size === `standalone`,
                          "text-ink-inverse": cardColor === "dark",
                        })}
                        field={card.fields?.Heading}
                      />

                      {isClickable &&
                      (size === `base` || size === `standalone`) ? (
                        <span
                          className={cx("inline-flex relative top-[3px]", {
                            "text-ink-inverse group-hover:text-chrome-chevron":
                              cardColor === "dark",
                          })}
                        >
                          <ChevronRight
                            className={`${CHROME_ICON_BASE} size-4.5`}
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </div>
                    <RichText
                      field={card.fields?.Description}
                      className={cx(
                        {
                          "text-ink-secondary":
                            cardColor === "light" || !cardColor,
                          "text-ink-inverse": cardColor === "dark",
                          "text-xs": size === `compact`,
                          "text-sm": size === `base`,
                          "text-sm sm:text-base": size === `standalone`,
                        },
                        "leading-snug",
                      )}
                    />
                  </div>
                </LinkView>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};

export const LinkCardClient = LinkCardClientBase;
