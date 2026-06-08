import { type CSSProperties, JSX } from "react";

import { Text, type TextField } from "@sitecore-content-sdk/nextjs";
import { cn } from "lib/utils";
import { getQuickLinkLabels } from "lib/quick-link-i18n";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import LinkView from "components/callToAction/partial/LinkVIew";
import type { QuickLinkFields } from "../quick-link/QuickLink.type";
import { QuickLinkTile } from "../quick-link/partial/QuickLinkTile";
import {
  QUICK_LINK_TILE_TEST_ID,
  hasQuickLinkVisitorContent,
  mergeQuickLinkRenderingParams,
  quickLinkSectionAriaLabel,
  resolveQuickLinkCardType,
  resolveQuickLinkFields,
  resolveQuickLinkIconPosition,
  resolveQuickLinkStandalone,
} from "../quick-link/quickLinkUtils";

import type { QuickLinkGroupProps } from "./QuickLinkGroup.type";
import { QuickLinkGroupAside } from "./partial/QuickLinkGroupAside";
import {
  QUICK_LINK_GROUP_LABELS,
  QUICK_LINK_GROUP_SIDEBAR_DIVIDER_TEST_ID,
  QUICK_LINK_GROUP_STYLE_TOKEN_ASIDE_PRESS_INQUIRIES,
  parseQuickLinkGroupStyleTokenList,
  resolveContactRailLinkTone,
  resolveQuickLinkGroupColumnCount,
  shouldShowQuickLinkGroupAsideLayout,
  shouldShowQuickLinkGroupStackedSidebarRail,
  type QuickLinkGroupColumnCount,
} from "./quickLinkGroupUtils";

const ROOT_TEST_ID = "quick-link-group";

export async function Default({
  fields,
  params,
  page,
  rendering,
}: QuickLinkGroupProps): Promise<JSX.Element | null> {
  const safeParams = params ?? {};
  const { styles } = safeParams;
  const anchorId = renderingAnchorIdProps(safeParams.RenderingIdentifier);
  const isEditing = page?.mode?.isEditing ?? false;
  const paramsRecord = mergeQuickLinkRenderingParams(
    rendering,
    safeParams as Record<string, unknown>,
  );
  const styleTokens = parseQuickLinkGroupStyleTokenList(paramsRecord);
  const indentTop = styleTokens.includes("indent-top");
  const indentBottom = styleTokens.includes("indent-bottom");
  const pressInquiriesAside = styleTokens.includes(
    QUICK_LINK_GROUP_STYLE_TOKEN_ASIDE_PRESS_INQUIRIES,
  );

  if (!fields) {
    return (
      <div
        className={cn(
          "box-border min-w-0 max-w-none shrink-0 grow-0 basis-full p-0! px-0!",
          "w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]",
          "component quick-link-group",
          "[.two-column-container_&]:shrink [.two-column-container_&]:grow-0 [.two-column-container_&]:basis-auto [.two-column-container_&]:ml-0 [.two-column-container_&]:mr-0 [.two-column-container_&]:w-full [.two-column-container_&]:max-w-full [.two-column-container_&]:p-0",
          styles,
        )}
        {...anchorId}
      >
        <div
          className={cn(
            "component-content box-border m-0 min-w-0 w-full max-w-none",
            indentTop && "pt-12 md:pt-20",
            indentBottom && "pb-12 md:pb-20",
          )}
        >
          <div className="quick-link-group-outer box-border m-0 w-full min-w-0 max-w-none p-0 [&_.component.quick-link[data-variant=card]]:static [&_.component.quick-link[data-variant=card]]:m-0 [&_.component.quick-link[data-variant=card]]:p-0 [&_.component.quick-link[data-variant=card]>a]:box-border [&_.component.quick-link[data-variant=card]>a]:size-full [&_.component.quick-link[data-variant=card]>a]:max-w-full [&_.component.quick-link[data-variant=card]>a]:min-h-[inherit] [&_.component.quick-link[data-variant=card]>div]:box-border [&_.component.quick-link[data-variant=card]>div]:size-full [&_.component.quick-link[data-variant=card]>div]:max-w-full [&_.component.quick-link[data-variant=card]>div]:min-h-[inherit] [&_.component.quick-link[data-variant=base]]:px-0 [&_[role=list][data-ql-group-layout=sidebar-column]>.component.quick-link]:px-0!">
            <div className="mt-[var(--layout-gutter-inline)] mb-0 box-border px-[var(--layout-gutter-inline)] mx-auto w-full min-w-0 max-w-full">
              <span className="is-empty-hint">
                {QUICK_LINK_GROUP_LABELS.emptyDatasource}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { QuickLinkItems, QuickLinkCount, Headline, Description } = fields;
  const rawItemsFromQuickLinkItems =
    QuickLinkItems?.filter((item) => item?.fields) ?? [];
  const usedQuickLinkItems = rawItemsFromQuickLinkItems.length > 0;
  const rawItems = usedQuickLinkItems
    ? rawItemsFromQuickLinkItems
    : (fields.ListofLinks?.filter((item) => item?.fields) ?? []);

  const supplementaryLinkCandidates =
    fields.ListofLinks?.filter(
      (item) =>
        item?.fields?.Link &&
        (Boolean(item.fields.Link.value?.href) || isEditing),
    ) ?? [];
  const showSupplementaryLinkList =
    usedQuickLinkItems && supplementaryLinkCandidates.length > 0;
  const cardType = resolveQuickLinkCardType(paramsRecord);
  const stackedSidebarRailLayout = shouldShowQuickLinkGroupStackedSidebarRail(
    usedQuickLinkItems,
    showSupplementaryLinkList,
    cardType,
  );

  const columnCount: QuickLinkGroupColumnCount =
    showSupplementaryLinkList &&
    !stackedSidebarRailLayout &&
    QuickLinkCount?.fields?.Value?.value !== "4"
      ? ((resolveQuickLinkGroupColumnCount(QuickLinkCount) +
          1) as QuickLinkGroupColumnCount)
      : resolveQuickLinkGroupColumnCount(QuickLinkCount);
  const iconPosition = resolveQuickLinkIconPosition(cardType, paramsRecord);
  const standaloneCard =
    cardType === "card" && resolveQuickLinkStandalone(paramsRecord);
  const sidebarColumnLayout = !usedQuickLinkItems && cardType === "base";
  const contactRailLinkTone = resolveContactRailLinkTone(
    sidebarColumnLayout,
    Headline?.value as string | undefined,
  );

  const prepared = rawItems.map((item) => ({
    id: item.id,
    displayName: item.displayName,
    resolved: resolveQuickLinkFields(item.fields!),
  }));

  const visible = prepared.filter((row) =>
    hasQuickLinkVisitorContent(row.resolved, paramsRecord, isEditing),
  );

  const showAsideLayout = shouldShowQuickLinkGroupAsideLayout(
    visible.length,
    isEditing,
    Headline?.value as string | undefined,
    Description?.value as string | undefined,
  );

  if (showAsideLayout) {
    const asideAria =
      String(Headline?.value ?? "").trim() ||
      QUICK_LINK_GROUP_LABELS.asideFallbackAria;

    return (
      <aside
        className={cn(
          "box-border min-w-0 max-w-none shrink-0 grow-0 basis-full p-0! px-0!",
          "w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]",
          "component quick-link-group",
          "[.two-column-container_&]:shrink [.two-column-container_&]:grow-0 [.two-column-container_&]:basis-auto [.two-column-container_&]:ml-0 [.two-column-container_&]:mr-0 [.two-column-container_&]:w-full [.two-column-container_&]:max-w-full [.two-column-container_&]:p-0",
          styles,
          pressInquiriesAside && "quick-link-group--press-inquiries",
        )}
        {...anchorId}
        aria-label={asideAria}
        data-testid={ROOT_TEST_ID}
      >
        <div
          className={cn(
            "component-content box-border m-0 min-w-0 w-full max-w-none",
            indentTop && "pt-12 md:pt-20",
            indentBottom && "pb-12 md:pb-20",
          )}
        >
          <div className="quick-link-group-outer box-border m-0 w-full min-w-0 max-w-none p-0 [&_.component.quick-link[data-variant=card]]:static [&_.component.quick-link[data-variant=card]]:m-0 [&_.component.quick-link[data-variant=card]]:p-0 [&_.component.quick-link[data-variant=card]>a]:box-border [&_.component.quick-link[data-variant=card]>a]:size-full [&_.component.quick-link[data-variant=card]>a]:max-w-full [&_.component.quick-link[data-variant=card]>a]:min-h-[inherit] [&_.component.quick-link[data-variant=card]>div]:box-border [&_.component.quick-link[data-variant=card]>div]:size-full [&_.component.quick-link[data-variant=card]>div]:max-w-full [&_.component.quick-link[data-variant=card]>div]:min-h-[inherit] [&_.component.quick-link[data-variant=base]]:px-0 [&_[role=list][data-ql-group-layout=sidebar-column]>.component.quick-link]:px-0!">
            <div className="mt-[calc(var(--layout-gutter-inline)*-1.5)] mb-0 box-border px-0 mx-auto w-full min-w-0 max-w-full pt-0 pb-6 md:pb-8">
              <QuickLinkGroupAside
                Headline={Headline}
                Description={Description}
                isEditing={isEditing}
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (visible.length === 0) {
    return null;
  }

  const labels = await getQuickLinkLabels();

  const supplementaryPrepared = supplementaryLinkCandidates.map((item) => ({
    id: item.id,
    displayName: item.displayName,
    resolved: resolveQuickLinkFields(item.fields!),
  }));
  const supplementaryVisible = supplementaryPrepared.filter((row) =>
    hasQuickLinkVisitorContent(row.resolved, paramsRecord, isEditing),
  );

  const renderQuickLinkTile = (
    row: { id: string; resolved: QuickLinkFields },
    tileIndex: number,
    railTypography: boolean,
    leadStandaloneSpanClass?: string,
  ): JSX.Element => {
    const tileAria = quickLinkSectionAriaLabel(
      row.resolved.Title?.value,
      row.resolved.Link?.value?.text,
      labels.emptyHint,
    );

    return (
      <div
        key={row.id}
        className={cn(
          "component quick-link",
          cardType === "card" &&
            "box-border block h-auto min-h-0 w-full min-w-0 max-w-full p-0! px-0! leading-[24px] text-ink-primary font-media-tile border-0 border-solid border-stroke-default [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]",
          cardType !== "card" &&
            railTypography &&
            "box-border block w-full min-w-0 max-w-full mt-0 text-left text-font-big leading-[30px]",
          cardType !== "card" &&
            !railTypography &&
            sidebarColumnLayout &&
            "box-border block w-full min-w-0 max-w-full mt-0 text-left text-font-big leading-[30px]",
          cardType !== "card" &&
            !railTypography &&
            !sidebarColumnLayout &&
            "box-border block mt-4 md:mt-6 text-left text-font-big leading-[30px] text-ink-muted",
          cardType === "card" && "min-w-0 w-full max-w-full justify-self-stretch",
          cardType !== "card" &&
            (railTypography || sidebarColumnLayout) &&
            "w-full min-w-0 max-w-full shrink-0",
          cardType !== "card" && !railTypography && !sidebarColumnLayout && "w-full min-w-0",
          leadStandaloneSpanClass,
        )}
        role="listitem"
        aria-label={tileAria}
        data-testid={QUICK_LINK_TILE_TEST_ID}
        data-variant={cardType}
        data-icon-position={iconPosition}
        {...(standaloneCard ? { "data-standalone": "true" } : {})}
      >
        <QuickLinkTile
          resolvedFields={row.resolved}
          paramsRecord={paramsRecord}
          isEditing={isEditing}
          labels={labels}
          caseStudyRailTypography={railTypography}
          contactRailLinkTone={contactRailLinkTone}
        />
      </div>
    );
  };

  const linkList =
    showSupplementaryLinkList && !stackedSidebarRailLayout
      ? supplementaryLinkCandidates.map((item) => (
          <li key={item.id} className="!ml-0 border-t border-stroke-default">
            <LinkView
              link={item?.fields!.Link!}
              className="py-1 hover:no-underline inline-block focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {item.fields?.Link?.value?.text}
            </LinkView>
          </li>
        ))
      : null;

  return (
    <section
      className={cn(
        "box-border min-w-0 max-w-none shrink-0 grow-0 basis-full p-0! px-0!",
        "w-screen max-w-[100vw] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]",
        "component quick-link-group",
        "[.two-column-container_&]:shrink [.two-column-container_&]:grow-0 [.two-column-container_&]:basis-auto [.two-column-container_&]:ml-0 [.two-column-container_&]:mr-0 [.two-column-container_&]:w-full [.two-column-container_&]:max-w-full [.two-column-container_&]:p-0",
        styles,
      )}
      {...anchorId}
      aria-label={QUICK_LINK_GROUP_LABELS.sectionAria}
      data-testid={ROOT_TEST_ID}
    >
      <div
        className={cn(
          "component-content box-border m-0 min-w-0 w-full max-w-none",
          indentTop && "pt-12 md:pt-20",
          indentBottom && "pb-12 md:pb-20",
        )}
      >
        <div className="quick-link-group-outer box-border m-0 w-full min-w-0 max-w-none p-0 [&_.component.quick-link[data-variant=card]]:static [&_.component.quick-link[data-variant=card]]:m-0 [&_.component.quick-link[data-variant=card]]:p-0 [&_.component.quick-link[data-variant=card]>a]:box-border [&_.component.quick-link[data-variant=card]>a]:size-full [&_.component.quick-link[data-variant=card]>a]:max-w-full [&_.component.quick-link[data-variant=card]>a]:min-h-[inherit] [&_.component.quick-link[data-variant=card]>div]:box-border [&_.component.quick-link[data-variant=card]>div]:size-full [&_.component.quick-link[data-variant=card]>div]:max-w-full [&_.component.quick-link[data-variant=card]>div]:min-h-[inherit] [&_.component.quick-link[data-variant=base]]:px-0 [&_[role=list][data-ql-group-layout=sidebar-column]>.component.quick-link]:px-0!">
          <div
            className={cn(
              cardType === "card" &&
                "grid w-full gap-6 grid-flow-row py-0 items-stretch justify-items-stretch justify-center [grid-template-columns:1fr] min-[600px]:max-[767px]:[grid-template-columns:repeat(var(--ql-group-columns),minmax(0,var(--ql-group-card-w-sm)))] min-[768px]:max-[991px]:[grid-template-columns:repeat(2,minmax(0,var(--ql-group-card-w-md)))] min-[992px]:max-[1199px]:[grid-template-columns:repeat(var(--ql-group-columns),minmax(0,var(--ql-group-card-w-lg)))] min-[1200px]:[grid-template-columns:repeat(var(--ql-group-columns),minmax(0,var(--ql-group-card-w-xl)))] min-[600px]:max-[767px]:w-full min-[768px]:w-full min-[768px]:justify-center mt-[var(--layout-gutter-inline)] mb-0 box-border px-[var(--layout-gutter-inline)] mx-auto w-full min-w-0 max-w-full h-auto min-h-0",
              cardType !== "card" &&
                (stackedSidebarRailLayout || sidebarColumnLayout) &&
                "flex flex-col flex-nowrap items-stretch justify-start gap-2 max-[430px]:gap-[10px] py-0 min-h-0 h-auto w-full text-left mt-0 mb-0 box-border px-0 mx-auto w-full min-w-0 max-w-full text-ink-primary",
              cardType !== "card" &&
                !sidebarColumnLayout &&
                !stackedSidebarRailLayout &&
                "flex flex-col flex-nowrap items-stretch justify-start py-0 min-h-[211.75px] h-auto mt-[calc(var(--layout-gutter-inline)*-1.5)] mb-0 box-border px-0 mx-auto w-full min-w-0 max-w-full",
              "leading-[24px] text-ink-primary font-media-tile border-0 border-solid border-stroke-default [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] antialiased",
            )}
            role="list"
            data-ql-group-layout={
              stackedSidebarRailLayout ? "stacked-sidebar-rail"
              : sidebarColumnLayout ? "sidebar-column"
              : "default"
            }
            style={
              cardType === "card"
                ? ({ "--ql-group-columns": columnCount } as CSSProperties)
                : undefined
            }
          >
            {stackedSidebarRailLayout ? (
              <>
                <div
                  className="box-border flex min-w-0 w-full max-w-full flex-col flex-nowrap items-stretch justify-start gap-2 max-[430px]:gap-[10px]"
                  role="group"
                  aria-label={QUICK_LINK_GROUP_LABELS.caseStudiesRailRegionAria}
                >
                  <h3 className="box-border block !m-0 !border-0 !p-0 font-media-tile text-font-big font-bold leading-font-media-tile-headline uppercase text-ink-tertiary [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]">
                    {QUICK_LINK_GROUP_LABELS.caseStudiesRailRegionAria}
                  </h3>
                  {visible.map((row, tileIndex) =>
                    renderQuickLinkTile(row, tileIndex, true),
                  )}
                </div>
                <div
                  data-testid={QUICK_LINK_GROUP_SIDEBAR_DIVIDER_TEST_ID}
                  className="box-border m-0 w-full shrink-0 border-0 border-t border-solid border-stroke-default p-0"
                  aria-hidden="true"
                />
                <div
                  className="box-border flex min-w-0 w-full max-w-full flex-col flex-nowrap items-stretch justify-start gap-2 max-[430px]:gap-[10px]"
                  role="group"
                  aria-label={
                    String(Headline?.value ?? "").trim() ||
                    QUICK_LINK_GROUP_LABELS.linkListRegionAria
                  }
                >
                  {(Headline?.value || isEditing) && (
                    <div className="box-border block w-full min-w-0 max-w-full m-0 p-0 text-left">
                      <Text
                        field={Headline ?? ({ value: "" } as TextField)}
                        tag="h3"
                        className="box-border block !m-0 !border-0 !p-0 font-media-tile text-font-big font-bold leading-font-media-tile-headline uppercase text-ink-tertiary [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]"
                      />
                    </div>
                  )}
                  {supplementaryVisible.map((row, tileIndex) =>
                    renderQuickLinkTile(row, tileIndex, true),
                  )}
                </div>
              </>
            ) : null}
            {!stackedSidebarRailLayout &&
              !usedQuickLinkItems &&
              visible.length > 0 &&
              (Headline?.value || isEditing) && (
                <div
                  key="__quick-link-group-listoflinks-headline__"
                  className={cn(
                    "component quick-link",
                    sidebarColumnLayout
                      ? "box-border block w-full min-w-0 max-w-full m-0 p-0 text-left"
                      : cardType === "card"
                        ? "box-border block h-auto min-h-0 w-full min-w-0 max-w-full leading-[24px] text-ink-primary font-media-tile border-0 border-solid border-stroke-default [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]"
                        : "box-border block mt-4 md:mt-6 text-left text-font-big leading-[30px] text-ink-muted",
                    cardType === "card" &&
                      "min-w-0 w-full max-w-full justify-self-stretch",
                    cardType !== "card" &&
                      sidebarColumnLayout &&
                      "w-full min-w-0 max-w-full shrink-0",
                    cardType !== "card" &&
                      !sidebarColumnLayout &&
                      "w-full min-w-0",
                    !sidebarColumnLayout &&
                      "w-full max-w-full basis-full shrink-0 text-left",
                  )}
                  data-variant={cardType}
                  role="listitem"
                  aria-label={
                    String(Headline?.value ?? "").trim() ||
                    QUICK_LINK_GROUP_LABELS.linkListRegionAria
                  }
                >
                  <Text
                    field={Headline ?? ({ value: "" } as TextField)}
                    tag="h3"
                    className={cn(
                      sidebarColumnLayout
                        ? "box-border block !m-0 !border-0 !p-0 font-media-tile text-font-big font-bold leading-font-media-tile-headline uppercase text-ink-tertiary [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]"
                        : "uppercase tracking-wide !my-0 text-ink-secondary text-font-normal font-bold block",
                    )}
                  />
                </div>
              )}
            {!stackedSidebarRailLayout &&
              visible.map((row, tileIndex) =>
                renderQuickLinkTile(
                  row,
                  tileIndex,
                  sidebarColumnLayout,
                  standaloneCard &&
                    cardType === "card" &&
                    tileIndex === 0 &&
                    visible.length > columnCount
                    ? "min-[768px]:col-span-full"
                    : undefined,
                ),
              )}
            {!stackedSidebarRailLayout &&
            showSupplementaryLinkList &&
            linkList != null &&
            linkList.length > 0 ? (
              <div
                key="__quick-link-group-link-list__"
                className={cn(
                  "component quick-link text-left",
                  cardType === "card" &&
                    "box-border block h-auto min-h-0 w-full min-w-0 max-w-full leading-[24px] text-ink-primary font-media-tile border-0 border-solid border-stroke-default [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]",
                  cardType !== "card" &&
                    cn(
                      "box-border block text-left text-font-big leading-[30px]",
                      sidebarColumnLayout ?
                        "w-full min-w-0 max-w-full mt-0"
                      : "mt-4 md:mt-6 text-ink-muted",
                    ),
                  cardType === "card" &&
                    "min-w-0 w-full max-w-full justify-self-stretch",
                  cardType !== "card" &&
                    sidebarColumnLayout &&
                    "w-full min-w-0 max-w-full shrink-0",
                  cardType !== "card" &&
                    !sidebarColumnLayout &&
                    "w-full min-w-0",
                )}
                role="listitem"
                aria-label={
                  String(Headline?.value ?? "").trim() ||
                  QUICK_LINK_GROUP_LABELS.linkListRegionAria
                }
                data-testid={QUICK_LINK_TILE_TEST_ID}
                data-variant={cardType}
                data-icon-position={iconPosition}
              >
                {(Headline?.value || isEditing) && (
                  <Text
                    field={Headline ?? ({ value: "" } as TextField)}
                    tag="h3"
                    className="uppercase tracking-wide !my-0 text-ink-secondary text-font-normal font-bold block"
                  />
                )}
                <ul className="!ml-0 !pb-0 !pt-2">{linkList}</ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
