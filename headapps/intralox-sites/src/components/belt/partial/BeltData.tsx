"use client";

import { Field, RichText } from "@sitecore-content-sdk/nextjs";
import { IBeltDataFields } from "../Belt.type";
import { cn } from 'lib/utils';
import {
  Accordion,
  AccordionItem,
} from "@laitram-l-l-c/intralox-ui-components";
import { I18N } from "lib/dictionary-keys";
import { useTranslations } from "next-intl";

interface IBeltDataProps {
  fields: IBeltDataFields;
  productSpecificationMarkup?: Field<string>;
}

const BeltData = ({ fields, productSpecificationMarkup }: IBeltDataProps) => {
  const specificationMarkup =
    fields?.fields?.BeltDataMarkup ?? productSpecificationMarkup;
  const footnotes = fields?.fields?.Footnotes;
  const t = useTranslations();
  return (
    <Accordion defaultExpandedKeys={["belt-data"]}>
      <AccordionItem
        id="belt-data"
        title={
          productSpecificationMarkup ? t(I18N.PRODUCT_DATA) : t(I18N.BELT_DATA)
        }
        className="[&_svg]:ml-4 [&_svg]:size-4 [&_svg]:shrink-0"
      >
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
          <RichText
            field={specificationMarkup}
            className={cn("prose dita-table [&_table]:text-base! [&_thead_tr_td]:font-medium! [&_thead_tr_th]:font-medium! [&_thead_tr_th_strong]:font-medium! [&_td]:px-2.5! [&_th]:px-2.5! [&_td]:py-1! [&_th]:py-1! [&_.align-center]:text-center [&_.valign-center]:align-middle [&_.valign-bottom]:align-bottom! [&_.valign-top]:align-top", footnotes ? "pb-3" : "")}
          />
        </div>
        <RichText
          field={footnotes}
          className="prose text-sm mt-2
        [&_ol_li]:mt-0! [&_ol_li]:!list-outside [&_ol_li]:!text-sm"
        />
      </AccordionItem>
    </Accordion>
  );
};

export default BeltData;
