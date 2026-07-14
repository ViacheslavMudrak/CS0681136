import {
  ManualNewsArticleListProps,
  ManualNewsArticleListVariant,
} from './ManualNewsArticleList.types';
import classNames from 'classnames/bind';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { JSX } from 'react';
import { formatDate } from 'src/util/helpers/date-helper';

import { Image, Link, Text, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';

import styles from './ManualNewsArticleList.module.scss';

const cx = classNames.bind(styles);
const ManualNewsArticleList = (
  props: ManualNewsArticleListProps & { variant?: ManualNewsArticleListVariant }
): JSX.Element => {
  const { fields, rendering, variant = 'Single' } = props;
  const hideImages = rendering.params?.hideImages === '1';
  let articleCount = 1;
  let containerClass = 'manual-news-listing__article-container--featured gap-8';
  let fixedHeightClass = 'h-[300px] md:h-[400px] min-h-[300px] md:min-h-[400px]';
  let imageContainerClass = 'manual-news-listing__image-link--featured' + 'flex md:flex-[0_0_40%]';
  let titleWrapperClass = 'manual-news-listing__article-text--featured';
  let dynamicWidthClass = 'manual-news-listing__article--featured' + ' flex flex-col md:flex-row';

  switch (variant) {
    case 'Single':
      break;
    case 'TwoAcross':
      articleCount = 2;
      containerClass = 'gap-6';
      fixedHeightClass = 'h-[300px] md:h-[400px] min-h-[300px] md:min-h-[400px]';
      imageContainerClass = 'manual-news-listing__image-link--two-articles w-full';
      titleWrapperClass = 'manual-news-listing__article-text--two-articles';
      dynamicWidthClass =
        'w-full md:basis-[calc(50%-12px)] md:max-w-[calc(50%-12px)] md:flex-none' +
        'manual-news-listing__article--two-articles' +
        ' flex flex-col';
      break;
    case 'ThreeAcross':
      articleCount = 3;
      containerClass = 'gap-4';
      fixedHeightClass = 'h-[260px] min-h-[260px]';
      imageContainerClass = '';
      titleWrapperClass = '';
      dynamicWidthClass =
        'w-full md:basis-[calc(33.333%-10.67px)] md:max-w-[calc(33.333%-10.67px)] md:flex-none' +
        ' flex flex-col';
      break;
    case 'FourAcross':
      articleCount = 4;
      containerClass = 'gap-4';
      fixedHeightClass = 'h-[190px] min-h-[190px]';
      imageContainerClass = '';
      titleWrapperClass = '';
      dynamicWidthClass =
        'w-full md:basis-[calc(25%-12px)] md:max-w-[calc(25%-12px)] md:flex-none' +
        ' flex flex-col';
    default:
      break;
  }

  const selectedArticles = fields?.selectedArticles?.slice(0, articleCount) || [];

  return (
    <div
      className={cx(
        'manual-news-listing',
        hideImages && 'manual-news-listing--hide-images',
        'component container flex flex-col gap-8',
        props.stylesSXA
      )}
    >
      <Text tag="h2" field={fields.sectionHeadline} />
      <div
        className={cx(
          'manual-news-listing__article-container',
          containerClass,
          'flex flex-col md:flex-row flex-wrap'
        )}
      >
        {selectedArticles?.map((article, index) => {
          return (
            <div
              key={article.id ?? index}
              className={cx('manual-news-listing__article', dynamicWidthClass)}
            >
              {!hideImages &&
                (variant === 'ThreeAcross' || variant === 'FourAcross' ? (
                  <Link
                    field={{ value: { href: article.url } }}
                    className={cx('manual-news-listing__image-link', fixedHeightClass, 'w-full')}
                  >
                    {article?.fields?.thumbnail && <Image field={article.fields.thumbnail} />}
                  </Link>
                ) : (
                  <div
                    className={cx(
                      'manual-news-listing__image-link',
                      fixedHeightClass,
                      imageContainerClass
                    )}
                  >
                    <Link
                      field={{ value: { href: article.url } }}
                      className={cx('manual-news-listing__image-link', fixedHeightClass, 'w-full')}
                    >
                      {article?.fields?.thumbnail && <Image field={article.fields.thumbnail} />}
                    </Link>
                  </div>
                ))}

              <div
                className={cx(
                  'manual-news-listing__article-text',
                  titleWrapperClass,
                  'flex flex-col'
                )}
              >
                <Link field={{ value: { href: article.url } }}>
                  <Text tag="h3" field={article?.fields?.title} />
                </Link>
                {article?.fields?.publishDate && article?.fields?.publishDate?.value && (
                  <span>{formatDate(article?.fields?.publishDate?.value)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Single = compose<ManualNewsArticleListProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(ManualNewsArticleList);

export const TwoAcross = compose<ManualNewsArticleListProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <ManualNewsArticleList variant="TwoAcross" {...props} />);

export const ThreeAcross = compose<ManualNewsArticleListProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <ManualNewsArticleList variant="ThreeAcross" {...props} />);

export const FourAcross = compose<ManualNewsArticleListProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <ManualNewsArticleList variant="FourAcross" {...props} />);

export default Single;
