import { IParams } from "src/utils/interface";
import {
  IBeltIdentifierPageFields,
  IBeltIdentifyFields,
} from "./BeltIdentifier.type";
import { JSX } from "react";
import { Section } from "components/shared/section/Section";
import { Container } from "components/shared/BaseContainer";
import { BeltIdentifierClient } from "./partial/BeltIdentifierClient";
import { Page } from "@sitecore-content-sdk/nextjs";

interface IBeltIdentifierProps extends IParams {
  fields: IBeltIdentifyFields;
  page: Page;
}

const DefaultBase = ({
  fields,
  page,
  params,
}: IBeltIdentifierProps): JSX.Element => {
  const { layout } = page;
  const { route } = layout.sitecore;
  const routeFields = route?.fields as IBeltIdentifierPageFields | undefined;
  const cardType = params?.CardType?.Value?.value?.toLowerCase();
  const routeLocale =
    typeof params?.locale === "string" ? params.locale : undefined;

  return (
    <Section removeTopPadding removeBottomPadding>
      <Container>
        <BeltIdentifierClient
          fields={fields}
          rfkId={fields.SearchWidgetId?.value || ""}
          cardType={cardType}
          routeLocale={routeLocale}
          routeFields={routeFields}
        />
      </Container>
    </Section>
  );
};

export default DefaultBase;
