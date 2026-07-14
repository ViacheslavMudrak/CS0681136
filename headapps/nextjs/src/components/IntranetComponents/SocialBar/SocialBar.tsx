import { JSX } from 'react';
import { Link, Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { SocialBarProps } from './SocialBar.types';

// CSS module styles
import styles from './SocialBar.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const SocialBar = (props: SocialBarProps): JSX.Element => {
  const { fields } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  // Get social links
  const socialLinks = fields.socialIconLinks || [];

  // Fields are already proper Sitecore types
  const titleField = fields.headlineText;
  const linkField = fields.ctaTextLink;

  return (
    <div
      className={cx(
        'social-bar',
        'component container bg-brand-blue-1000 flex flex-col md:flex-row gap-14 md:gap-8',
        props.stylesSXA
      )}
    >
      <div
        className={cx(
          'social-bar__content',
          ' flex flex-col md:flex-row flex-[1_1_50%] items-start md:items-center gap-8'
        )}
      >
        {fields.socialBarIcon && (
          <MaterialIcon iconItem={fields.socialBarIcon} className={cx('social-bar__icon')} />
        )}
        <div className={cx('social-bar__content', ' flex flex-col gap-3')}>
          <Text field={titleField} tag="h2" />
          {(linkField?.value?.href || isPageEditing) && (
            <div className={cx('social-bar__content-link', 'flex gap-2 items-center')}>
              <Link className="uppercase text-sm tracking-[1.25px]" field={linkField} />
              <MaterialIcon name="East" />
            </div>
          )}
        </div>
      </div>
      <div
        className={cx(
          'social-bar__social-links',
          'flex items-center flex-[1_1_50%] md:justify-end gap-6'
        )}
      >
        {socialLinks.map((link) => {
          const socialIcon = link.fields?.socialIcon;
          const socialLink = link.fields?.socialLink?.value;

          if (!socialIcon || !socialLink) return null;

          return (
            <Link key={link.id} field={socialLink}>
              <MaterialIcon iconItem={socialIcon} className={cx('social-bar__icon')} />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export const Default = compose<SocialBarProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(SocialBar);

export default Default;
