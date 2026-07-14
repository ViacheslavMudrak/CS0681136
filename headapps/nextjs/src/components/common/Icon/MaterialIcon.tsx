import styles from './MaterialIcon.module.scss';
import classNames from 'classnames/bind';
import { IconItem } from 'ts/custom-link';
import { extractIconFromItem } from 'src/util/helpers/customLinkHelpers';

const cx = classNames.bind(styles);

type IconVariant = 'outlined';

function parseIconName(name: string): { baseName: string; variant: IconVariant } {
  if (name.endsWith('Outlined')) {
    return { baseName: name.replace('Outlined', ''), variant: 'outlined' };
  }
  return { baseName: name, variant: 'outlined' };
}

function toSnakeCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

export function MaterialIcon({
  iconItem,
  name,
  className,
}: {
  iconItem?: IconItem;
  name?: string;
  className?: string;
}) {
  // Handle backward compatibility - if name is provided, create a simple icon
  if (name && !iconItem) {
    const { baseName, variant } = parseIconName(name);
    const iconClass = `material-icons-${variant}`;
    const textValue = toSnakeCase(baseName);

    return <i className={cx('material-icon', iconClass, className ?? '')}>{textValue}</i>;
  }

  if (iconItem) {
    const { iconName, customSvg } = extractIconFromItem(iconItem);

    if (customSvg) {
      return (
        <div
          className={cx('material-icon', 'custom-svg', className ?? '')}
          dangerouslySetInnerHTML={{ __html: customSvg }}
        />
      );
    }

    const { baseName, variant } = parseIconName(iconName);
    const iconClass = `material-icons-${variant}`;
    const textValue = toSnakeCase(baseName);
    return <i className={cx('material-icon', iconClass, className ?? '')}>{textValue}</i>;
  }

  return null;
}
