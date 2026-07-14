import { JSX } from 'react';
import { Text, Image, useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { withJumplink } from 'lib/enhancers/withJumplink';

import type { CollabSiteHeroProps, CollabSpacePageFields } from './CollabSiteHero.types';
import styles from './CollabSiteHero.module.scss';

const cx = classNames.bind(styles);

const CollabSiteHero = (props: CollabSiteHeroProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;

  // Collab Space name & description are page-level fields on the Collab Space Site Home template
  const pageFields = page.layout.sitecore.route?.fields as CollabSpacePageFields | undefined;

  const thumbnailField = pageFields?.collabSpaceThumbnail?.value;
  const fallbackCollabSiteCardImageField =
    page.layout.sitecore.context.defaultImages?.collabSiteListingPlaceholderCardImage?.value;

  const backgroundImageSrc =
    page.layout.sitecore.context.defaultImages?.collabSiteHeroBackground?.value?.src;

  const isFallbackThumbnail =
    !pageFields?.collabSpaceThumbnail?.value?.src && !!fallbackCollabSiteCardImageField?.src;

  const hasTitle = !!pageFields?.collabSpaceName?.value;
  const hasDescription = !!pageFields?.collabSpaceDescription?.value;

  if (
    !isEditing &&
    (!hasTitle || (!thumbnailField?.src && !fallbackCollabSiteCardImageField?.src))
  ) {
    return <></>;
  }

  return (
    <div
      style={
        backgroundImageSrc ? { ['--bg-image' as string]: `url(${backgroundImageSrc})` } : undefined
      }
      className={cx('collab-site-hero', 'component', props.stylesSXA)}
    >
      <div
        className={cx(
          'collab-site-hero__container',
          'container flex flex-col md:flex-row gap-8 md:gap-16'
        )}
      >
        {isEditing ? (
          <div className={cx('collab-site-hero__image', 'flex')}>
            <Image field={pageFields?.collabSpaceThumbnail} referrerPolicy="no-referrer" />
          </div>
        ) : (
          <div className={cx('collab-site-hero__image', 'flex')}>
            <Image
              field={isFallbackThumbnail ? fallbackCollabSiteCardImageField : thumbnailField}
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div className={cx('collab-site-hero__content', 'flex flex-col gap-4 justify-center')}>
          <Text tag="h2" field={pageFields?.collabSpaceName} editable={true} />
          {(hasDescription || isEditing) && (
            <Text tag="p" field={pageFields?.collabSpaceDescription} editable={true} />
          )}
        </div>
      </div>
    </div>
  );
};

export default compose<CollabSiteHeroProps>(withStyles(), withJumplink())(CollabSiteHero);
