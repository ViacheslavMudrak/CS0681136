import { json2csv } from 'json-2-csv';
import type { NextApiRequest, NextApiResponse } from 'next';

import { validateApiKey } from 'src/lib/auth/api-key-middleware';
import { log } from 'src/util/helpers/log-helper';
import { getPagesByLastUpdated } from 'src/lib/sitecore-reporting/sitecore-reporting-service';

const COMPONENT = 'api/sitecore/reporting/published-pages';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!validateApiKey(req, res)) {
    return;
  }

  const { startDate, endDate, edgeContextId, templateFiltersInclude, templateFiltersExclude } =
    req.query as {
      startDate?: string;
      endDate?: string;
      edgeContextId?: string;
      templateFiltersInclude?: string | string[];
      templateFiltersExclude?: string | string[];
    };

  if (!startDate) {
    return res.status(400).json({ message: 'startDate query parameter is required' });
  }

  const toArray = (value?: string | string[]): string[] | undefined =>
    value === undefined ? undefined : Array.isArray(value) ? value : [value];

  try {
    const results = await getPagesByLastUpdated({
      startDate,
      endDate,
      edgeContextId,
      templateFiltersInclude: toArray(templateFiltersInclude),
      templateFiltersExclude: toArray(templateFiltersExclude),
    });

    if (results.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      return res.status(200).send('Name,Page Path,Last Updated,ID,Template ID');
    }

    const csv = json2csv(results);

    res.setHeader('Content-Type', 'text/csv');
    return res.status(200).send(csv);
  } catch (error) {
    log('ERROR', COMPONENT, 'failed to generate report', { error: String(error) });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
