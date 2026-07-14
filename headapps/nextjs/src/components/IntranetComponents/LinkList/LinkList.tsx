import { JSX } from 'react';
import { RichText, Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import React, { useState } from 'react';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { LinkListProps, LinkListVariant, VARIANT_CONFIG } from './LinkList.types';
import styles from './LinkList.module.scss';
import { CustomLink } from 'components/common/CustomLink';
import { CustomLinkItem } from 'ts/custom-link';
import { useMediaQuery } from '@mui/material';
import Button from '@mui/material/Button';
import { MediaQueryConstants } from 'src/util/const/material';
import { withJumplink } from 'lib/enhancers/withJumplink';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';

const cx = classNames.bind(styles);

const LinkListBase = (props: LinkListProps & { variant: LinkListVariant }): JSX.Element | null => {
  const { fields, rendering, stylesSXA, variant } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const variantConfig = VARIANT_CONFIG[variant];
  const isLeftAligned = variantConfig.shouldRenderDescription;

  // state for showing quick links on mobile
  const [visibleCount, setVisibleCount] = useState(7);
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);

  if (!fields && !isPageEditing) return null;

  const totalCount = fields?.links?.length ?? 0;

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (visibleCount >= totalCount) {
      setVisibleCount(7); // collapse back
    } else {
      setVisibleCount((prev) => Math.min(prev + 7, totalCount));
    }
    e.currentTarget.blur(); // immediately remove focus
  };

  const hasLinks = Array.isArray(fields?.links) && fields.links.length > 0;
  const shouldRenderEyebrow = Boolean(fields?.optionalEyebrow?.value) || isPageEditing;
  const shouldRenderHeadline = Boolean(fields?.headlineText?.value) || isPageEditing;
  const shouldRenderSubtext = Boolean(fields?.subtext?.value) || isPageEditing;

  if (!hasLinks && !isPageEditing) return null;

  const disableScrollbar = rendering.params?.disableScrollbarOverflow === '1';
  const applyWhiteBackground = rendering.params?.applyWhiteBackground === '1';

  const linkCount = fields?.links?.length ?? 0;
  const rows = Math.ceil(linkCount / variantConfig.desktopCols);
  const shouldScroll = !disableScrollbar && rows > 4;

  const renderLinkTile = (item: CustomLinkItem, index: number) => (
    <div key={index} className={cx('w-full')}>
      <CustomLink
        item={item}
        className={cx('w-full flex h-full')}
        linkClassName={cx(
          'link-list__tile',
          applyWhiteBackground && 'link-list--white-backgroud',
          'w-full flex p-5 bg-brand-blue-bglight rounded-3xl',
          variantConfig.tileLinkClass
        )}
        iconClassName={cx('link-list__tile-icon')}
        isPageEditing={isPageEditing}
        customLinkContent={(ctx) => {
          {
            /* Truncate long Title */
          }
          const originalText = ctx.linkField?.value?.text || '';
          const truncatedText =
            originalText.length > 60 ? `${originalText.substring(0, 60)}...` : originalText;
          return (
            <>
              <div
                className={cx(
                  'flex items-center gap-2 max-w-full',
                  isLeftAligned ? 'justify-start' : 'justify-center'
                )}
              >
                <div className={cx('flex-shrink-0 flex items-center justify-center')}>
                  <MaterialIcon iconItem={ctx.iconField} className={cx('link-list__tile-icon')} />
                </div>
                <Text
                  tag="div"
                  className={cx(
                    'min-w-0 flex items-center',
                    isLeftAligned ? 'flex-1 text-left' : 'text-center'
                  )}
                  field={
                    {
                      ...ctx.linkField,
                      value: truncatedText,
                    } as unknown as typeof fields.headlineText
                  }
                />
              </div>

              {/* Render Link Description based on variant) */}
              {variantConfig.shouldRenderDescription && item.fields.description && (
                <Text
                  tag="div"
                  className={cx('link-list__tile-description', 'text-sm line-clamp-2')}
                  field={item.fields.description}
                />
              )}
            </>
          );
        }}
      />
    </div>
  );

  const HeaderBlock = (
    <>
      {shouldRenderEyebrow && (
        <Text
          tag="span"
          className={'text-eyebrow eyebrow eyebrow-font-size'}
          field={fields.optionalEyebrow}
        />
      )}
      {shouldRenderHeadline && <Text tag="h2" field={fields.headlineText} />}
      {shouldRenderSubtext && (
        <RichText tag="div" className={cx('body rich-text mt-2')} field={fields.subtext} />
      )}
    </>
  );

  return (
    <div
      className={cx(
        'link-list',
        applyWhiteBackground && 'link-list--white-backgroud',
        'component',
        stylesSXA
      )}
    >
      <div className={cx('container flex gap-8', variantConfig.containerLayout)}>
        <div className={cx(variantConfig.contentWrapperClass)}>{HeaderBlock}</div>
        <div className={cx(variantConfig.wrapperClass)}>
          <div
            className={cx(
              'link-list__tile-container',
              variantConfig.gridColsClass,
              shouldScroll && 'md:overflow-y-auto px-2 pt-2 md:h-[335px]'
            )}
          >
            {(isMobile ? (fields?.links?.slice(0, visibleCount) ?? []) : (fields?.links ?? [])).map(
              (linkItem, idx) => renderLinkTile(linkItem, idx)
            )}
          </div>
          {/* Show button only on mobile and if >7 items */}
          {isMobile && totalCount > 7 && (
            <Button
              variant="plainText"
              sx={{ display: 'block', margin: '20px auto 0' }}
              onClick={handleToggle}
            >
              {visibleCount >= totalCount ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const HalfGrid = compose<LinkListProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <LinkListBase {...props} variant="HalfGrid" />);

export const FullGridFourColumn = compose<LinkListProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <LinkListBase {...props} variant="FullGridFourColumn" />);

export const FullGridThreeColumn = compose<LinkListProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <LinkListBase {...props} variant="FullGridThreeColumn" />);

export const TilesWithDescriptions = compose<LinkListProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <LinkListBase {...props} variant="TilesWithDescriptions" />);

export default HalfGrid;
