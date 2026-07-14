import React from 'react';
import classNames from 'classnames/bind';

import type { ComponentProps as WithJumplinkProps } from 'lib/component-props';
import styles from './withJumplink.module.scss';

const cx = classNames.bind(styles);

/**
 * Converts a UUID or long string to a shortened ID without hyphens
 * @param id - The original ID (UUID or string)
 * @returns A shortened ID without hyphens (first 12 characters)
 */
function shortenId(id: string): string {
  if (!id) return '';
  // Remove hyphens and take first 12 characters
  return id.replace(/-/g, '').substring(0, 12);
}

export function withJumplink() {
  return function withJumplinkEnhancer<ComponentProps extends WithJumplinkProps>(
    Component: React.ComponentType<ComponentProps>
  ) {
    return function WithJumplink(props: ComponentProps) {
      const params = props.rendering?.params ?? {};

      // Jumplink icon is a droplist reference to the icon items
      // As a result, this will only support material icons, not custom SVG's
      // To suppport custom SVG's, we would need to cast the icon item to the IconItem type which would
      // require additional graphql calls. If needed, maybe add all icons to base layout as a lookup table?
      const jumpLinkIcon = params.jumpLinkIcon as string | undefined;

      // ID fallback priority:
      // 1. RenderingIdentifier (if configured by author, as expected)
      // 2. componentName-DynamicPlaceholderId (if both exist, friendlier jump title)
      // 3. rendering.uid (shortened)
      let renderingId = '';
      if (params.RenderingIdentifier) {
        renderingId = params.RenderingIdentifier;
      } else if (props.rendering?.componentName && props.rendering?.params?.DynamicPlaceholderId) {
        renderingId = `${props.rendering.componentName}-${props.rendering.params.DynamicPlaceholderId}`;
      } else if (props.rendering?.uid) {
        renderingId = shortenId(props.rendering.uid);
      }

      // If there is no icon, this component is not part of the jump links
      if (!jumpLinkIcon) {
        return (
          <section id={renderingId} className={cx('jumplink-section')}>
            <Component {...props} />
          </section>
        );
      }

      return (
        <section
          id={renderingId}
          className={cx('jumplink-section')}
          data-jumplink="true"
          data-jump-icon={jumpLinkIcon}
        >
          <Component {...props} />
        </section>
      );
    };
  };
}
