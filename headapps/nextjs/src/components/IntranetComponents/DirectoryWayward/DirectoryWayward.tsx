import { JSX, useState, FormEvent, ChangeEvent } from 'react';
import { Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { DirectoryWaywardProps } from './DirectoryWayward.types';
import { withJumplink } from 'lib/enhancers/withJumplink';

// CSS module styles
import styles from './DirectoryWayward.module.scss';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';

const cx = classNames.bind(styles);

const DirectoryWayward = (props: DirectoryWaywardProps): JSX.Element => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const headline = fields.headline;
  const searchPlaceholder = fields.searchBarPlaceholder?.value;
  const viewAllLink = fields.directorySearchPage;
  const viewAllLinkText = fields.viewAllLinkText;

  const isPageEditing = page.mode.isEditing;

  if (!headline?.value && !isPageEditing) {
    return <></>;
  }
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (viewAllLink?.url) {
      // Navigate to the configured directory page with search parameter
      const targetUrl = viewAllLink.url;
      if (searchValue.trim()) {
        // If there's search criteria, add it as a query parameter
        router.push(`${targetUrl}?q=${encodeURIComponent(searchValue.trim())}`);
      } else {
        // If no search criteria, just navigate to the page
        router.push(targetUrl);
      }
    }
  };

  const handleViewAllClick = () => {
    if (viewAllLink?.url) {
      router.push(viewAllLink.url);
    }
  };

  return (
    <section
      className={cx('directory-wayward', 'component', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className={cx('directory-wayward__container', 'container')}>
        {/* Component Title */}
        <div className={cx('directory-wayward__header')}>
          <Text tag="h2" className={cx('directory-wayward__title')} field={headline} />
        </div>

        {/* Search Bar */}
        <div className={cx('directory-wayward__search-wrapper')}>
          <form onSubmit={handleSearch} className={cx('directory-wayward__search-form')}>
            <div className={cx('directory-wayward__search-input-wrapper')}>
              <input
                type="text"
                className={cx('directory-wayward__search-input')}
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                aria-label="Search documents"
              />
              <button
                type="submit"
                className={cx('directory-wayward__search-button')}
                aria-label="Search"
              >
                <MaterialIcon name="search" className={cx('directory-wayward__search-icon')} />
              </button>
            </div>
          </form>
        </div>

        {/* View All Link */}
        <div className={cx('directory-wayward__view-all')}>
          {viewAllLink?.url && (
            <a
              href={viewAllLink.url}
              className={cx('directory-wayward__view-all-link')}
              onClick={(e) => {
                e.preventDefault();
                handleViewAllClick();
              }}
            >
              <Text field={viewAllLinkText} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default compose<DirectoryWaywardProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(DirectoryWayward);

export const Default = compose<DirectoryWaywardProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(DirectoryWayward);
