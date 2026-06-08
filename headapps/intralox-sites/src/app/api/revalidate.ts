// https://<your-site.com>/api/revalidate?secret=<token>

import type { NextApiRequest, NextApiResponse } from 'next';

interface RevalidateLayoutUpdate {
  entity_definition: string;
  identifier: string;
}

interface RevalidateRequestBody {
  updates?: RevalidateLayoutUpdate[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(
    `[revalidation] start: Start. Request: ${JSON.stringify(req.body)}`
  );

  if (req.query.secret !== process.env.ISR_REVALIDATE_TOKEN) {
    console.log(
      `[revalidate]: invalid token passed in "secret" param "${req.query.secret}"`
    );
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const body = req.body as RevalidateRequestBody | undefined;
    const updates = body?.updates ?? [];
    const layoutUpdates = updates.filter(
      (update) => update.entity_definition === "LayoutData"
    );
    console.log(
      `[revalidate] Discovered ${layoutUpdates.length} layout updates.`
    );

    for await (const update of layoutUpdates) {
      const edgePpath = update.identifier;
      const actualPath = `/${edgePpath.substring(edgePpath.indexOf("/") + 1)}`;

      console.log(
        `[revalidate]: Revalidating edge path "${edgePpath}" as "${actualPath}"`
      );

      // This probably needs its own error handling, to allow the pages to revalidate.
      await res.revalidate(actualPath);
    }
    console.log("[revalidate]: Done!");
    return res.json({ revalidated: true });
  } catch (err) {
    console.log(
      `[revalidation]: Error during revalidation. Error: ${err as string}`
    );
    return res.status(500).send("Error revalidating");
  }
}
