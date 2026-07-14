import classNames from 'classnames/bind';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { JSX } from 'react';
import { PLACEHOLDER_CONSTANTS } from 'src/constants/placeholders';
import { CardContainerLayoutEnum } from 'ts/card-container-layout';

import { Placeholder, Text, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';

import styles from './CardContainer.module.scss';
import { CardContainerProps, CardContainerVariant } from './CardContainer.types';

const cx = classNames.bind(styles);

const CardContainer = (
  props: CardContainerProps & { variant?: CardContainerVariant }
): JSX.Element => {
  const { fields, rendering, variant = 'LightTheme' } = props;

  const dynamicPlaceholderKey = `${PLACEHOLDER_CONSTANTS.CARDCONTAINER_BASEKEY}-${props.params.DynamicPlaceholderId}`;
  const cardLayout =
    (rendering.params?.cardLayout as CardContainerLayoutEnum) || CardContainerLayoutEnum.FullWidth;
  const gridClass: Record<CardContainerLayoutEnum, string> = {
    [CardContainerLayoutEnum.FullWidth]: 'md:grid-cols-1',
    [CardContainerLayoutEnum.HalfWidth]: 'md:grid-cols-2',
    [CardContainerLayoutEnum.ThirdWidth]: 'lg:grid-cols-3',
    [CardContainerLayoutEnum.QuarterWidth]: 'lg:grid-cols-4',
    [CardContainerLayoutEnum.FeaturedHorizontalSupporting]: 'md:grid-cols-2',
  };

  if (variant === 'ReflectionResources') {
    return (
      <div
        className={cx(
          'reflection-resources',
          'component container flex flex-col gap-4',
          props.stylesSXA
        )}
      >
        <div className={cx('reflection-resources__header', 'flex flex-col gap-4')}>
          <Text
            className={cx('reflection-resources__eyebrow', 'eyebrow eyebrow-font-size')}
            tag="span"
            field={fields.eyebrow}
          />
          <Text className={cx('reflection-resources__title')} tag="h2" field={fields.headline} />
        </div>
        <div className={cx('reflection-resources__cards', 'flex gap-8 flex-col md:flex-row')}>
          <Placeholder name={dynamicPlaceholderKey} rendering={rendering} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        'card-container',
        variant === 'DarkTheme' && 'card-container--dark-theme',
        'container component flex flex-col',
        props.stylesSXA
      )}
    >
      <Text
        className={cx('card-container__title')}
        field={fields.headline}
        tag="h2"
        editable={true}
      />
      <div className={cx('grid grid-cols-1 gap-8 md:gap-6', gridClass[cardLayout], cardLayout)}>
        <Placeholder name={dynamicPlaceholderKey} rendering={rendering} />
      </div>
    </div>
  );
};

export const LightTheme = compose<CardContainerProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(CardContainer);

export const DarkTheme = compose<CardContainerProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <CardContainer {...props} variant="DarkTheme" />);

export const ReflectionResources = compose<CardContainerProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <CardContainer {...props} variant="ReflectionResources" />);

export default LightTheme;
