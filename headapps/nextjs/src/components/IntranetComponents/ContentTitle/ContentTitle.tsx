import { JSX } from 'react';
import { Link, Text, RichText, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { ContentTitleProps } from './ContentTitle.types';
import styles from './ContentTitle.module.scss';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const ContentTitle = (props: ContentTitleProps): JSX.Element => {
  const { fields, stylesSXA } = props;

  return (
    <div className={cx('content-title', 'container', stylesSXA)}>
      <Text
        tag="span"
        className="font-whitney-semibold text-eyebrow block uppercase text-md mb-4 tracking-[1.25px]"
        field={fields.eyebrow}
      />

      <Text tag="h2" className="!text-brand-blue-1000 font-size-lg" field={fields.headline} />

      {fields.subtext && (
        <RichText tag="div" className={cx('body rich-text mb-4')} field={fields.subtext} />
      )}

      <Link field={fields.buttonLink} className={cx('asc-btn', 'asc-btn--outline')}></Link>
    </div>
  );
};

export const Default = compose<ContentTitleProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(ContentTitle);
