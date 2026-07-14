import { JSX } from 'react';
import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';

import { DetailHeroProps } from './DetailHero.types';
import styles from './DetailHero.module.scss';
import { getBasePageFields } from 'src/util/helpers/base-page-helper';

const cx = classNames.bind(styles);

const DetailHero = (props: DetailHeroProps): JSX.Element => {
  const { stylesSXA, rendering } = props;
  const { page } = useSitecore();
  const backgroundImageSrc = props.fields.backgroundImage?.fields?.image?.value?.src;

  const backgroundImageName = (props.fields.backgroundImage?.name ||
    props.fields.backgroundImage?.fields?.image?.value?.alt ||
    '') as string;

  const isDarkBackground = backgroundImageName.toLowerCase().includes('dark');

  const { title, pageIntroduction } = getBasePageFields(page);

  return (
    <div
      className={cx(
        'detail-hero',
        'component py-[20px] md:py-[40px] bg-no-repeat bg-bottom-right bg-cover bg-transparent',
        stylesSXA
      )}
      style={{ backgroundImage: `url("${backgroundImageSrc}")` }}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className={cx('content container')}>
        <Text
          tag="h1"
          className={cx('header', isDarkBackground ? 'text-white' : '')}
          field={title}
          editable={true}
        />

        <Text
          tag="p"
          className={cx(
            'subtext',
            'text-eyebrow',
            isDarkBackground ? 'text-white' : 'md:text-brand-gray-900'
          )}
          field={pageIntroduction}
          editable={true}
        />
      </div>
    </div>
  );
};

export default compose<DetailHeroProps>(withDatasourceCheck(), withStyles())(DetailHero);
