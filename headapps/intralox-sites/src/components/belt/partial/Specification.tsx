"use client";

import { Field, RichText } from "@sitecore-content-sdk/nextjs";
import { IModularPlasticBeltSpecificationsFields } from "../Belt.type";
import {
  Accordion,
  AccordionItem,
} from "@laitram-l-l-c/intralox-ui-components";
import { useTranslations } from "next-intl";
import { I18N } from "lib/dictionary-keys";

interface ISpecificationProps {
  fields: IModularPlasticBeltSpecificationsFields;
  content?: Field<string>;
}

const Specification = ({ fields, content }: ISpecificationProps) => {
  const t = useTranslations();
  const specificationMarkup = fields?.fields?.ProductSpecificationsMarkup;

  if (!specificationMarkup?.value) {
    return null;
  }

  return (
    <div className="space-y-6 text-ink-primary">
      <RichText field={content} className="prose" />
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
        <RichText
          field={specificationMarkup}
          className="prose dita-table [&_table]:text-base! [&_thead_tr_td]:font-medium [&_thead_tr_th]:font-medium [&_thead_tr_th_strong]:font-medium! [&_td]:px-2.5! [&_th]:px-2.5! [&_td]:py-1! [&_th]:py-1! [&_.align-center]:text-center [&_.valign-center]:align-middle [&_.valign-bottom]:align-bottom [&_.valign-top]:align-top [&_tbody_tr:first-of-type_td]:font-medium [&_tbody_tr_td:first-child:not(.align-center)]:font-medium"
        />
      </div>
      <Accordion defaultExpandedKeys={["product-notes"]}>
        <AccordionItem
          id="product-notes"
          title={t(I18N.PRODUCT_NOTES)}
          className="[&_svg]:ml-4 [&_svg]:size-4 [&_svg]:shrink-0"
        >
          <RichText field={fields?.fields?.ProductNotes} className="prose" />
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Specification;
