import { JSX } from 'react';
import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import { ValuesProps, ValueCard } from './Values.types';

// CSS module styles
import styles from './Values.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { createIconItem } from 'src/util/helpers/customLinkHelpers';

const cx = classNames.bind(styles);

const Values = (props: ValuesProps): JSX.Element | null => {
  const { fields } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const datasource = fields?.data?.datasource;

  if (!datasource && !isPageEditing) return null;

  const children = isPageEditing
    ? fields.data.datasource.children.results
    : fields.data.datasource.children.results.filter((item: ValueCard) => {
        const hasAllRequiredFields =
          item.valueTitle?.jsonValue?.value && item.valueDescription?.jsonValue?.value;
        return hasAllRequiredFields;
      });

  return (
    <div className={cx('values', 'component', props.stylesSXA)}>
      <div className={cx('values__container', 'container flex flex-col gap-4')}>
        <Text tag="h2" field={datasource.title.jsonValue} />
        <Text tag="p" field={datasource.paragraph.jsonValue} />
        <div
          className={cx(
            'values__cards',
            'flex flex-wrap gap-6 md:gap-12 mt-4 md:mt-10 flex-col md:flex-row'
          )}
        >
          {children.map((card: ValueCard, index: number) => (
            <div
              key={index}
              className={cx('values__card', 'flex flex-col items-start gap-4 flex-[1_1_30%]')}
            >
              {card.valueIcon.targetItem && (
                <div className={cx('values__card-icon', 'flex justify-center')}>
                  <MaterialIcon iconItem={createIconItem(card.valueIcon.targetItem)} />
                </div>
              )}
              <Text tag="h3" field={card.valueTitle?.jsonValue} />
              <Text tag="span" field={card.valueDescription?.jsonValue} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default compose<ValuesProps>(withDatasourceCheck(), withStyles(), withJumplink())(Values);
