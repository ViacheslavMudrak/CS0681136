import classNames from 'classnames/bind';
import { CustomLink } from 'components/common/CustomLink';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { useI18n } from 'next-localization';
import { JSX } from 'react';
import { useState, useEffect, useCallback } from 'react';
import scConfig from 'sitecore.config';

import {
  ComponentRendering,
  GetComponentServerProps,
  LayoutServiceData,
  Text,
  Link,
  Image,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';

import { GlobalFooter_GQL } from './GlobalFooter.graphql';
import styles from './GlobalFooter.module.scss';
import {
  GlobalFooterGraphQLResponse,
  GlobalFooterProps,
  GlobalFooterStatics,
} from './GlobalFooter.types';

const cx = classNames.bind(styles);

const GlobalFooter = (props: GlobalFooterProps): JSX.Element => {
  const { datasource, rendering } = props;
  const { t } = useI18n();

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleLinks = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    const handleResize = () => setOpenIndex(null);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Doing the scoll this way prevents a jump in Safari and ios
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!datasource) return <></>;

  const socialLinks = datasource?.socialIconLinks?.jsonValue || [];

  return (
    <div
      className={cx('global-footer', 'component', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div
        className={cx(
          'global-footer__container',
          'component container',
          'flex flex-col md:flex-row gap-6 md:gap-12'
        )}
      >
        <div
          className={cx(
            'global-footer__left-column',
            'flex flex-col flex-[1_1_40%] gap-[18px] md:gap-[42px]'
          )}
        >
          {datasource?.footerImageLink?.jsonValue?.value?.href ? (
            <Link
              field={datasource.footerImageLink.jsonValue}
              className={cx('global-footer__logo', 'flex')}
            >
              <Image field={datasource?.footerImage?.jsonValue} />
            </Link>
          ) : (
            <div className={cx('global-footer__logo', 'flex')}>
              <Image field={datasource?.footerImage?.jsonValue} />
            </div>
          )}

          <Text field={datasource?.footerMissionTagLine?.jsonValue} tag="p" />
          <div className={cx('global-footer__social-links', 'flex items-center gap-6')}>
            {socialLinks.map((link) => {
              const socialIcon = link.fields?.socialIcon;
              const socialLink = link.fields?.socialLink?.value;

              if (!socialIcon || !socialLink) return null;

              return (
                <Link key={link.id} field={socialLink}>
                  <MaterialIcon iconItem={socialIcon} className={cx('global-footer__icon')} />
                </Link>
              );
            })}
          </div>
        </div>
        <div
          className={cx(
            'global-footer__right-column',
            'flex flex-col md:flex-row w-full justify-between gap-6 md:gap-8 flex-[1_1_59%]'
          )}
        >
          {datasource?.children?.results?.map((group, index) => (
            <div
              key={index}
              className={cx('global-footer__links-container', 'flex flex-col gap-4 flex-[1_1_25]')}
            >
              <div
                className={cx('global-footer__links-header', 'flex justify-between')}
                onClick={() => toggleLinks(index)}
              >
                <Text field={group.footerColumnHeader?.jsonValue} tag="h4" />
                <MaterialIcon name={openIndex === index ? 'ExpandLess' : 'ExpandMore'} />
              </div>
              <div
                className={cx(
                  'global-footer__links',
                  'flex flex-col gap-6',
                  openIndex === index && 'is-open'
                )}
              >
                {group.children?.results?.map((link, i) => (
                  <Link key={i} field={link.menuItem?.jsonValue} />
                ))}
              </div>
            </div>
          ))}
          <div className={cx('global-footer__cta', 'flex-[1_1_50]')}>
            <button className={cx('', 'asc-btn asc-btn--outline')} onClick={scrollToTop}>
              <span>{t('GlobalFooterBackToTopText') || GlobalFooterStatics.BackToTopText}</span>
              <MaterialIcon name="KeyboardDoubleArrowUp" />
            </button>
          </div>
        </div>
      </div>
      <div className={cx('global-footer__footer-utilities', 'flex items-center')}>
        <div
          className={cx(
            'global-footer__footer-utilities-container',
            'container md:justify-between flex md:items-center flex-col md:gap-4 gap-8 md:flex-row'
          )}
        >
          <Text
            tag="span"
            field={datasource?.copyrightText?.jsonValue}
            className="flex order-2 md:order-1"
          />
          <div
            className={cx(
              'global-footer__footer-utility-links',
              'inline-flex md:flex flex-wrap md:flex-nowrap gap-2 md:gap-4 md:flex-col md:flex-row order-1 md:order-2'
            )}
          >
            {datasource?.legalLinks?.jsonValue?.map((link, i) => (
              <CustomLink key={i} item={link} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getComponentServerProps: GetComponentServerProps = async (
  rendering: ComponentRendering,
  layoutData: LayoutServiceData
) => {
  const graphQLClientFactory = createGraphQLClientFactory({ api: scConfig.api });
  const graphQLClient = graphQLClientFactory();
  const language = layoutData.sitecore.context.language || 'en';

  const response = await graphQLClient.request<GlobalFooterGraphQLResponse>(GlobalFooter_GQL, {
    datasource: rendering.dataSource,
    language,
  });

  return { datasource: response.datasource };
};

export default compose<GlobalFooterProps>(withDatasourceCheck(), withStyles())(GlobalFooter);
