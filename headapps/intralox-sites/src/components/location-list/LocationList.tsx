import { Fragment, type JSX } from "react";
import { cn } from "lib/utils";
import {
  Link as ContentSdkLink,
  NextImage,
  RichText,
  Text,
  type TextField,
} from "@sitecore-content-sdk/nextjs";

import { parseMediaImageDimensionsWithFallback } from "components/media/mediaUtils";
import { LocationListIntroNav } from "components/location-list/partial/LocationListIntroNav";
import {
  buildLocationCardAddressPlainText,
  buildLocationListIntroGroups,
  groupLocationListItemsBySection,
  LOCATION_LIST_CARD_REGION_FALLBACK_ARIA,
  LOCATION_LIST_EMPTY_HINT,
  LOCATION_LIST_LABEL_FAX,
  LOCATION_LIST_LABEL_TEL,
  LOCATION_LIST_LABEL_TOLL_FREE,
  LOCATION_LIST_MAP_LINK_FALLBACK_ARIA,
  LOCATION_LIST_SECTION_ORDER,
  locationListCardAnchorId,
  locationListSectionDomId,
  locationListSectionTitle,
  readLocationListColumnCount,
  trimTextValue,
  type LocationListChildItem,
  type LocationListProps,
  type LocationListSectionKey,
} from "components/location-list/locationListUtils";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";

function textHasValue(field: TextField | undefined): boolean {
  return trimTextValue(field?.value) !== "";
}

/**
 * Single location card: image, company name, address lines, map, optional phone rows.
 */
function LocationListCard({
  item,
  isEditing,
  isFirstCardInPage,
}: {
  item: LocationListChildItem;
  isEditing: boolean;
  isFirstCardInPage: boolean;
}): JSX.Element {
  const f = item.fields ?? {};
  const anchorId = locationListCardAnchorId(item);
  const companyPlain =
    trimTextValue(f.CompanyName?.value) || trimTextValue(item.displayName);

  const street = textHasValue(f.StreetAddress) || isEditing;
  const locality = textHasValue(f.Locality) || isEditing;
  const region = textHasValue(f.Region) || isEditing;
  const postal = textHasValue(f.PostalCode) || isEditing;
  const country = textHasValue(f.Country) || isEditing;

  const showMidLine = locality || region || postal;
  const addressPlainText = buildLocationCardAddressPlainText(item.fields);
  const showAddressInEditor = street || showMidLine || country;
  const showAddressBlock = isEditing
    ? showAddressInEditor
    : Boolean(addressPlainText);

  const mapHref = trimTextValue(f.MapURL?.value?.href);
  const showMap = Boolean(mapHref) || isEditing;

  const tel = textHasValue(f.Telephone) || isEditing;
  const fax = textHasValue(f.Fax) || isEditing;
  const toll = textHasValue(f.TollFree) || isEditing;
  const showContactBlock = tel || fax || toll;

  const img = f.FeaturedImage;
  const imgSrc = trimTextValue(img?.value?.src);
  const showImage = Boolean(imgSrc) || isEditing;
  const imgDims = parseMediaImageDimensionsWithFallback(img) ?? {
    width: 640,
    height: 372,
  };

  const mapTarget = f.MapURL?.value?.target;
  const mapRel = mapTarget === "_blank" ? "noopener noreferrer" : undefined;

  const showTitle = companyPlain || isEditing;
  const regionAria =
    companyPlain ||
    trimTextValue(item.displayName) ||
    LOCATION_LIST_CARD_REGION_FALLBACK_ARIA;

  return (
    <article
      id={anchorId}
      className="flex min-w-0 flex-col border-0 border-stroke-default bg-surface scroll-mt-[var(--headerTop)]"
      role="group"
      aria-labelledby={showTitle ? `${anchorId}-title` : undefined}
      aria-label={showTitle ? undefined : regionAria}
      tabIndex={-1}
    >
      {showImage && (imgSrc || isEditing) && img ? (
        <NextImage
          field={img}
          width={imgDims.width}
          height={imgDims.height}
          className="box-border m-0 block h-auto w-full max-w-full overflow-x-clip overflow-y-clip border-0 border-solid border-stroke-default p-0 align-middle [overflow-clip-margin:content-box] [-webkit-tap-highlight-color:transparent]"
          sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 33vw"
        />
      ) : null}

      <div className="mt-4 flex min-w-0 flex-col">
        {showTitle ? (
          <h3
            id={`${anchorId}-title`}
            className={cn(
              "box-border block m-0 p-0 font-media-tile text-font-big font-bold leading-font-media-tile-headline-compact text-ink-primary antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]",
              isFirstCardInPage && "!mx-0 !p-0",
            )}
          >
            <Text field={f.CompanyName} tag="span" />
          </h3>
        ) : null}

        {f.FullAddress && <RichText field={f.FullAddress} />}

        {/* {showAddressBlock ? (
          <address
            className={cn(
              "not-italic box-border m-0 mt-2 block w-full max-w-full whitespace-pre-line p-0 font-media-tile text-font-medium font-normal leading-6 text-ink-primary antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]",
              isFirstCardInPage && "!mx-0 !p-0",
            )}
          >
            {!isEditing ? (
              addressPlainText
            ) : (
              <>
                {street ? (
                  <span className="m-0 block min-w-0 p-0 [unicode-bidi:isolate]">
                    <Text field={f.StreetAddress} tag="span" />
                  </span>
                ) : null}
                {showMidLine ? (
                  <span className="m-0 block min-w-0 p-0 [unicode-bidi:isolate]">
                    {locality ? <Text field={f.Locality} tag="span" /> : null}
                    {locality && (region || postal) ? <span> </span> : null}
                    {region ? <Text field={f.Region} tag="span" /> : null}
                    {region && postal ? <span> </span> : null}
                    {postal ? <Text field={f.PostalCode} tag="span" /> : null}
                  </span>
                ) : null}
                {country ? (
                  <span className="m-0 block min-w-0 p-0 [unicode-bidi:isolate]">
                    <Text field={f.Country} tag="span" />
                  </span>
                ) : null}
              </>
            )}
          </address>
        ) : null} */}

        {showMap && f.MapURL ? (
          <ContentSdkLink
            field={f.MapURL}
            className="mt-2 inline-block text-link underline decoration-solid underline-offset-2 outline-none transition-[color,text-decoration-color,text-decoration-thickness] duration-150 ease-in-out motion-reduce:transition-none hover:text-link-strong hover:no-underline focus:outline-none focus-visible:outline-none focus-visible:text-link-strong focus-visible:no-underline"
            aria-label={
              companyPlain
                ? `${LOCATION_LIST_MAP_LINK_FALLBACK_ARIA} (${companyPlain})`
                : LOCATION_LIST_MAP_LINK_FALLBACK_ARIA
            }
            rel={mapRel}
          />
        ) : null}

        {showContactBlock ? (
          <dl className="mt-2 m-0 grid w-full max-w-full grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-[10px] gap-y-0 p-0 font-media-tile text-font-medium leading-6 text-ink-primary antialiased [-webkit-tap-highlight-color:transparent]">
            {tel ? (
              <>
                <dt className="m-0 p-0 text-left font-bold whitespace-nowrap [unicode-bidi:isolate]">
                  {LOCATION_LIST_LABEL_TEL}
                </dt>
                <dd className="m-0 min-w-0 p-0 text-left font-normal [unicode-bidi:isolate]">
                  <Text field={f.Telephone} tag="span" />
                </dd>
              </>
            ) : null}
            {fax ? (
              <>
                <dt className="m-0 p-0 text-left font-bold whitespace-nowrap [unicode-bidi:isolate]">
                  {LOCATION_LIST_LABEL_FAX}
                </dt>
                <dd className="m-0 min-w-0 p-0 text-left font-normal [unicode-bidi:isolate]">
                  <Text field={f.Fax} tag="span" />
                </dd>
              </>
            ) : null}
            {toll ? (
              <>
                <dt className="m-0 p-0 text-left font-bold whitespace-nowrap [unicode-bidi:isolate]">
                  {LOCATION_LIST_LABEL_TOLL_FREE}
                </dt>
                <dd className="m-0 min-w-0 p-0 text-left font-normal [unicode-bidi:isolate]">
                  <Text field={f.TollFree} tag="span" />
                </dd>
              </>
            ) : null}
          </dl>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Locations page listing: intro anchor links and grouped location cards.
 *
 * @param fields - Datasource fields (`Locations`)
 * @param params - `styles`, `RenderingIdentifier`, optional column count (`Columns` / `NumberOfColumns` / `GridColumns`)
 * @param page - Page context for `isEditing`
 */
export function Default({
  fields,
  params,
  page,
}: LocationListProps): JSX.Element {
  const { isEditing } = page.mode;
  const { styles, RenderingIdentifier } = params;
  const anchorProps = renderingAnchorIdProps(RenderingIdentifier);
  const columnCount = readLocationListColumnCount(params);

  if (!fields) {
    return (
      <section
        className={cn(
          "component location-list w-full box-border min-w-0 max-w-none bg-surface p-0 text-ink-primary w-screen shrink-0 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] [.component_&]:ml-0 [.component_&]:mr-0 [.component_&]:w-full [.component_&]:max-w-full [.component_&]:shrink [.two-column-container_&]:flex-[0_1_auto]",
          styles,
        )}
        {...anchorProps}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
          <div className="location-list-outer box-border mx-auto min-w-0 w-full max-w-none px-4 py-12 min-[600px]:max-[767px]:max-w-[min(600px,100%)] min-[768px]:max-w-[768px] min-[768px]:py-20 min-[992px]:max-w-[992px] min-[1200px]:max-w-[1200px] [.two-column-container_&]:mx-0 [.two-column-container_&]:max-w-none [.two-column-container_&]:p-0 [.two-column-left-column_&]:pt-0">
            <span className="is-empty-hint">{LOCATION_LIST_EMPTY_HINT}</span>
          </div>
        </div>
      </section>
    );
  }

  const { Locations } = fields;
  const grouped = groupLocationListItemsBySection(Locations, isEditing);
  const introGroups = buildLocationListIntroGroups(grouped);

  const hasAnyCard = LOCATION_LIST_SECTION_ORDER.some(
    (key) => (grouped.get(key) ?? []).length > 0,
  );
  const firstSectionWithCards = LOCATION_LIST_SECTION_ORDER.find(
    (key) => (grouped.get(key) ?? []).length > 0,
  );
  const showEditingEmptyList = isEditing && !hasAnyCard;

  if (!hasAnyCard && !isEditing) {
    return (
      <section
        className={cn(
          "component location-list w-full box-border min-w-0 max-w-none bg-surface p-0 text-ink-primary w-screen shrink-0 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] [.component_&]:ml-0 [.component_&]:mr-0 [.component_&]:w-full [.component_&]:max-w-full [.component_&]:shrink [.two-column-container_&]:flex-[0_1_auto]",
          styles,
        )}
        {...anchorProps}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none" />
      </section>
    );
  }

  return (
    <section
      className={cn(
        "component location-list !w-full box-border min-w-0 max-w-none bg-surface p-0 text-ink-primary w-screen shrink-0 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] [.component_&]:ml-0 [.component_&]:mr-0 [.component_&]:w-full [.component_&]:max-w-full [.component_&]:shrink [.two-column-container_&]:flex-[0_1_auto]",
        styles,
      )}
      {...anchorProps}
    >
      <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
        <div
          className="location-list-outer box-border mx-auto min-w-0 w-full max-w-none px-4 py-12 min-[600px]:max-[767px]:max-w-[min(600px,100%)] min-[768px]:max-w-[768px] min-[768px]:py-20 min-[992px]:max-w-[992px] min-[1200px]:max-w-[1200px] [.two-column-container_&]:mx-0 [.two-column-container_&]:max-w-none [.two-column-container_&]:p-0 [.two-column-left-column_&]:pt-0"
          data-testid="location-list-outer"
        >
          {introGroups.length > 0 ? (
            <LocationListIntroNav groups={introGroups} />
          ) : null}

          {showEditingEmptyList ? (
            <p className="py-6">
              <span className="is-empty-hint">No locations configured</span>
            </p>
          ) : null}

          {LOCATION_LIST_SECTION_ORDER.map(
            (sectionKey: LocationListSectionKey) => {
              const items = grouped.get(sectionKey) ?? [];
              if (!items.length) {
                return null;
              }
              const sectionId = locationListSectionDomId(sectionKey);
              const isFirstSection = sectionKey === firstSectionWithCards;

              return (
                <Fragment key={sectionKey}>
                  <div
                    className="mx-0 my-[32px] border-0 border-t border-solid border-stroke-default"
                    aria-hidden="true"
                  />
                  <section className="mt-0" aria-labelledby={sectionId}>
                    <h2
                      id={sectionId}
                      className="box-border block m-0 p-0 font-media-tile text-font-media-tile-headline font-bold leading-font-media-tile-headline text-ink-primary antialiased [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]"
                    >
                      {locationListSectionTitle(sectionKey)}
                    </h2>
                    <div
                      className={cn(
                        "mt-4 grid w-full grid-cols-1 gap-12",
                        columnCount === 1
                          ? "md:gap-8 lg:grid-cols-1"
                          : "md:gap-12",
                        columnCount === 2 && "md:grid-cols-2",
                        columnCount === 3 && "md:grid-cols-2 lg:grid-cols-3",
                        columnCount === 4 && "md:grid-cols-2 lg:grid-cols-4",
                      )}
                      role="list"
                    >
                      {items.map((item, index) => (
                        <div key={item.id} className="min-w-0" role="listitem">
                          <LocationListCard
                            item={item}
                            isEditing={isEditing}
                            isFirstCardInPage={isFirstSection && index === 0}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                </Fragment>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}
