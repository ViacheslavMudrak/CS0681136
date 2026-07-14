import { JSX } from 'react';
import {
  Image,
  Link,
  RichText,
  Text,
  withDatasourceCheck,
  useSitecore,
  DateField,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { FeaturedContentBlockProps } from './FeaturedContentBlock.types';

// CSS module styles
import styles from './FeaturedContentBlock.module.scss';
import { withJumplink } from 'lib/enhancers/withJumplink';

import { formatDate } from 'src/util/helpers/date-helper';

const cx = classNames.bind(styles);

const FeaturedContentBlock = (
  props: FeaturedContentBlockProps & { variant?: 'SeventyThirty' | 'FiftyFifty' }
): JSX.Element => {
  const { fields, variant = 'SeventyThirty' } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;

  // Hide component if required fields are missing to prevent ghost elements (but not in edit mode)
  const hasRequiredFields =
    fields.blockContent?.value &&
    fields.desktopImage?.value?.src &&
    fields.mobileImage?.value?.src &&
    fields.buttonLink?.value?.href;

  if (!hasRequiredFields && !isEditing) {
    return <></>;
  }

  //Change class depending on if the image is on the right or left
  const imageOnLeft =
    props.rendering.params?.imageOnLeft === '1' ? 'featured-content-block--image-left' : '';
  const fullWidth =
    props.rendering.params?.fullWidth === '1' ? 'featured-content-block--full-width' : '';

  return (
    <div
      className={cx(
        'featured-content-block',
        'component bg-brand-blue-bglight overflow-hidden',
        !fullWidth && 'container',
        variant === 'SeventyThirty' && 'featured-content-block--70-30',
        variant === 'FiftyFifty' && 'featured-content-block--50-50',
        fullWidth,
        props.stylesSXA
      )}
    >
      <div
        className={cx(
          'featured-content-block__column-container',
          'flex flex-col flex-col-reverse md:flex-row',
          imageOnLeft
        )}
      >
        <div
          className={cx(
            'featured-content-block__content',
            'flex flex-col flex py-[32px] px-[16px] md:p-[80px] ',
            props.stylesSXA
          )}
        >
          <Text
            tag="span"
            field={fields.optionalTag}
            className="eyebrow text-eyebrow eyebrow-font-size"
          />
          <Text
            className={cx({ title: true })}
            field={fields.headlineText}
            tag="h2"
            editable={true}
          />
          <RichText className={cx('body rich-text')} field={fields.blockContent} tag="div" />
          {(fields.publishedDate?.value || isEditing) && (
            <div className={cx('featured-content-block__date', '')}>
              <DateField
                field={fields.publishedDate}
                tag="span"
                className=""
                render={() => formatDate(fields.publishedDate?.value)}
              />
            </div>
          )}
          <Link className="asc-btn asc-btn--primary w-fit" field={fields.buttonLink} />
        </div>
        <div className={cx('featured-content-block__image', 'flex')}>
          <Image field={fields.desktopImage} className="hidden md:block object-cover w-full" />
          <Image
            field={fields.mobileImage}
            className="block md:hidden object-cover w-full max-h-[400px]"
          />
        </div>
      </div>
    </div>
  );
};

export const SeventyThirty = compose<FeaturedContentBlockProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(FeaturedContentBlock);

export const FiftyFifty = compose<FeaturedContentBlockProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <FeaturedContentBlock {...props} variant="FiftyFifty" />);

export default SeventyThirty;
