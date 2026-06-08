import client from 'lib/sitecore-client';
import scConfig from 'sitecore.config';

export const dynamic = 'force-dynamic';

/** Sitecore folder that contains country items (Droplink source). */
const COUNTRY_DATA_PATH = 'D990BEE66EE2489FA3B1447ABACC852D';

/** Country item template ID for the GetCountry GraphQL query. */
const COUNTRY_TEMPLATE_ID = 'B789358922D34DEFABFCDA55E5AC4D4C';

const GET_COUNTRY_QUERY = `
  query GetCountry($language: String!, $path: String!, $templates: String!) {
    search(
      where: {
        AND: [
          { name: "_language", value: $language, operator: EQ }
          { name: "_path", value: $path, operator: CONTAINS }
          { name: "_templates", value: $templates, operator: CONTAINS }
        ]
      }
      orderBy: { direction: ASC, name: "name" }
      first: 250
    ) {
      results {
        label: name
        value: name
      }
    }
  }
`;

interface CountryResult {
  label: string;
  value: string;
}

interface GetCountryResponse {
  search?: {
    results: CountryResult[];
  };
}

/**
 * GET /api/getcountries
 *
 * Returns country options from Sitecore Experience Edge GraphQL (`GetCountry` query).
 * Uses the shared SitecoreClient (SITECORE_EDGE_CONTEXT_ID from sitecore.config).
 * Optional URL query param: `language` (defaults to site language or `en`).
 */
export async function GET(request: Request): Promise<Response> {
  const contextId =
    scConfig.api.edge?.contextId || scConfig.api.edge?.clientContextId;
  if (!contextId) {
    return Response.json(
      {
        error:
          'Sitecore Edge is not configured. Set SITECORE_EDGE_CONTEXT_ID in .env.local or Vercel Environment Variables.',
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const language =
    searchParams.get('language') ??
    scConfig.defaultLanguage ??
    'en';

  try {
    const data = await client.getData<GetCountryResponse>(GET_COUNTRY_QUERY, {
      language,
      path: COUNTRY_DATA_PATH,
      templates: COUNTRY_TEMPLATE_ID,
    });

    return Response.json(data.search?.results ?? []);
  } catch (error) {
    console.error('Failed to fetch countries from Sitecore GraphQL', error);
    return Response.json(
      { error: 'Failed to fetch countries from Sitecore' },
      { status: 500 },
    );
  }
}
