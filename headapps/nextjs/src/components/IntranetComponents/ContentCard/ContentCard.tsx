import {
  Link,
  RichText,
  Text,
  useSitecore,
  withDatasourceCheck,
  Image,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { JSX } from 'react';

import styles from './ContentCard.module.scss';
import { ContentCardProps, ContentCardVariant } from './ContentCard.types';

const cx = classNames.bind(styles);

const ContentCard = (props: ContentCardProps & { variant?: ContentCardVariant }): JSX.Element => {
  const { fields, variant = 'Default' } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const imageClass = !(fields.image?.value?.src || fields.headlineIcon?.value) ? 'no_image' : '';
  const linkIcon = fields?.linkIcon && fields?.linkIcon?.value ? fields?.linkIcon?.value : 'East';

  if (variant === 'ReflectionResources') {
    return (
      <div className={cx('reflection-resources-card', 'flex flex-col gap-4', props.stylesSXA)}>
        <Text tag="h3" field={fields?.headline} />
        <RichText field={fields?.cardContent} />
        <Link className={cx('reflection-resources-card__link')} field={fields.buttonLink}>
          <span>{fields?.buttonLink?.value?.text}</span>
          <MaterialIcon name={linkIcon} />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cx(
        'content-card',
        'component rounded-3xl content-card',
        props.stylesSXA,
        imageClass
      )}
    >
      {fields.image?.value?.src ? (
        <div className={cx('flex content-card_image')}>
          <Image
            field={fields.image}
            className="md:block object-cover w-full rounded-tl-3xl rounded-tr-3xl"
          />
        </div>
      ) : fields.headlineIcon?.value ? (
        <div
          className={cx(
            'content-card_icon flex items-center justify-center rounded-tl-3xl rounded-tr-3xl'
          )}
        >
          <MaterialIcon name={fields.headlineIcon?.value} />
        </div>
      ) : (
        <></>
      )}
      <div className={cx('content-card_content')}>
        <div className="flex flex-col flex-1">
          {(fields.optionalEyebrow || isPageEditing) && (
            <Text
              tag="span"
              className={cx(
                'content-card__eyebrow',
                'font-whitney-semibold block uppercase text-md mb-4 tracking-[1.25px] content-card__eyebrow'
              )}
              field={fields.optionalEyebrow}
            />
          )}

          <Text tag="h3" className="" field={fields.headline} />
          <RichText
            tag="div"
            className={cx('body rich-text mb-4', isPageEditing && 'is-editing')}
            field={fields.cardContent}
          />
        </div>
        <Link
          field={fields.buttonLink}
          className={cx('asc-btn', 'asc-btn relative mt-auto self-start')}
        ></Link>
      </div>
    </div>
  );
};

export const Default = compose<ContentCardProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(ContentCard);

export const ReflectionResources = compose<ContentCardProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <ContentCard {...props} variant="ReflectionResources" />);

export default Default;
