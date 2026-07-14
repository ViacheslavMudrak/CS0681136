import type { ComponentType, JSX } from 'react';
import { createElement, Fragment, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { log } from 'src/util/helpers/log-helper';

type ApiEmailsResponse = { emails?: string[] };

type RenderProps = {
  rendering?: {
    componentName?: string;
    params?: Record<string, unknown>;
  };
} & Record<string, unknown>;

type VisibleByItemParam = {
  id?: string;
  fields?: {
    identifier?: { value?: string };
    email?: { value?: string };
    disableGroup?: { value?: boolean };
  };
};

const GK = 'GatedComponent';

// Cache stores resolved allowed-group emails
const allowedEmailsCache = new Map<string, string[]>();

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeEmail(value: unknown): string | null {
  if (!isNonEmptyString(value)) return null;
  const email = value.trim().toLowerCase();
  return email.length > 0 ? email : null;
}

function parseMultilistGuids(raw: string): string[] {
  return raw
    .split('|')
    .map((part) => part.trim().replace(/[{}]/g, ''))
    .filter(Boolean);
}

function buildCacheKey(ids: string[]): string {
  return ids.slice().sort().join('|');
}

function isExpandedItem(raw: unknown): raw is VisibleByItemParam {
  return typeof raw === 'object' && raw !== null && !Array.isArray(raw) && 'fields' in raw;
}

function parseExpandedEmail(raw: unknown): string | null {
  if (!isExpandedItem(raw)) return null;
  if (raw.fields?.disableGroup?.value === true) return null;
  return normalizeEmail(raw.fields?.email?.value);
}

async function fetchAllowedEmails(
  visibleByRaw: unknown,
  renderingName?: string
): Promise<string[]> {
  // Fast path: single expanded item — email is already available, no API call needed
  const expandedEmail = parseExpandedEmail(visibleByRaw);
  if (expandedEmail) {
    log('INFO', GK, 'allowed emails from expanded param', { expandedEmail }, true);
    return [expandedEmail];
  }

  // Slow path: pipe-separated GUIDs — resolve via API
  if (!isNonEmptyString(visibleByRaw)) return [];

  const ids = parseMultilistGuids(visibleByRaw);
  if (ids.length === 0) return [];

  const cacheKey = buildCacheKey(ids);
  const cached = allowedEmailsCache.get(cacheKey);
  if (cached !== undefined) {
    log('INFO', GK, 'allowed cache hit', { cacheKey }, true);
    return cached;
  }

  log('INFO', GK, 'allowed cache miss — fetching via API', { cacheKey, ids }, true);

  try {
    const itemIdsWithBraces = ids.map((id) => `{${id}}`);

    const response = await fetch('/api/gated-checks/get-sitecore-groups-by-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: itemIdsWithBraces, renderingName }),
    });

    const data = (await response.json()) as ApiEmailsResponse;

    const emails = (data.emails ?? [])
      .map((e) => normalizeEmail(e))
      .filter((e): e is string => Boolean(e));

    log('INFO', GK, 'allowed-emails API resolved', { count: emails.length, emails }, true);

    // Only cache non-empty results — avoid permanently caching transient failures
    if (emails.length > 0) {
      allowedEmailsCache.set(cacheKey, emails);
    }

    return emails;
  } catch (error) {
    log('ERROR', GK, 'allowed-emails API failed', { error: String(error) }, true);
    return [];
  }
}

function isAuthoringContext(): boolean {
  if (typeof window === 'undefined') return false;

  const path = window.location.pathname ?? '';
  const search = window.location.search ?? '';

  return (
    path.startsWith('/sitecore') ||
    search.includes('sc_mode=edit') ||
    search.includes('sc_mode=preview')
  );
}

function buildVisibleByCacheKey(raw: unknown): string {
  const expandedEmail = parseExpandedEmail(raw);
  if (expandedEmail) return expandedEmail;
  if (!isNonEmptyString(raw)) return '';
  return buildCacheKey(parseMultilistGuids(raw));
}

function hasVisibleByConfig(raw: unknown): boolean {
  if (isExpandedItem(raw)) return Boolean(raw.fields?.email?.value);
  return isNonEmptyString(raw) && parseMultilistGuids(raw).length > 0;
}

export function withGatedComponent() {
  return function withGatedComponentEnhancer<P extends RenderProps>(Component: ComponentType<P>) {
    return function WithGatedComponent(props: P): JSX.Element {
      const { data: session, status: sessionStatus } = useSession();

      const visibleByRaw =
        props?.rendering?.params?.VisibleBy ?? props?.rendering?.params?.visibleBy;

      const visibleByCacheKey = buildVisibleByCacheKey(visibleByRaw);
      const isGated = hasVisibleByConfig(visibleByRaw);

      const cacheKeyRef = useRef(visibleByCacheKey);
      cacheKeyRef.current = visibleByCacheKey;

      const authoring = isAuthoringContext();

      // User group emails come directly from the session — no API call needed
      const userGroupEmails = (session?.googleGroups ?? [])
        .map((g) => normalizeEmail(g.email))
        .filter((e): e is string => Boolean(e));

      const [allowedState, setAllowedState] = useState<{
        allowedGroupEmails: string[] | null;
        loadedForKey: string | null;
      }>({ allowedGroupEmails: null, loadedForKey: null });

      useEffect(() => {
        if (authoring || !isGated) {
          return;
        }

        // Don't reload if we already have data for this exact VisibleBy config
        if (allowedState.loadedForKey === visibleByCacheKey) {
          return;
        }

        let didCancel = false;

        async function loadAllowedEmails(): Promise<void> {
          try {
            const componentName = props?.rendering?.componentName || 'Unknown';
            const allowedEmails = await fetchAllowedEmails(visibleByRaw, componentName);

            if (!didCancel) {
              const allowedSet = new Set(allowedEmails.map((e) => e.toLowerCase().trim()));
              const userSet = new Set(userGroupEmails);
              const hasAccess = Array.from(userSet).some((email) => allowedSet.has(email));

              log(
                'INFO',
                GK,
                'access decision',
                {
                  hasAccess,
                  allowedSet: Array.from(allowedSet).join(','),
                  userSet: Array.from(userSet).join(','),
                  wrappedComponent: props?.rendering?.componentName || 'Unknown',
                },
                true
              );

              setAllowedState({
                allowedGroupEmails: allowedEmails,
                loadedForKey: cacheKeyRef.current,
              });
            }
          } catch (error) {
            log('ERROR', GK, 'loadAllowedEmails failed', { error: String(error) }, true);
            if (!didCancel) {
              setAllowedState({
                allowedGroupEmails: [],
                loadedForKey: cacheKeyRef.current,
              });
            }
          }
        }

        void loadAllowedEmails();

        return () => {
          didCancel = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [visibleByCacheKey, authoring]);

      const renderWrapped = () => createElement(Component, props);

      // Always allow in authoring contexts
      if (authoring) return renderWrapped();

      // No VisibleBy configured => not gated
      if (!isGated) return renderWrapped();

      // Session still loading — prevent flash of gated content
      if (sessionStatus === 'loading') return createElement(Fragment, null);

      // Unauthenticated users never see gated content
      if (sessionStatus === 'unauthenticated') return createElement(Fragment, null);

      // Allowed-group data not yet resolved
      const { allowedGroupEmails } = allowedState;
      if (allowedGroupEmails === null) return createElement(Fragment, null);

      const allowedSet = new Set(allowedGroupEmails.map((e) => e.toLowerCase().trim()));
      const hasAccess = userGroupEmails.some((email) => allowedSet.has(email));

      if (!hasAccess) return createElement(Fragment, null);

      return renderWrapped();
    };
  };
}
