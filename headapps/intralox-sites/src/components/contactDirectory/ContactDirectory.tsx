import { JSX } from "react";
import { Container, ContainerWidth } from "components/shared/BaseContainer";
import { Section } from "components/shared/section/Section";
import {
  IRouteDirectoryFields,
  IContactDirectoryFields,
  IContactDirectoryPageFields,
  IIndustriesFields,
} from "./ContactDirectory.type";
import { IParams } from "src/utils/interface";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import { ContactDirectoryClient } from "./partial/ContactDirectoryClient";

interface IContactDirectoryProps extends IContactDirectoryPageFields, IParams {
  fields: IContactDirectoryFields;
}

const DefaultBase = ({
  page,
  params,
  fields,
}: IContactDirectoryProps): JSX.Element => {
  const { layout } = page;
  const { route } = layout.sitecore;
  const routeFields = route?.fields as IRouteDirectoryFields | undefined;
  const containerWidth =
    routeFields?.ContainerWidth?.fields.Value.value.toLowerCase() as ContainerWidth;
  const showWhatsApp = routeFields?.ShowWhatsApp?.value;
    return (
    <Section
      className="text-ink-primary contact-directory"
      {...renderingAnchorIdProps(params.RenderingIdentifier)}
      removeTopPadding={true}
    >
      <Container width={containerWidth}>
        <ContactDirectoryClient
          fields={fields}
          params={params}
          industries={(routeFields?.Industries ?? []) as IIndustriesFields[]}
          email={routeFields?.Email?.value}
          fax={routeFields?.Fax?.value}
          internationalTollFreeTelephone={
            routeFields?.InternationalTollFreeTelephone?.value
          }
          tollFreeTelephone={routeFields?.TollFreeTelephone?.value}
          tollFreeFax={routeFields?.TollFreeFax?.value}
          telephone={routeFields?.Telephone?.value}
          showWhatsApp={showWhatsApp}
        />
      </Container>
    </Section>
  );
};

export const Default = DefaultBase;
