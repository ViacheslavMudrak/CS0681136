/**
 * Low-level wrapper for the Sitecore Search Discover REST API
 * Handles config, auth headers, and HTTP requests
 */

import type { DiscoverPayload, DiscoverWidgetItem } from '../types/discover';

const BASE = 'https://discover.sitecorecloud.io/discover/v2';

export function createPayload(
  items: DiscoverWidgetItem[],
  context?: Record<string, unknown>
): DiscoverPayload {
  return { widget: { items }, context };
}

function getConfig() {
  const customerKey = process.env.NEXT_PUBLIC_SITECORE_SEARCH_CUSTOMER_KEY;
  const apiKey =
    process.env.SITECORE_SEARCH_API_KEY ?? process.env.NEXT_PUBLIC_SITECORE_SEARCH_API_KEY;
  if (!customerKey || !apiKey) throw new Error('Sitecore Search config missing');
  const ckey = customerKey.split('-').pop() ?? customerKey;
  return { url: `${BASE}/${ckey}`, apiKey };
}

export async function post(payload: DiscoverPayload): Promise<Record<string, unknown>> {
  const { url, apiKey } = getConfig();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: apiKey },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Discover API ${res.status}: ${await res.text()}`);
  return res.json();
}
