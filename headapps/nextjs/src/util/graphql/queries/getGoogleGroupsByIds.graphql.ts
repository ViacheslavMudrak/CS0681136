import { clientFactory } from 'src/lib/sitecore-client';
import { log } from 'src/util/helpers/log-helper';

const COMPONENT = 'getGoogleGroupEmailsByIds';

type SearchResultItem = {
  email: {
    jsonValue?: { value?: string };
  } | null;
  identifier: {
    jsonValue?: { value?: string };
  } | null;
};

type SearchResponse = {
  search: {
    total: number;
    results: SearchResultItem[];
  };
};

function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.toLowerCase().trim();
  return value.length > 0 ? value : null;
}

function buildSearchQuery(ids: string[]): string {
  const orClauses = ids
    .map((id) => `{ name: "_path", value: "${id}", operator: EQ }`)
    .join('\n        ');

  return `
    query GetVisibleByItems {
      search(
        where: {
          OR: [
            ${orClauses}
          ]
        }
        first: ${ids.length}
      ) {
        total
        results {
          email: field(name: "email") {
            jsonValue
          }
          identifier: field(name: "identifier") {
            jsonValue
          }
        }
      }
    }
  `;
}

export async function getGoogleGroupEmailsByIds(
  ids: string[],
  language: string
): Promise<string[]> {
  if (!ids.length) return [];

  const cleanedIds = ids
    .map((id) => id.trim().replace(/[{}]/g, ''))
    .filter(Boolean)
    .map((id) => `{${id}}`);

  log('INFO', COMPONENT, 'start', { idCount: cleanedIds.length, language });

  const edgeClient = clientFactory();
  const query = buildSearchQuery(cleanedIds);

  try {
    const data = await edgeClient.request<SearchResponse>(query);

    log('INFO', COMPONENT, 'search returned', { total: data.search.total });

    const emails: string[] = [];

    for (const result of data.search.results) {
      const emailValue = result.email?.jsonValue?.value;
      const identifierValue = result.identifier?.jsonValue?.value;
      const normalized = normalizeEmail(emailValue) ?? normalizeEmail(identifierValue);

      if (normalized) {
        emails.push(normalized);
      } else {
        log('ERROR', COMPONENT, 'no email field on item', { emailValue, identifierValue });
      }
    }

    const uniqueEmails = Array.from(new Set(emails));

    log('INFO', COMPONENT, 'resolved', { uniqueCount: uniqueEmails.length });

    return uniqueEmails;
  } catch (error) {
    log('ERROR', COMPONENT, 'search query failed', { error: String(error) });
    return [];
  }
}
