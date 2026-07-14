import { JSX } from 'react';
import {
  Link,
  RichText,
  Text,
  useSitecore,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { TextCardGridProps } from './TextCardGrid.types';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';

import styles from './TextCardGrid.module.scss';
import { useMediaQuery } from '@mui/material';
import { MediaQueryConstants } from 'src/util/const/material';
import { TextCardGridLayoutEnum } from 'ts/text-card-grid-layout';
import { createIconItem } from 'src/util/helpers/customLinkHelpers';
import { withJumplink } from 'lib/enhancers/withJumplink';
const cx = classNames.bind(styles);

const TextCardGrid = (props: TextCardGridProps): JSX.Element | null => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isMobile = useMediaQuery(MediaQueryConstants.Mobile);

  const cardsOnLeft = rendering.params?.tileOnLeft === '1';

  const columnLayout =
    (rendering.params?.columnLayout as TextCardGridLayoutEnum) ||
    TextCardGridLayoutEnum.ThreeColumn;
  const colClass: Record<TextCardGridLayoutEnum, string> = {
    [TextCardGridLayoutEnum.TwoColumn]: 'text-card-grid__tile-container--two-column',
    [TextCardGridLayoutEnum.ThreeColumn]: '',
  };

  const datasource = fields?.data?.datasource;

  const isPageEditing = page.mode.isEditing;

  if (!datasource && !isPageEditing) return null;

  if ((!datasource || !datasource.children) && !isPageEditing) return null;

  const validTiles = isPageEditing
    ? (datasource?.children?.results ?? [])
    : (datasource?.children?.results ?? []).filter((tile) => {
        return (
          tile.tileTitle?.jsonValue?.value &&
          tile.tileDescription?.jsonValue?.value &&
          tile.tileIcon?.targetItem
        );
      });

  return (
    <div className={cx('text-card-grid', 'component', props.stylesSXA)}>
      <div
        className={cx(
          'text-card-grid__container',
          {
            'text-card-grid__container--cards-left': cardsOnLeft,
          },
          'container component flex flex-col md:flex-row gap-8 items-start md:items-center'
        )}
      >
        {/* Left Block: Text Content */}
        <div className={cx('text-card-grid__content')}>
          <Text
            className="eyebrow text-eyebrow"
            tag="span"
            field={datasource.optionalEyebrow.jsonValue}
          />
          <Text
            className="text-card-grid__title"
            tag="h2"
            field={datasource.sectionHeadline.jsonValue}
          />
          <RichText
            className={cx('text-card-grid__description', 'rich-text')}
            field={datasource.sectionSubtext.jsonValue}
            tag="div"
          />
          <Link
            className={cx('asc-btn w-fit mt-4 block', {
              'asc-btn--primary': isMobile,
              'asc-btn--outline': !isMobile,
            })}
            field={datasource.headlineButton.jsonValue}
          />
        </div>

        {/* Right Block: Tile Grid */}
        <div className={cx('text-card-grid__tile-container', colClass[columnLayout])}>
          {validTiles.map((tile, index) =>
            tile.tileDestinationUrl.jsonValue?.value?.href ? (
              <Link
                key={`tile-${index}`}
                field={tile.tileDestinationUrl.jsonValue}
                className={cx('text-card-grid__tile')}
              >
                <div className="flex flex-col items-start gap-3">
                  {(tile.tileIcon?.targetItem || isPageEditing) && (
                    <div className={cx('text-card-grid__icon-wrapper')}>
                      <MaterialIcon
                        iconItem={createIconItem(tile.tileIcon.targetItem)}
                        className={cx('text-card-grid__icon')}
                      />
                    </div>
                  )}
                  <Text field={tile.tileTitle.jsonValue} tag="h3" />
                  <Text field={tile.tileDescription.jsonValue} tag="p" />
                </div>
              </Link>
            ) : (
              <div key={`tile-${index}`} className={cx('text-card-grid__tile')}>
                <div className="flex flex-col items-start gap-3">
                  {(tile.tileIcon?.targetItem || isPageEditing) && (
                    <div className={cx('text-card-grid__icon-wrapper')}>
                      <MaterialIcon
                        iconItem={createIconItem(tile.tileIcon.targetItem)}
                        className={cx('text-card-grid__icon')}
                      />
                    </div>
                  )}
                  <Text field={tile.tileTitle.jsonValue} tag="h3" />
                  <Text field={tile.tileDescription.jsonValue} tag="p" />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default compose<TextCardGridProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(TextCardGrid);
