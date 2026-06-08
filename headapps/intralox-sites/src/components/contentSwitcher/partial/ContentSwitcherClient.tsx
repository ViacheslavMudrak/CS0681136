import { JSX } from "react";
import { Container } from "components/shared/BaseContainer";
import type {
  IContentSwitcherFields,
  ITabItemsFields,
} from "../ContentSwitcher.type";
import { IParams } from "src/utils/interface";
import BodyStyles from "components/shared/BodyStyle";
import type { Field } from "@sitecore-content-sdk/nextjs";
import {
  ComponentRendering,
  Page,
  RichText,
} from "@sitecore-content-sdk/nextjs";
import { TabAccordion } from "./TabAccordion";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import { cn } from "lib/utils";
import { Section } from "components/shared/section/Section";

/** Minimal field so `RichText` never receives `undefined` (avoids `.value` on undefined during SSG). */
const EMPTY_RICH_TEXT_FIELD = { value: "" } as Field<string>;

interface ContentSwitcherClientProps extends IParams {
  fields?: IContentSwitcherFields;
  rendering: ComponentRendering;
  page: Page;
}
const ContentSwitcherClientBase = ({
  fields,
  params,
  rendering,
  page,
}: ContentSwitcherClientProps): JSX.Element => {
  const renderingParams = (rendering as { params?: typeof params }).params;
  const backgroundColor = params.BackgroundColor?.Value?.value?.toLowerCase();
  const sectionLayoutClass =
    "contetnSwitcher relative w-full pt-12 md:pt-20 pb-12 md:pb-20";

  if (!fields) {
    return (
      <Section
        {...renderingAnchorIdProps(params.RenderingIdentifier)}
        className={cn("component content-switcher", sectionLayoutClass)}
        backgroundColor={backgroundColor}
      >
        <Container width="contentSwitcher">
          <div className="component-content">
            <span className="is-empty-hint">Content Switcher</span>
          </div>
        </Container>
      </Section>
    );
  }

  const isEditing = page.mode.isEditing;
  const tabItems: ITabItemsFields[] =
    fields.TabItems?.filter(
      (item): item is ITabItemsFields =>
        item != null && typeof item === "object" && typeof item.id === "string",
    ) ?? [];

  return (
    <Section
      {...renderingAnchorIdProps(params.RenderingIdentifier)}
      className={cn(sectionLayoutClass)}
      data-analytics-region={params.RenderingIdentifier}
      backgroundColor={backgroundColor}
    >
      <Container width="contentSwitcher">
        <BodyStyles
          contrast={false}
          theme="landingPage"
          colorScheme="gray"
          textSize="xl"
        >
          <BodyStyles
            contrast={false}
            colorScheme="gray"
            textSize="xl"
            className="w-full md:w-2/3 mx-auto text-center normal"
          >
            {(fields.Headline?.value || isEditing) && (
              <RichText
                field={fields.Headline ?? EMPTY_RICH_TEXT_FIELD}
                tag="h2"
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <RichText
                field={fields.Description ?? EMPTY_RICH_TEXT_FIELD}
                tag="p"
                className="text-center!"
              />
            )}
          </BodyStyles>
        </BodyStyles>
        <div className="mt-12">
          <TabAccordion
            tabItems={tabItems}
            params={params}
            rendering={rendering}
            page={page}
          />
        </div>
      </Container>
    </Section>
  );
};
export const ContentSwitcherClient = ContentSwitcherClientBase;
