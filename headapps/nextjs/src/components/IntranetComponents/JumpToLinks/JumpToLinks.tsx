import { JSX, useCallback, useEffect, useState } from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { JumpLinkItem, JumpToLinksProps, JumpToLinksStatics } from './JumpToLinks.types';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';

// CSS module styles
import styles from './JumpToLinks.module.scss';
import { useI18n } from 'next-localization';

const cx = classNames.bind(styles);

const JumpToLinks = (props: JumpToLinksProps): JSX.Element | null => {
  const { rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;
  const [jumpLinks, setJumpLinks] = useState<JumpLinkItem[]>([]);
  const { t } = useI18n();

  const collectJumpLinks = useCallback(() => {
    const jumplinkElements = document.querySelectorAll('[data-jumplink="true"]');
    const links: JumpLinkItem[] = [];

    jumplinkElements.forEach((element) => {
      const id = element.getAttribute('id');
      const icon = element.getAttribute('data-jump-icon');

      if (id && icon) {
        links.push({ id, icon });
      }
    });

    setJumpLinks(links);
  }, []);

  useEffect(() => {
    collectJumpLinks();

    const isJumplinkRelevant = (node: Node) =>
      node instanceof Element &&
      (node.hasAttribute?.('data-jumplink') || node.querySelector?.('[data-jumplink="true"]'));

    const observer = new MutationObserver((mutations) => {
      const hasRelevantChange = mutations.some((mutation) => {
        const added = Array.from(mutation.addedNodes).some(isJumplinkRelevant);
        const removed = Array.from(mutation.removedNodes).some(isJumplinkRelevant);
        return added || removed;
      });
      if (hasRelevantChange) {
        collectJumpLinks();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [collectJumpLinks]);

  const hideComponent = !jumpLinks || jumpLinks.length === 0;

  if (hideComponent) {
    if (isPageEditing) {
      return (
        <nav
          className={cx('jump-to-links', 'component md:hidden', props.stylesSXA)}
          id={rendering.params?.RenderingIdentifier}
        >
          <span className={cx('jump-to-links__label', '!whitespace-normal')}>
            {t('JumpToLinksAuthoringNote') || JumpToLinksStatics.authoringNote}
          </span>
        </nav>
      );
    } else {
      return null;
    }
  }

  const handleJumpClick = (id: string) => {
    const element = document.getElementById(id);
    window.dispatchEvent(
      new CustomEvent('jump-link-clicked', {
        detail: { id },
      })
    );
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      className={cx('jump-to-links', 'component md:hidden', props.stylesSXA)}
      id={rendering.params?.RenderingIdentifier}
    >
      <div className={cx('jump-to-links__container')}>
        <span className={cx('jump-to-links__label')}>
          {t('JumpToLinksJumpToLinkLabel') || JumpToLinksStatics.jumpToLinkLabel}
        </span>
        <div className={cx('jump-to-links__icons')}>
          {jumpLinks.map((link) => (
            <button
              key={link.id}
              className={cx('jump-to-links__icon-button')}
              onClick={() => handleJumpClick(link.id)}
              aria-label={`Jump to ${link.id}`}
            >
              <div className={cx('jump-to-links__icon-circle')}>
                <MaterialIcon name={link.icon} className={cx('jump-to-links__icon')} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default compose<JumpToLinksProps>(withStyles())(JumpToLinks);
