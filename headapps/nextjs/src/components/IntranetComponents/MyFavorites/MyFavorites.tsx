import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { useUserFavorites } from 'lib/firebase/hooks/use-user-favorites';
import { useGlobalHeaderStore } from 'lib/zustand/globalheaderstore';
import { JSX, useMemo } from 'react';
import { DEFAULT_SITECORE_FOLDER_ID } from 'src/constants/favorites';

import { Text, withDatasourceCheck, useSitecore } from '@sitecore-content-sdk/nextjs';

import { defaultIconName } from '../GlobalHeader/FavoritesMenu/Constants';
import styles from './MyFavorites.module.scss';
import { MyFavoritesProps } from './MyFavorites.types';

const cx = classNames.bind(styles);

const MAX_TOP_FAVORITES = 7;

interface FavoriteTile {
  url?: string;
  icon?: string;
  title?: string;
}

const MyFavorites = (props: MyFavoritesProps): JSX.Element => {
  const { fields } = props;
  const { page } = useSitecore();
  const userDefaultSettings = page?.layout?.sitecore?.context?.userDefaultSettings;
  const sitecoreDefaults =
    userDefaultSettings?.targetItem?.defaultFavorites &&
    userDefaultSettings?.targetItem?.defaultFavorites?.targetItems &&
    userDefaultSettings?.targetItem?.defaultFavorites?.targetItems.length > 0
      ? userDefaultSettings?.targetItem?.defaultFavorites
      : fields.defaultFavorites;

  const { favorites, isLoadingFavorites } = useUserFavorites();
  const { openFavoritesMenu, openAddFavoriteMenu } = useGlobalHeaderStore();

  const handleAddFavoriteClick = () => {
    openFavoritesMenu();
    openAddFavoriteMenu();
  };

  const favoriteTiles = useMemo<FavoriteTile[]>(() => {
    if (isLoadingFavorites) return [];

    // If user has modified favorites, use Firebase data
    if (favorites?.isFavoritesModified) {
      const allFavorites = favorites?.favorites ?? [];
      return allFavorites
        .filter((fav) => fav.folder === DEFAULT_SITECORE_FOLDER_ID)
        .slice()
        .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
        .slice(0, MAX_TOP_FAVORITES)
        .map((fav) => ({
          url: fav.url,
          icon: fav.icon,
          title: fav.name,
        }));
    }

    // Otherwise fall back to Sitecore defaults
    return (
      sitecoreDefaults?.targetItems?.slice(0, MAX_TOP_FAVORITES).map((item) => ({
        url: item?.url?.url,
        icon: item?.icon?.targetItem?.value?.value,
        title: item?.name,
      })) ?? []
    );
  }, [favorites, isLoadingFavorites, sitecoreDefaults]);

  return (
    <div className={cx('my-favorites', 'component flex flex-col gap-6', props.stylesSXA)}>
      <div className={cx('my-favorites__header', 'flex justify-between')}>
        <div className={cx('my-favorites__title', 'flex gap-3 items-center')}>
          <Text tag="h2" field={fields.title} />
          <div className={cx('my-favorites__edit-icon')} onClick={openFavoritesMenu}>
            <MaterialIcon name="EditOutlined" />
          </div>
        </div>
        <div
          className={cx('my-favorites__see-all', 'flex items-center')}
          onClick={openFavoritesMenu}
        >
          <Text field={fields.seeAllFavoritesLinkText} tag="span" />
          <MaterialIcon name="East" />
        </div>
      </div>
      <div className={cx('my-favorites__favorite-tiles-container', 'flex gap-4 w-full')}>
        {favoriteTiles.map((item, index) => (
          <a
            key={index}
            target="_blank"
            href={item.url}
            className={cx(
              'my-favorites__favorite-tile',
              'flex-[1_1_0] flex flex-col items-start md:items-center gap-2 p-4 md:p-10 min-w-0 justify-start md:justify-center'
            )}
          >
            <MaterialIcon name={item.icon || defaultIconName} />
            <span>{item.title}</span>
          </a>
        ))}
        {favoriteTiles.length < MAX_TOP_FAVORITES && (
          <div
            className={cx(
              'my-favorites__add-a-favorite',
              'flex-[1_1_0] flex flex-col items-center gap-2 p-4 md:p-10 h-auto min-w-0 justify-center'
            )}
            onClick={handleAddFavoriteClick}
          >
            <MaterialIcon
              name={fields?.addFavoriteIcon?.value}
              className={cx('my-favorites__add-a-favorite-icon')}
            />
            <MaterialIcon
              name={fields?.addFavoriteIcon_hover?.value}
              className={cx('my-favorites__add-a-favorite-icon-hover')}
            />
            <Text tag="span" field={fields.addFavoriteText} />
          </div>
        )}
      </div>
    </div>
  );
};

export default compose<MyFavoritesProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(MyFavorites);
