import { Container } from "components/shared/BaseContainer";
import { Section } from "components/shared/section/Section";
import { JSX } from "react";
import {
  AppPlaceholder,
  ComponentMap,
  RichText,
} from "@sitecore-content-sdk/nextjs";

import { SearchComponentClient } from "./partial/SearchComponentClient";
import { SearchBeltSeriesPageClient } from "./partial/SearchBeltSeriesPageClient";
import {
  ISearchComponentProps,
  ISearchPageFields,
  ISearchComponentFields,
} from "./SearchComponent.type";
import { componentMap } from ".sitecore/component-map";
import { SearchCardType } from "src/utils/enum";
import { SearchBeltFinderClient } from "./partial/SearchBeltFinderClient";
import { GlobalSearchClient } from "./partial/GlobalSearchClient";

const DefaultBase = ({
  fields,
  page,
  rendering,
  params,
}: ISearchComponentProps): JSX.Element => {
  const { layout } = page;
  const { route } = layout.sitecore;
  const routeFields = route?.fields as ISearchPageFields | undefined;
  const cardType = params?.CardType?.Value?.value?.toLowerCase();
  return (
    <Section className="search-component [&_section]:pt-8 [&_section]:pb-0 [&_section_.container]:px-0 text-ink-primary">
      <Container>
        <AppPlaceholder
          name="breadbrumb-{*}"
          componentMap={componentMap as ComponentMap}
          rendering={rendering}
          page={page}
          disableSuspense
        />
        <RichText
          className={`font-bold text-ink-primary leading-tight 
            ${cardType === SearchCardType.STANDALONE ? " text-3xl mb-4" : "text-2xl"}`}
          tag="h1"
          field={routeFields?.Title}
        />
        <RichText
          className="text-ink-primary leading-normal mb-4"
          tag="p"
          field={routeFields?.Description}
        />
        <SearchComponentClient
          rfkId={fields?.SearchWidgetId?.value || ""}
          fields={fields as ISearchComponentFields}
          cardType={cardType}
          isScollPagination={true}
          isDropdownFacets={true}
          pageFields={routeFields}
        />
      </Container>
    </Section>
  );
};

const BeltFinderSearchBase = ({
  fields,
  page,
}: ISearchComponentProps): JSX.Element => {
  const routeFields = page.layout.sitecore.route?.fields as
    | ISearchPageFields
    | undefined;
  return (
    <Section
      className="search-belt-finder"
      removeBottomPadding
      removeTopPadding
    >
      <Container>
        <SearchBeltFinderClient
          rfkId={fields?.SearchWidgetId?.value || ""}
          fields={fields as ISearchComponentFields}
          pageFields={routeFields}
        />
      </Container>
    </Section>
  );
};

const BeltTechnologySearchBase = ({
  fields,
  page,
}: ISearchComponentProps): JSX.Element => {
  const routeFields = page.layout.sitecore.route?.fields as
    | ISearchPageFields
    | undefined;
  return (
    <Section
      className="search-belt-technology"
      removeBottomPadding
      removeTopPadding
    >
      <Container>
        <SearchComponentClient
          rfkId={fields?.SearchWidgetId?.value || ""}
          fields={fields as ISearchComponentFields}
          pageFields={routeFields}
        />
      </Container>
    </Section>
  );
};

const createBeltLineSearchVariant =
  (sectionClassName: string) =>
  ({ fields, page }: ISearchComponentProps): JSX.Element => {
    const routeFields = page.layout.sitecore.route?.fields as
      | ISearchPageFields
      | undefined;
    return (
      <Section
        className={sectionClassName}
        removeBottomPadding
        removeTopPadding
      >
        <Container>
          <SearchBeltSeriesPageClient
            rfkId={fields?.SearchWidgetId?.value || ""}
            fields={fields as ISearchComponentFields}
            pageFields={routeFields}
          />
        </Container>
      </Section>
    );
  };

const GlobalSearchBase = ({
  fields,
  page,
}: ISearchComponentProps): JSX.Element => {
  const routeFields = page.layout.sitecore.route?.fields as
    | ISearchPageFields
    | undefined;
  return (
    <Section className="search-global">
      <Container>
        <GlobalSearchClient
          rfkId={fields.SearchWidgetId?.value || ""}
          fields={fields as ISearchComponentFields}
          pageFields={routeFields}
        />
      </Container>
    </Section>
  );
};

export const Default = DefaultBase;
export const BeltFinderSearch = BeltFinderSearchBase;
export const BeltTechnologySearch = BeltTechnologySearchBase;
export const BeltSeriesPageSearch = createBeltLineSearchVariant(
  "search-belt-series-page-search",
);
export const BeltSprocketsSearch = createBeltLineSearchVariant(
  "search-belt-sprockets-search",
);
export const BeltAccessoriesSearch = createBeltLineSearchVariant(
  "search-belt-accessories-search",
);
export const BeltToolSearch = createBeltLineSearchVariant(
  "search-belt-tools-search",
);
export const GlobalSearch = GlobalSearchBase;
