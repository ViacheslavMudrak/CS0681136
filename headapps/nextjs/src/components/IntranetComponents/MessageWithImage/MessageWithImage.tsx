import { JSX } from 'react';
import { Image, Text, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { MessageWithImageProps, MessageWithImageFields } from './MessageWithImage.types';

// CSS module styles
import styles from './MessageWithImage.module.scss';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const MessageWithImage = (props: MessageWithImageProps): JSX.Element => {
  const { rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const fields = rendering.fields as MessageWithImageFields;
  const showAscensionGraphic = rendering?.params?.enableAscensionGraphic === '1';

  const graphicBackgroundSrc = showAscensionGraphic
    ? page.layout.sitecore.context.defaultImages?.messageWithImageDefaultBackground?.value?.src
    : '';

  const hasContent = fields?.headline?.value && fields?.backgroundImage?.value?.src;

  // Don't render empty component in normal mode
  if (!hasContent && !isPageEditing) {
    return <></>;
  }

  return (
    <div
      className={cx('message-with-image', 'component container', props.stylesSXA)}
      id={rendering?.params?.RenderingIdentifier}
    >
      {/* Background Image */}
      {(fields?.backgroundImage?.value?.src || isPageEditing) && (
        <div className={cx('message-with-image__background')}>
          <Image
            field={fields?.backgroundImage}
            className={cx('message-with-image__background-image')}
          />
        </div>
      )}

      {/* Content Overlay */}
      {(hasContent || isPageEditing) && (
        <div className={cx('message-with-image__overlay')}>
          {(fields?.optionalEyebrow?.value || fields?.headline?.value || isPageEditing) && (
            <div className={cx('message-with-image__content')}>
              {(fields?.optionalEyebrow?.value || isPageEditing) && (
                <Text
                  tag="span"
                  className={cx('message-with-image__eyebrow', 'eyebrow')}
                  field={fields?.optionalEyebrow}
                />
              )}
              {(fields?.headline?.value || isPageEditing) && (
                <Text
                  tag="h2"
                  className={cx('message-with-image__headline')}
                  field={fields?.headline}
                />
              )}
            </div>
          )}

          {/* Ascension Graphic */}
          {showAscensionGraphic && graphicBackgroundSrc && (
            <div className={cx('message-with-image__graphic')}>
              <img
                src={graphicBackgroundSrc}
                alt="Ascension Graphic"
                className={cx('ascension-graphic')}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default compose<MessageWithImageProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(MessageWithImage);
