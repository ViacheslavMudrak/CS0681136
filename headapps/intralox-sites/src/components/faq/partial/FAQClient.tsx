"use client";
import type { IFAQFields, IFAQItemFields } from "../FAQ.type";
import { IParams } from "src/utils/interface";
import { Section } from "components/shared/section/Section";
import { Container } from "components/shared/BaseContainer";
import { RichText } from "@sitecore-content-sdk/nextjs";
import {
  AccordionItem,
  Accordion,
} from "@laitram-l-l-c/intralox-ui-components";
import { cn } from "lib/utils";
import { faqItemsUseGroupedLayout } from "../FAQ.utils";
import { groupFaqItemsInOrder } from "../FAQ.utils";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";

interface IFAQClientProps extends IParams {
  fields: IFAQFields;
}

const FAQClientBase = ({ fields, params }: IFAQClientProps) => {
  const faqItems = fields.FaqItems?.filter((item) => item?.fields) ?? [];
  const useGroupedLayout = faqItemsUseGroupedLayout(faqItems);
  const groups = useGroupedLayout ? groupFaqItemsInOrder(faqItems) : null;
  const backgroundColor = params.BackgroundColor?.Value?.value?.toLowerCase();

  const renderFaqAccordionItems = (
    faqs: IFAQItemFields[],
    keyPrefix: string,
  ) => {
    return faqs.map((faq, i) => (
      <AccordionItem
        key={faq.id ?? `${keyPrefix}-${i}`}
        title={faq.fields.Question.value}
        className="text-ink-primary [&_h4]:!my-0 [&_svg]:mt-[3px] [&_svg]:ml-4 [&_svg]:size-4 [&_svg]:shrink-0"
        buttonProps={{
          className:
            "hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-accent-nav focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        }}
        data-analytics-title={faq.fields.Question.value}
      >
        <RichText
          field={faq.fields.Answer}
          className="text-ink-primary prose"
        />
      </AccordionItem>
    ));
  };

  return (
    <Section
      className="w-full"
      backgroundColor={backgroundColor}
      {...renderingAnchorIdProps(params?.RenderingIdentifier)}
    >
      <Container width="lg">
        <div className="">
          <RichText
            field={fields.Title}
            tag="h2"
            className={cn(
              "text-3xl mt-0! font-bold text-ink-primary",
              fields.Description.value ? "mb-4!" : "mb-8!",
            )}
          />
          <RichText
            field={fields.Description}
            className="text-ink-primary mb-4"
          />
        </div>
        {useGroupedLayout && groups ? (
          groups.map(({ label, items }) => (
            <div
              key={label || "__ungrouped__"}
              className="mb-5 last:mb-0"
              role="group"
              aria-label={label || undefined}
            >
              {label ? (
                <h3 className="text-2xl font-bold mt-0! mb-2 text-ink-primary">
                  {label}
                </h3>
              ) : null}
              <Accordion allowsMultipleExpanded>
                {renderFaqAccordionItems(items, label || "__ungrouped__")}
              </Accordion>
            </div>
          ))
        ) : (
          <Accordion allowsMultipleExpanded>
            {renderFaqAccordionItems(faqItems, "faq")}
          </Accordion>
        )}
      </Container>
    </Section>
  );
};

export const FAQClient = FAQClientBase;
