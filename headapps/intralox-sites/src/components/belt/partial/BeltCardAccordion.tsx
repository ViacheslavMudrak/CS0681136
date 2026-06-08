"use client";
import { ICON_CHEVRON_RIGHT_SM } from 'lib/chrome-icons';
import {
  Accordion,
  AccordionItem,
} from "@laitram-l-l-c/intralox-ui-components";
import { ImageField, RichText } from "@sitecore-content-sdk/react";

import { IBeltCommonFields } from "../Belt.type";
import LinkView from "components/callToAction/partial/LinkVIew";
import { ImageView } from "components/shared/ImageView/ImageView";

interface BeltCardAccordionProps {
  id: string;
  title: string;
  items: IBeltCommonFields[];
  viewAllLink: string;
  viewAllText: string;
  pageTitle?: string;
  defaultImage?: ImageField;
}

const BeltCardAccordion = ({
  id,
  title,
  items,
  viewAllLink,
  viewAllText,
  pageTitle,
  defaultImage,
}: BeltCardAccordionProps) => (
  <Accordion>
    <AccordionItem
      id={id}
      title={title}
      className="[&_svg]:ml-4 [&_svg]:size-4 [&_svg]:shrink-0"
    >
      <div className="relative group flex flex-row overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
        {items.map((item, index) => (
          <LinkView
            key={`${item.Link ?? item.Title ?? "belt-item"}-${index}`}
            link={{
              value: { href: item.Link, text: item.Title },
            }}
            className="group mr-6 flex w-56 shrink-0 flex-col overflow-hidden rounded-lg border border-stroke-default bg-surface text-left text-wrap shadow-md transition-shadow duration-150 hover:no-underline hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-link"
            isTile={true}
          >
            <ImageView
              image={{
                value: {
                  src: item.ImageUrl ? item.ImageUrl : defaultImage?.value?.src,
                  alt: item.Title,
                  width: 1136,
                  height: 596,
                },
              }}
            />
            <div className="space-y-1 flex flex-col flex-auto px-4 pb-6 pt-4">
              <div className="text-ink-primary group-hover:text-ink-subtle">
                <RichText
                  tag="h3"
                  field={{ value: item.Title }}
                  className="inline text-ink-primary group-hover:text-ink-subtle text-lg font-bold leading-snug duration-150 transition-colors"
                />
                {item.Link && (
                  <span className="inline-flex absolute mt-1.5 items-center justify-center h-[14px]">
                    <span className="text-[12px] md:text-sm !ml-0 inline-flex">
                      {ICON_CHEVRON_RIGHT_SM}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex flex-auto flex-col justify-end">
                <p className="text-ink-subtle font-bold text-xs uppercase leading-tight">
                  {pageTitle}
                </p>
              </div>
            </div>
          </LinkView>
        ))}
      </div>
      <div className="flex justify-end">
        <LinkView
          link={{ value: { href: viewAllLink } }}
          className="mt-6 visited:text-action-visited hover:no-underline"
        >
          {viewAllText}
          <span className="size-4 !ml-0 inline-flex">{ICON_CHEVRON_RIGHT_SM}</span>
        </LinkView>
      </div>
    </AccordionItem>
  </Accordion>
);

export default BeltCardAccordion;
