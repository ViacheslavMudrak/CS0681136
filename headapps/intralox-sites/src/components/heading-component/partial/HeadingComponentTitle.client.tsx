"use client";

import { JSX } from "react";
import { Text } from "@sitecore-content-sdk/nextjs";
import type { TextField } from "@sitecore-content-sdk/nextjs";

import { Heading } from "@laitram-l-l-c/intralox-ui-components";
import { cn } from "lib/utils";
import {
  resolveHeadingLevelNumber,
  type HeadingComponentColorKey,
  type HeadingComponentSemanticTag,
} from "components/heading-component/headingComponentUtils";

export interface HeadingComponentTitleProps {
  field: TextField;
  headingTag: HeadingComponentSemanticTag;
  colorKey: HeadingComponentColorKey;
  uppercaseHeading: boolean;
}

/**
 * Sitecore-editable title wrapped in the design-system Heading (semantic level + project typography).
 */
export function HeadingComponentTitle({
  field,
  headingTag,
  colorKey,
  uppercaseHeading,
}: HeadingComponentTitleProps): JSX.Element {
  const level = resolveHeadingLevelNumber(headingTag);

  return (
    <Heading
      level={level}
      className={cn(
        "font-media-tile font-bold [text-wrap:balance] m-0",
        headingTag === "h1" &&
          "text-[length:clamp(1.75rem,4vw,3rem)] leading-tight md:text-[length:clamp(2rem,3.5vw,3.5rem)]",
        headingTag === "h2" && "text-2xl leading-tight md:text-3xl lg:text-4xl",
        headingTag === "h3" && "text-xl leading-snug md:text-2xl lg:text-3xl",
        headingTag === "h4" && "text-lg leading-snug md:text-xl lg:text-2xl",
        headingTag === "h5" && "text-base leading-normal md:text-lg lg:text-xl",
        headingTag === "h6" && "text-sm leading-normal md:text-base lg:text-lg",
        colorKey === "white" && "text-ink-inverse",
        colorKey === "gray" && "text-ink-secondary",
        colorKey === "cyan" && "text-nav-link-hover",
        colorKey === "orange" && "text-orange",
        colorKey === "black" && "text-ink-primary",
        uppercaseHeading && "uppercase tracking-wide",
      )}
    >
      <Text field={field} tag="span" className="m-0" />
    </Heading>
  );
}
