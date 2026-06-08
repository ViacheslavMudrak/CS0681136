"use client";

import { JSX, useEffect, useState } from "react";
import { IParams } from "src/utils/interface";
import { ILinkGridFields } from "../LinkGrid.type";
import { Section } from "components/shared/section/Section";
import { Container } from "components/shared/BaseContainer";
import { cn } from "lib/utils";

import { LinkGridCard } from "./LinkGridCard";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import { useWindowSize } from "src/hooks/useWindowSize";
import { RichText } from "@sitecore-content-sdk/nextjs";

interface ILinkGridClientProps extends IParams {
  fields: ILinkGridFields;
  size?: "compact" | "base" | "standalone";
  linkCardColorScheme?: "light" | "dark";
}

const LinkGridClientBase = ({
  fields,
  params,
  size = "base",
  linkCardColorScheme = "light",
}: ILinkGridClientProps): JSX.Element => {
  const [isMobile, setIsMobile] = useState(false);
  const { width } = useWindowSize();
  const columns = fields?.ItemCount?.Value;
  const isTopLevel =
    fields?.Headline?.value ||
    fields?.Description?.value ||
    fields?.Eyebrow?.value;
  const hasSubIndustries = fields?.ContentItems?.value?.some(
    (item) => item?.SubIndustries?.length > 0,
  );

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
      {...renderingAnchorIdProps(params.RenderingIdentifier)}
      backgroundColor={hasSubIndustries ? "gray" : "white"}
      className="link-grid"
    >
      <Container width={hasSubIndustries ? "lg" : "default"}>
        <div
          className={cn("w-full", {
            "mb-4 md:mb-6": isTopLevel,
            "mb-8 md:mb-8": isTopLevel && size === `standalone`,
            "mb-6 md:mb-12":
              isTopLevel && hasSubIndustries && size === `standalone`,
          })}
        >
          <RichText
            field={fields.Eyebrow}
            className="uppercase tracking-wide font-bold block text-ink-secondary text-sm/tight mb-[0.5em]"
          />
          <RichText
            className={cn(
              "font-bold text-ink-primary text-3xl leading-tight !my-0 text-center",
              {
                "text-left text-2xl": hasSubIndustries && size === `standalone`,
              },
            )}
            field={fields.Headline}
            tag="h2"
          />
          <RichText
            className={cn("text-ink-secondary mt-2 text-center", {
              "text-left font-bold text-2xl leading-tight":
                hasSubIndustries && size === `standalone`,
            })}
            field={fields.Description}
          />
        </div>

        <div
          className={cn("flex flex-wrap -ml-4 -mt-4 md:-ml-6 md:-mt-6", {
            "justify-center": size === `compact`,
            "-mt-8 md:-mt-8": size === `standalone`,
            "-mt-6 md:-mt-12": hasSubIndustries && size === `standalone`,
          })}
          role="list"
        >
          {fields?.ContentItems?.value?.map((link, index) => (
            <div
              key={index}
              className={cn(
                "pl-4 md:pl-6 flex items-stretch",
                size === "standalone" && "w-full",
                size === "standalone" && hasSubIndustries && "mt-6 md:mt-12",
                size === "standalone" && !hasSubIndustries && "mt-8",
                size !== "standalone" &&
                  ({
                    2: "w-full sm:w-1/2",
                    3: "w-full sm:w-1/2 lg:w-1/3",
                    4: "w-full sm:w-1/2 lg:w-1/4",
                    5: "w-1/2 md:w-1/5",
                  }[columns ? columns : 3] ??
                    "w-full sm:w-1/2 lg:w-1/3"),
                size !== "standalone" && "mt-4 md:mt-6",
              )}
              role="listitem"
            >
              <LinkGridCard
                item={link}
                size={size}
                linkCardColorScheme={linkCardColorScheme}
                isMobile={isMobile}
                hasSubIndustries={hasSubIndustries}
              />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export const LinkGridClient = LinkGridClientBase;
