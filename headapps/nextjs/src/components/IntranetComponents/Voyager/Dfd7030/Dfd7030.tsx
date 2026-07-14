import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { Dfd7030Props } from './Dfd7030.types';
import { PLACEHOLDER_CONSTANTS } from 'src/constants/placeholders';

// CSS module styles
import styles from './Dfd7030.module.scss';

const cx = classNames.bind(styles);

const Dfd7030 = (props: Dfd7030Props): JSX.Element => {
  const { rendering } = props;
  const dynamic70PlaceholderKey = `${PLACEHOLDER_CONSTANTS.DFD70_CONTAINER_BASEKEY}-${props.params.DynamicPlaceholderId}`;
  const dynamic30PlaceholderKey = `${PLACEHOLDER_CONSTANTS.DFD30_CONTAINER_BASEKEY}-${props.params.DynamicPlaceholderId}`;

  return (
    <div
      className={cx(
        'dfd7030',
        'component container flex flex-col lg:flex-row gap-6 md:gap-10 lg:items-start',
        props.stylesSXA
      )}
    >
      <div
        className={cx(
          'dfd7030__seventy-column',
          'flex flex-[1_0_100%] lg:flex-[0_1_70%] lg:min-w-[70%] lg:self-start items-start'
        )}
      >
        <Placeholder name={dynamic70PlaceholderKey} rendering={rendering} />
      </div>
      <div
        className={cx(
          'dfd7030__thirty-column',
          'flex flex-[1_0_100%] lg:flex-[0_1_30%] lg:self-start items-start'
        )}
      >
        <Placeholder name={dynamic30PlaceholderKey} rendering={rendering} />
      </div>
    </div>
  );
};

export default compose<Dfd7030Props>(withStyles())(Dfd7030);
