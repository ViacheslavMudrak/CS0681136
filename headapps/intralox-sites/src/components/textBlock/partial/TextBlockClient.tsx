"use client";
import { JSX } from "react";
import { IParams } from "src/utils/interface";
import { ITextBlockFields } from "../TextBlock.type";
import { RichText, useSitecore } from "@sitecore-content-sdk/nextjs";
import BodyStyles from "components/shared/BodyStyle";
import { cn } from "lib/utils";
import { getTextParams } from "src/utils/paramsData";
import LinkView from "components/callToAction/partial/LinkVIew";
import { linkFieldHref } from "components/shared/linkCtaChrome";

interface ITextBlockClientProps extends IParams {
  fields: ITextBlockFields;
}

const TextBlockClientBase = ({
  fields,
  params,
}: ITextBlockClientProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing ?? false;
  const colorScheme = params?.ColorScheme?.Value?.value?.toLowerCase();
  const text = getTextParams(params);
  const textStyle = params?.TextStyle?.Value?.value?.toLowerCase();
  const theme = params?.Theme?.Value?.value?.toLowerCase();
  const headingSize = params.HeadlineSize?.Value?.value?.toLowerCase();
  const showLink = Boolean(linkFieldHref(fields.Link)) || isEditing;

  return (
    <BodyStyles
      colorScheme={colorScheme}
      theme={theme}
      textSize={theme ? "xl" : undefined}
      className={cn("normal text-left mx-auto", {
        "text-center": text?.textAlignment === "center",
        "text-ink-subtle text-sm": textStyle === "muted",
        "font-bold": textStyle === "bold",
        "md:w-4/5": text?.width === `80`,
        "md:w-3/4": text?.width === `75`,
        "md:w-2/3": text?.width === `66`,
        "md:w-3/5": text?.width === `60`,
        "md:w-3/5 xl:w-1/2": text?.width === `50`,
      })}
    >
      <RichText
        field={fields.Eyebrow}
        className={cn(
          "uppercase tracking-wide text-ink-secondary font-bold block text-sm/tight mb-[0.5em]",
          {
            "border-0 border-l-4 border-solid px-2":
              text?.textAlignment !== `center`,
            "border-orange":
              text?.textAlignment !== `center` && colorScheme === "dark",
            "border-cyan":
              text?.textAlignment !== `center` && colorScheme !== "dark",
          },
        )}
        tag="p"
      />
      <RichText
        field={fields.Title}
        tag="h2"
        className={cn(
          " mt-0! mb-4 text-2xl leading-tight text-left text-ink-primary",
          {
            "text-3xl leading-tight": headingSize === `3xl`,
            "text-2xl leading-tight": headingSize === `2xl`,
            "text-xl": headingSize === `xl`,
            "text-lg": headingSize === `lg`,
            "text-base": headingSize === `base`,
            "!text-center": text?.textAlignment === "center",
          },
        )}
      />
      <RichText
        field={fields.Description}
        className={cn(
          " prose",
          theme ? "text-gray-700" : "text-gray-900",
          text?.textAlignment === "center" ? "!text-center" : "text-left",
        )}
      />
      {showLink ? (
        <LinkView className="mt-4" link={fields.Link} buttonType="pill">
          {fields?.Link?.value?.text}
        </LinkView>
      ) : null}
    </BodyStyles>
  );
};

export const TextBlockClient = TextBlockClientBase;
