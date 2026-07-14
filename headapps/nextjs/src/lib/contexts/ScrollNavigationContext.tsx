'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

interface ScrollNavigationContextValue {
  showMainNav: boolean;
}

const ScrollNavigationContext = createContext<ScrollNavigationContextValue>({
  showMainNav: true,
});

const SCROLL_THRESHOLD = 10;
const SCROLL_DEBOUNCE_MS = 50;
const HIDE_AFTER_SCROLL_PX = 80;

export function useScrollNavigation(): ScrollNavigationContextValue {
  return useContext(ScrollNavigationContext);
}

interface ScrollNavigationProviderProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function ScrollNavigationProvider({
  children,
  className = '',
  disabled = false,
}: ScrollNavigationProviderProps): React.ReactElement {
  const [showMainNav, setShowMainNav] = useState(true);
  const lastScrollYRef = useRef(0);

  useLayoutEffect(() => {
    const provider = document.getElementsByClassName('scroll-navigation-provider')[0] as
      | HTMLElement
      | undefined;
    if (!provider) return;

    const syncHeights = () => {
      const header = document.getElementsByClassName('global-header')[0];
      const notifications = document.getElementsByClassName('global-notification-banner')[0];
      const jumpTo = document.getElementsByClassName('jump-to-links')[0];
      provider.style.setProperty(
        '--header-main-nav-height',
        `${header?.getBoundingClientRect().height ?? 0}px`
      );
      provider.style.setProperty(
        '--header-notifications-height',
        `${notifications?.getBoundingClientRect().height ?? 0}px`
      );
      provider.style.setProperty(
        '--header-jump-to-height',
        `${jumpTo?.getBoundingClientRect().height ?? 0}px`
      );
    };

    syncHeights();
    const retryTimer = setTimeout(syncHeights, 300);
    const resizeObserver = new ResizeObserver(syncHeights);
    const header = document.getElementsByClassName('global-header')[0];
    const notifications = document.getElementsByClassName('global-notification-banner')[0];
    const jumpTo = document.getElementsByClassName('jump-to-links')[0];
    if (header) {
      resizeObserver.observe(header);
    }
    if (jumpTo) {
      resizeObserver.observe(jumpTo);
    }
    if (notifications) {
      resizeObserver.observe(notifications);
    }
    window.addEventListener('resize', syncHeights);

    return () => {
      clearTimeout(retryTimer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncHeights);
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      setShowMainNav(true);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      if (document.body.classList.contains('global-header-menu-open')) {
        return;
      }

      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const lastScrollY = lastScrollYRef.current;

        if (Math.abs(currentScrollY - lastScrollY) < SCROLL_THRESHOLD) {
          return;
        }

        if (currentScrollY > lastScrollY && currentScrollY > HIDE_AFTER_SCROLL_PX) {
          setShowMainNav(false);
        } else {
          setShowMainNav(true);
        }

        lastScrollYRef.current = currentScrollY;
      }, SCROLL_DEBOUNCE_MS);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timeoutId);
    };
  }, [disabled]);

  const headerClass = showMainNav ? '' : 'header--main-nav-hidden';

  return (
    <ScrollNavigationContext.Provider value={{ showMainNav }}>
      <div className={`scroll-navigation-provider ${headerClass} ${className}`.trim()}>
        {children}
      </div>
    </ScrollNavigationContext.Provider>
  );
}
