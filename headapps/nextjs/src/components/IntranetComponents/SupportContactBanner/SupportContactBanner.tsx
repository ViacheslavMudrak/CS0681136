import { JSX } from 'react';
import { Link, Text, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { SupportContactBannerProps } from './SupportContactBanner.types';

// CSS module styles
import styles from './SupportContactBanner.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { createIconItem, sanitizeLinkHref } from 'src/util/helpers/customLinkHelpers';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const SupportContactBanner = (props: SupportContactBannerProps): JSX.Element | null => {
  const { fields } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const datasource = fields?.data?.datasource;

  if ((!datasource || !datasource.children) && !isPageEditing) return null;
  if (!datasource) return null;

  const headlineText = datasource.headlineText?.jsonValue?.value;
  const hideComponent = !headlineText && !isPageEditing;

  if (hideComponent) {
    return null;
  }

  return (
    <div className={cx('support-contact-banner', 'component', props.stylesSXA)}>
      <div
        className={cx(
          'support-contact-banner__container',
          'component container flex flex-col md:flex-row gap-6 md:items-center'
        )}
      >
        <div
          className={cx(
            'support-contact-banner__left-column',
            'flex flex-[1_1_70%] lg:flex-[1_1_75%] xl:flex-[1_1_80%] gap-6 flex-col md:flex-row md:items-center'
          )}
        >
          <MaterialIcon name="QuestionAnswer" />
          <div className={cx('support-contact-banner__content', 'flex flex-col')}>
            <Text
              className="eyebrow text-eyebrow eyebrow-font-size"
              tag="span"
              field={datasource.optionalEyebrow.jsonValue}
            />
            <Text
              field={datasource.headlineText.jsonValue}
              tag="h2"
              className="pr-0 md:pr-[50px] lg:pr-[200px]"
            />
          </div>
        </div>
        <div
          className={cx(
            'support-contact-banner__right-column',
            'flex flex-col flex-[1_1_30%] lg:flex-[1_1_25%] xl:flex-[1_1_20%] gap-4'
          )}
        >
          {(isPageEditing
            ? (datasource.children?.results ?? [])
            : (datasource.children?.results ?? []).filter((item) => {
                const hasContactName = Boolean(item.contactName?.jsonValue?.value);
                const hasLinkIcon = Boolean(item.linkIcon?.targetItem);
                return hasContactName && hasLinkIcon;
              })
          ).map((item, index) => {
            const hasLink = Boolean(item.linkUrl?.jsonValue?.value?.href) || isPageEditing;
            const hasLinkIcon = Boolean(item.linkIcon?.targetItem) || isPageEditing;

            return (
              <div
                key={index}
                className={cx('support-contact-banner__contact-content', 'flex flex-col')}
              >
                <Text
                  tag="span"
                  field={item.contactName.jsonValue}
                  className={cx(
                    'support-contact-banner__contact-eyebrow',
                    'eyebrow text-eyebrow eyebrow-font-size'
                  )}
                />
                <div className="flex items-center gap-2">
                  {hasLink && hasLinkIcon && (
                    <MaterialIcon iconItem={createIconItem(item.linkIcon.targetItem)} />
                  )}
                  {hasLink && <Link field={sanitizeLinkHref(item.linkUrl.jsonValue)} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default compose<SupportContactBannerProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(SupportContactBanner);
