import { JSX } from 'react';
import { RichText, Text, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';
import { AboutTextProps } from './AboutText.types';

// CSS module styles
import styles from './AboutText.module.scss';

const cx = classNames.bind(styles);

const AboutText = (props: AboutTextProps): JSX.Element => {
  const { fields } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const textOnLeft = props.rendering.params?.textOnLeft === '1' ? 'about-text--text-left' : '';

  const hasContent = fields.headline?.value && fields.body?.value;

  // Don't render empty component in normal mode
  if (!hasContent && !isPageEditing) {
    return <></>;
  }

  return (
    <div
      className={cx(
        'about-text',
        'component container flex flex-col md:flex-row gap-4',
        textOnLeft,
        props.stylesSXA
      )}
    >
      <Text
        tag="h2"
        field={fields.headline}
        className={cx('about-text__title', 'flex md:flex-[1_0_30%]')}
      />
      <div className={cx('about-text__content', 'flex flex-col md:flex-[1_0_70%] gap-4')}>
        <Text tag="h4" field={fields.subHeadline} />
        <RichText field={fields.body} />
      </div>
    </div>
  );
};

export default compose<AboutTextProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(AboutText);
