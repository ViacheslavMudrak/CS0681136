// POST https://<your-site.com>/api/cprevalidate?secret=<token>

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface RevalidateLayoutUpdate {
  entity_definition: string;
  identifier: string;
}

interface RevalidateRequestBody {
  updates?: RevalidateLayoutUpdate[];
}

function unauthorizedIfInvalidSecret(
  request: NextRequest
): NextResponse | null {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CP_ISR_REVALIDATE_TOKEN) {
    console.log(
      `[revalidate]: invalid token passed in "Customer Portal Secret" param "${secret}"`
    );
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
  return null;
}

/** Optional GET ping (browser); POST carries webhook body. */
export async function GET(request: NextRequest) {
  const denied = unauthorizedIfInvalidSecret(request);
  if (denied) return denied;
  console.log("[revalidate]: GET — no body; skipping revalidatePath.");
  return NextResponse.json({
    revalidated: true,
    message: "OK (no updates). Use POST with JSON body for layout revalidation."
  });
}

export async function POST(request: NextRequest) {
  const denied = unauthorizedIfInvalidSecret(request);
  if (denied) return denied;

  let body: RevalidateRequestBody;
  try {
    body = (await request.json()) as RevalidateRequestBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  console.log(
    `[revalidation] start: Start. Request: ${JSON.stringify(body)}`
  );

  try {
    const updates = body?.updates ?? [];
    const layoutUpdates = updates.filter(
      (update) => update.entity_definition === "LayoutData"
    );
    console.log(
      `[revalidate] Discovered ${layoutUpdates.length} layout updates.`
    );

    for (const update of layoutUpdates) {
      const edgePpath = update.identifier;
      const actualPath = `/${edgePpath.substring(edgePpath.indexOf("/") + 1)}`;

      console.log(
        `[revalidate]: Revalidating edge path "${edgePpath}" as "${actualPath}"`
      );

      revalidatePath(actualPath);
    }
    console.log("[revalidate]: Done!");
    return NextResponse.json({ revalidated: true });
  } catch (err) {
    console.log(
      `[revalidation]: Error during revalidation. Error: ${String(err)}`
    );
    return new NextResponse("Error revalidating", { status: 500 });
  }
}
