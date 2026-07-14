import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { useMemo, useState } from 'react';

import styles from '../../GlobalHeader.module.scss';

const cx = classNames.bind(styles);

type FavoritesIconListProps = {
  icons: string[];
  onSelect: (iconName: string) => void;
  searchPlaceholder?: string;
};

const FavoritesIconList = ({
  icons,
  onSelect,
  searchPlaceholder = 'Search for an icon',
}: FavoritesIconListProps) => {
  const [query, setQuery] = useState('');

  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return icons;
    return icons.filter((iconName) => iconName.toLowerCase().includes(normalizedQuery));
  }, [icons, query]);

  return (
    <>
      <div className={cx('global-header__add-icon-search', 'flex gap-4 py-2 px-2')}>
        <MaterialIcon name="SearchOutlined" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className={cx('global-header__favorite-icon-list', 'gap-4')}>
        {filteredIcons.map((iconName) => (
          <span
            key={iconName}
            className="block text-center cursor-pointer"
            onClick={() => onSelect(iconName)}
          >
            <MaterialIcon name={iconName} />
          </span>
        ))}
      </div>
    </>
  );
};

export default FavoritesIconList;
