import { JSX } from 'react';
import {
  useSitecore,
  withDatasourceCheck,
  Text,
  RichText,
  Link,
  Image,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';

import { HighlightPanelProps } from './HighlightPanel.types';

import styles from './HighlightPanel.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { createIconItem } from 'src/util/helpers/customLinkHelpers';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const HighlightPanel = (props: HighlightPanelProps): JSX.Element | null => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const imagesOnLeft = rendering.params?.imagesOnLeft === '1';
  const enableAscensionGraphicElement = rendering.params?.enableAscensionGraphicElement === '1';
  const graphicElementBackgroundSrc = enableAscensionGraphicElement
    ? page.layout.sitecore.context.defaultImages?.highlightPanelElementBackground?.value?.src
    : '';

  const datasource = fields.data.datasource;

  if ((!datasource || !datasource.children) && !isPageEditing) return null;
  if (!datasource) return null;

  const shouldRenderSubtext =
    Boolean(datasource.headlineSubtext?.jsonValue?.value) || isPageEditing;
  const shouldRenderButton =
    Boolean(datasource.headlineButton?.jsonValue?.value?.href) || isPageEditing;

  const ContentBlock = () => {
    const children = isPageEditing
      ? datasource.children.results
      : datasource.children.results.filter((item) => {
          const linkValue = item.textLink?.jsonValue?.value;
          const hasLink = Boolean(linkValue?.href || linkValue?.url);

          const hasAllRequiredFields =
            item.itemName?.jsonValue?.value && item.itemDescription?.jsonValue?.value && hasLink;

          return hasAllRequiredFields;
        });

    return (
      <>
        <Text
          tag="h2"
          field={datasource.headlineText.jsonValue}
          className={cx('highlight-panel__headline')}
        />
        {shouldRenderSubtext && (
          <RichText
            tag="div"
            className={cx('rich-text highlight-panel__subtext')}
            field={datasource.headlineSubtext.jsonValue}
          />
        )}
        {shouldRenderButton && (
          <Link
            className={cx('asc-btn', 'asc-btn--primary')}
            field={datasource.headlineButton.jsonValue}
          />
        )}

        <div className={cx('flex flex-col gap-10 mt-8')}>
          {children.map((item, i) => {
            const linkField = item.textLink?.jsonValue;
            const linkValue = linkField?.value;
            const shouldRenderLink = isPageEditing || Boolean(linkValue?.href || linkValue?.url);

            return (
              <div key={i} className={cx('flex flex-col gap-2')}>
                <div className={cx('flex items-center gap-2')}>
                  {item.itemIcon?.targetItem && (
                    <div className={cx('highlight-panel__icon-wrapper')}>
                      <MaterialIcon iconItem={createIconItem(item.itemIcon.targetItem)} />
                    </div>
                  )}
                  <Text field={item.itemName.jsonValue} tag="h6" />
                </div>

                <Text
                  field={item.itemDescription.jsonValue}
                  tag="p"
                  className={cx('highlight-panel__description')}
                />

                {/* FIX: Wrap Link + Icon (icon outside editable markup) */}
                {shouldRenderLink && (
                  <span className={cx('highlight-panel__text-link', 'flex items-center gap-1')}>
                    <Link field={linkField} />
                    <MaterialIcon name="East" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const ImagesBlock = () => (
    <div className={cx('highlight-panel__images-wrapper')}>
      {graphicElementBackgroundSrc && (
        <div
          className={cx('highlight-panel__bg-logo', {
            'highlight-panel__bg-logo--left': imagesOnLeft,
          })}
          style={{ backgroundImage: `url("${graphicElementBackgroundSrc}")` }}
        />
      )}
      <div className={cx('highlight-panel__images-container')}>
        <div
          className={cx('highlight-panel__image-container-one', {
            'highlight-panel__image-container-one--left': imagesOnLeft,
          })}
        >
          <div className={cx('highlight-panel__image-frame')}>
            <Image field={datasource.mainImageOne.jsonValue} />
          </div>
        </div>
        <div
          className={cx('highlight-panel__image-container-two', {
            'highlight-panel__image-container-two--left': imagesOnLeft,
          })}
        >
          <div className={cx('highlight-panel__image-frame')}>
            <Image field={datasource.mainImageTwo.jsonValue} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cx('highlight-panel', 'component', props.stylesSXA)}>
      <div className={cx('container flex flex-col md:flex-row gap-10 md:gap-15 md:items-stretch')}>
        <div className={cx('flex-1 md:flex-[1_1_60%]', imagesOnLeft ? 'md:order-1' : 'md:order-2')}>
          <ImagesBlock />
        </div>
        <div className={cx('flex-1 md:flex-[1_1_40%]', imagesOnLeft ? 'md:order-2' : 'md:order-1')}>
          <ContentBlock />
        </div>
      </div>
    </div>
  );
};

export default compose<HighlightPanelProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(HighlightPanel);
