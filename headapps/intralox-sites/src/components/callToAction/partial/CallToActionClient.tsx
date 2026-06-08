"use client";
import { ICallToActionFields } from "../CallToAction.type";
import { IParams } from "src/utils/interface";
import { JSX } from "react";
import { RichText } from "@sitecore-content-sdk/nextjs";
import { cn } from "lib/utils";
import LinkView from "./LinkVIew";
import { ImageView } from "components/shared/ImageView/ImageView";

/** Served from `public/` so Sitecore import-map codegen (no TS path aliases) stays clean. */
const CALL_TO_ACTION_BG_URL = "/assets/image/call-to-action-bg.svg";

interface ICallToActionClientProps extends IParams {
  fields: ICallToActionFields;
}

const CallToActionClientBase = ({
  fields,
  params,
}: ICallToActionClientProps): JSX.Element => {
  const contrastText = params?.ContrastText === "1" ? true : false;
  const buttonPosition = params?.ButtonPosition?.Value?.value?.toLowerCase();
  const textSizeKey = params?.TextSize?.Value?.value?.toLowerCase();
  const textSize = textSizeKey === "xl" ? "xl" : "base";
  const innerWidth = params?.Width?.Value?.value?.toLowerCase();
  return (
    <div
      className={cn(
        "flex flex-wrap text-left p-6 mx-auto rounded-lg shadow-md border border-stroke-default",
        contrastText ? "bg-chrome-bar" : "bg-surface",
        buttonPosition === "right" && "sm:flex-nowrap",
        textSize === "xl" && "text-lg",
        innerWidth === "4/5" && "md:w-4/5",
        innerWidth === "3/4" && "md:w-3/4",
        innerWidth === "2/3" && "md:w-2/3",
        innerWidth === "1/2" && "md:w-2/3 xl:w-1/2",
      )}
      style={{
        backgroundImage: `url(${fields?.BackgroundImage?.value?.src ? " " : CALL_TO_ACTION_BG_URL})`,
        backgroundPosition: "bottom right",
        backgroundRepeat: "no-repeat",
      }}
    >
      <ImageView
        image={fields?.BackgroundImage}
        className="absolute inset-0 w-full h-full rounded-lg"
        objectFit="cover"
      />
      <div
        className={cn(
          "w-full relative [&_a:not([class])]:underline [&_a:not([class])]:hover:underline",
          contrastText
            ? "text-ink-inverse [&_a:not([class])]:text-ink-inverse [&_a:not([class])]:hover:text-chrome-chevron"
            : "[&_a:not([class])]:hover:text-ink-subtle",
          buttonPosition === "right" && "sm:pr-6",
        )}
      >
        <RichText
          field={fields.Heading}
          className={cn(
            "text-2xl font-bold leading-tight",
            contrastText ? "text-ink-inverse" : "text-ink-primary",
          )}
        />
        <RichText
          field={fields.Text}
          className={cn(
            "leading-snug space-y-2",
            fields?.Heading?.value && "mt-1",
            contrastText ? "text-ink-inverse" : "text-ink-primary",
          )}
        />
      </div>
      {fields.Link && (
        <div
          className={cn(
            "mt-4 whitespace-nowrap relative",
            buttonPosition === "right" && "sm:mt-0 shrink-0",
          )}
        >
          <LinkView
            link={fields.Link}
            buttonType="pill"
            contrast={contrastText}
          >
            {fields?.Link?.value?.text}
          </LinkView>
        </div>
      )}
    </div>
  );
};

export const CallToActionClient = CallToActionClientBase;
