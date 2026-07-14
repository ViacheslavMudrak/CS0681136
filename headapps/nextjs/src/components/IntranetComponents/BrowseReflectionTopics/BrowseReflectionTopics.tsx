import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { JSX } from 'react';

import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';

import styles from './BrowseReflectionTopics.module.scss';
import { BrowseReflectionTopicsProps } from './BrowseReflectionTopics.types';

const cx = classNames.bind(styles);

const BrowseReflectionTopics = (props: BrowseReflectionTopicsProps): JSX.Element => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;
  const reflectionLandingPageUrl =
    page?.layout?.sitecore?.context?.landingPageSettings?.reflectionLandingPage?.url ||
    '/reflections';
  const hasRequiredFields = fields?.label?.value && fields?.icon;

  if (!hasRequiredFields && !isEditing) {
    return <></>;
  }

  return (
    <div className={cx('browse-reflection-topics', 'component flex', props.stylesSXA)}>
      <div className={cx('browse-reflection-topics__container', 'container flex flex-col gap-4')}>
        <div className={cx('browse-reflection-topics__header', 'flex gap-2 items-center')}>
          {fields?.icon && (
            <MaterialIcon name={fields?.icon?.fields?.value?.value} aria-hidden="true" />
          )}
          <Text
            tag="h2"
            className={cx('browse-reflection-topics__title', 'eyebrow')}
            field={fields?.label}
          />
        </div>
        <div className={cx('browse-reflection-topics__topic-container', 'flex flex-wrap gap-3')}>
          {fields?.reflectionTopics?.map((topic, index) => {
            const targetUrl =
              `${reflectionLandingPageUrl}?f.reflections+tags=${topic?.fields?.title?.value}`.toLowerCase();
            return (
              <a key={index} href={targetUrl} className={cx('browse-reflection-topics__topic')}>
                {topic?.fields?.title.value}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default compose<BrowseReflectionTopicsProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(BrowseReflectionTopics);
