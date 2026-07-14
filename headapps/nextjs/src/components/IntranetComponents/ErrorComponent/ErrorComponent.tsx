import { Link, Text, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { JSX, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { ErrorComponentProps, ErrorComponentStatics } from './ErrorComponent.types';
import styles from './ErrorComponent.module.scss';
import { useI18n } from 'next-localization';
import GlobalSearchBarWidget from 'components/search/widgets/GlobalSearchBar';
import { useAccessDenied } from 'src/lib/contexts/AccessDeniedContext';

const cx = classNames.bind(styles);

const ErrorComponent = (props: ErrorComponentProps): JSX.Element => {
  const { fields, stylesSXA, rendering } = props;
  const { page } = useSitecore();
  const { t } = useI18n();
  const router = useRouter();
  const {
    requestAccess,
    returnUrl: contextReturnUrl,
    userEmail: contextUserEmail,
  } = useAccessDenied();

  const [showRequestAccess, setShowRequestAccess] = useState(false);
  const [returnUrl, setReturnUrl] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (requestAccess) {
      setShowRequestAccess(true);
    } else if (router.isReady) {
      setShowRequestAccess(router.query.requestAccess === 'true');
    }

    if (contextReturnUrl) {
      setReturnUrl(contextReturnUrl);
    } else if (router.isReady && router.query.returnUrl) {
      setReturnUrl(router.query.returnUrl as string);
    }

    if (contextUserEmail) {
      setUserEmail(contextUserEmail);
    }
  }, [router.isReady, router.query, requestAccess, contextReturnUrl, contextUserEmail]);

  const requestAccessField = useMemo(() => {
    const field = fields.requestAccessButton;
    if (!field?.value?.href?.startsWith('mailto:') || !returnUrl) return field;

    const base = field.value.href;
    const separator = base.includes('?') ? '&' : '?';
    const subject = encodeURIComponent(`Access Request for ${returnUrl}`);
    const bodyLines = [
      `Requesting access to page:`,
      returnUrl,
      ...(userEmail ? ['', `Requested by: ${userEmail}`] : []),
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));

    return {
      ...field,
      value: { ...field.value, href: `${base}${separator}subject=${subject}&body=${body}` },
    };
  }, [fields.requestAccessButton, returnUrl, userEmail]);

  const showSearchBar = rendering.params?.showSearchBar === '1';
  const isPageEditing = page.mode.isEditing;
  const hasLink = fields.buttonLink?.value?.href || fields.buttonLink?.value?.text;
  const dividerText = t('ErrorComponentDividerText') || ErrorComponentStatics.defaultDividerText;

  if (!hasLink && !isPageEditing) {
    return <></>;
  }

  return (
    <div className={cx('error-component', 'container', stylesSXA)}>
      <div className={cx('error-content')}>
        <Text tag="span" className={cx('eyebrow')} field={fields.eyebrow} />

        <Text tag="h1" className={cx('headline')} field={fields.componentHeadline} />

        <Text tag="p" className={cx('subtext')} field={fields.subtext} />

        {showSearchBar && (
          <>
            <div className={cx('search-bar-wrapper')}>
              <GlobalSearchBarWidget
                defaultItemsPerPage={5}
                rfkId={'global_search_ps'}
                placeholder={fields.searchBarPlaceholderText?.value || 'Search...'}
                itemRedirectionHandler={(article) => {
                  const searchTerm = article.name || article.title || '';
                  if (searchTerm) {
                    window.location.href =
                      article.url || `/search?q=${encodeURIComponent(searchTerm)}`;
                  }
                }}
                submitRedirectionHandler={(query) => {
                  if (query) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  }
                }}
                showRecentSuggestions={true}
                showTrendingSuggestions={true}
                showSearchWithin={false}
              />
            </div>

            <div className={cx('divider')}>
              <span className={cx('divider-text')}>{dividerText}</span>
            </div>
          </>
        )}

        <div className={cx('action-buttons')}>
          {showRequestAccess && requestAccessField?.value?.href && (
            <Link
              field={requestAccessField}
              className={cx('cta-button')}
              data-source-path={returnUrl}
            />
          )}

          <Link field={fields.buttonLink} className={cx('cta-button')} />
        </div>
      </div>
    </div>
  );
};

export default compose<ErrorComponentProps>(withDatasourceCheck(), withStyles())(ErrorComponent);
