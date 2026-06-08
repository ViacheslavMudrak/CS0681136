import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import type { LinkGroupProps } from './LinkGroup.type';
import {
  LINK_GROUP_LABELS,
  LINK_GROUP_ROOT_TEST_ID,
  linkGroupDescriptionMeaningful,
  linkGroupItemHasVisitorContent,
  normalizeLinkGroupColorScheme,
  readLinkGroupParamValue,
  resolveLinkGroupColumns,
} from './linkGroupUtils';
import { LinkGroupTile } from './partial/LinkGroupTile';
import { LinkGroupDescriptionRichText, LinkGroupSectionShell } from './partial/LinkGroupAtoms';

/** Block Link Group: optional title/description and a responsive grid of icon tiles. */
export function Default({ fields, params, page }: LinkGroupProps): JSX.Element | null {
  const safeParams = params ?? {};
  const paramsRecord = safeParams as Record<string, unknown>;
  const { styles, RenderingIdentifier } = safeParams;
  const anchorId = renderingAnchorIdProps(RenderingIdentifier);
  const isEditing = page?.mode?.isEditing ?? false;

  const colorScheme = normalizeLinkGroupColorScheme(
    readLinkGroupParamValue(paramsRecord, 'ColorScheme'),
  );

  if (!fields) {
    return (
      <LinkGroupSectionShell
        styles={styles}
        anchorProps={anchorId}
        sectionAriaLabel={LINK_GROUP_LABELS.sectionAria}
      >
        <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
          <div className="link-group-outer box-border w-full min-w-0 max-w-full mx-auto mb-4 max-[599px]:mx-0 px-[var(--layout-gutter-inline)] min-[600px]:max-[var(--link-group-max-width-compact)] min-[768px]:max-[var(--link-group-max-width-tablet)] min-[992px]:max-w-[var(--link-group-max-width-desktop)]">
            <span className="is-empty-hint">{LINK_GROUP_LABELS.emptyDatasource}</span>
          </div>
        </div>
      </LinkGroupSectionShell>
    );
  }

  const { Linkitems, Title, Description } = fields;
  const rawItems = Linkitems?.filter((item) => item?.fields) ?? [];
  const columns = resolveLinkGroupColumns(paramsRecord);

  const showParentTitle = Title != null && (String(Title.value ?? '').trim().length > 0 || isEditing);
  const showParentDescription =
    Description != null &&
    (linkGroupDescriptionMeaningful(Description) || isEditing);

  const visible = rawItems.filter((item) =>
    linkGroupItemHasVisitorContent(item.fields, isEditing),
  );

  if (visible.length === 0) {
    if (isEditing) {
      return (
        <LinkGroupSectionShell
          styles={styles}
          anchorProps={anchorId}
          sectionAriaLabel={LINK_GROUP_LABELS.sectionAria}
          testId={LINK_GROUP_ROOT_TEST_ID}
        >
          <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
            <div className="link-group-outer box-border w-full min-w-0 max-w-full mx-auto mb-4 max-[599px]:mx-0 px-[var(--layout-gutter-inline)] min-[600px]:max-[var(--link-group-max-width-compact)] min-[768px]:max-[var(--link-group-max-width-tablet)] min-[992px]:max-w-[var(--link-group-max-width-desktop)]">
              <div className="text-left">
                {showParentTitle && Title ?
                  <Text
                    field={Title}
                    tag="h2"
                    className="m-0 font-roboto text-font-extrabig text-ink-primary"
                  />
                : null}
                {showParentDescription && Description ?
                  <LinkGroupDescriptionRichText field={Description} colorScheme={colorScheme} />
                : null}
              </div>
              <span className="is-empty-hint mt-4 inline-block">{LINK_GROUP_LABELS.emptyList}</span>
            </div>
          </div>
        </LinkGroupSectionShell>
      );
    }
    return null;
  }

  return (
    <LinkGroupSectionShell
      styles={styles}
      anchorProps={anchorId}
      sectionAriaLabel={LINK_GROUP_LABELS.sectionAria}
      testId={LINK_GROUP_ROOT_TEST_ID}
    >
      <div className="component-content box-border m-0 min-w-0 w-full max-w-none">
        <div className="link-group-outer box-border w-full min-w-0 max-w-full mx-auto mb-4 max-[599px]:mx-0 px-[var(--layout-gutter-inline)] min-[600px]:max-[var(--link-group-max-width-compact)] min-[768px]:max-[var(--link-group-max-width-tablet)] min-[992px]:max-w-[var(--link-group-max-width-desktop)]">
          {showParentTitle || showParentDescription ?
            <header className="mb-8 md:mb-10 text-left">
              {showParentTitle && Title ?
                <Text
                  field={Title}
                  tag="h2"
                  className="m-0 font-roboto text-font-extrabig text-ink-primary"
                />
              : null}
              {showParentDescription && Description ?
                <LinkGroupDescriptionRichText field={Description} colorScheme={colorScheme} />
              : null}
            </header>
          : null}
          <div
            className={cn(
              'grid w-full grid-cols-1 gap-0',
              columns === 2 && 'md:grid-cols-2 md:gap-x-[48px] md:gap-y-0',
            )}
            role="list"
          >
            {visible.map((item) => (
              <div
                key={item.id}
                role="listitem"
                className={cn(
                  'min-w-0 w-full max-w-full mt-6 first:mt-0',
                  columns === 2 && 'md:[&:nth-child(2)]:mt-0 md:[&:nth-child(n+3)]:mt-6',
                )}
              >
                <LinkGroupTile
                  item={item}
                  colorScheme={colorScheme}
                  columns={columns}
                  textAlignClass="text-left"
                  isEditing={isEditing}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </LinkGroupSectionShell>
  );
}
