import { NextRequest, NextResponse } from "next/server";
import {
  API_ROUTES,
  getAllowedUpstreamPathWhitelist,
  getBaseApiUrl,
  getUpstreamFetchUrlWhitelist,
  UPSTREAM_QUOTE_SUBMIT_PATH,
} from "@/lib/apis/api-routes";
import { buildUpstreamFetchUrl } from "@/lib/apis/dxp-proxy-security";

export const dynamic = "force-dynamic";

/** Derived from {@link API_ROUTES}. */
const ALLOWED_UPSTREAM_PATH_WHITELIST = getAllowedUpstreamPathWhitelist();

/** Headers allowed to be forwarded to the DXP backend (BFF; do not forward cookies). */
const ALLOWED_REQUEST_HEADERS = new Set([
  "authorization",
  "accept",
  "content-type",
  "requestid",
  "language",
]);

function buildUpstreamHeaders(req: NextRequest): Headers {
  const out = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (ALLOWED_REQUEST_HEADERS.has(lower)) {
      out.set(key, value);
    }
  });
  return out;
}

function getUpstreamPath(segments: string[]): string {
  if (!segments.length) {
    throw new Error("empty path");
  }
  for (const seg of segments) {
    if (seg.includes("..") || seg.includes("\\")) {
      throw new Error("invalid segment");
    }
  }
  return `/${segments.join("/")}`;
}

function hasPdfMarkers(buffer: ArrayBuffer): {
  startsWithPdf: boolean;
  hasEof: boolean;
  hasStartXref: boolean;
  first16Hex: string;
} {
  const bytes = new Uint8Array(buffer);
  const startsWithPdf =
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d;
  const first16Hex = Array.from(bytes.slice(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
  const tailWindow = Math.min(bytes.length, 4096);
  let tailAscii = "";
  for (let i = bytes.length - tailWindow; i < bytes.length; i += 1) {
    const v = bytes[i] ?? 0;
    tailAscii += v >= 32 && v <= 126 ? String.fromCharCode(v) : ".";
  }
  return {
    startsWithPdf,
    hasEof: tailAscii.includes("%%EOF"),
    hasStartXref: tailAscii.includes("startxref"),
    first16Hex,
  };
}

async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const base = getBaseApiUrl();
  if (!base) {
    return NextResponse.json(
      { message: "API base URL is not configured: set BASE_API_URL." },
      { status: 503 }
    );
  }

  let upstreamPath: string;
  try {
    upstreamPath = getUpstreamPath((await context.params).path ?? []);
  } catch {
    return NextResponse.json({ message: "Invalid API path." }, { status: 400 });
  }

  const quoteSubmitAllowed = UPSTREAM_QUOTE_SUBMIT_PATH.test(upstreamPath);
  if (!ALLOWED_UPSTREAM_PATH_WHITELIST.includes(upstreamPath) && !quoteSubmitAllowed) {
    return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
  }

  const search = req.nextUrl.search;
  const upstreamFetchUrl = buildUpstreamFetchUrl(base, upstreamPath, search);
  if (!upstreamFetchUrl) {
    return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
  }

  const requestUrl = upstreamFetchUrl.href;
  const urlKey = `${upstreamFetchUrl.origin}${upstreamFetchUrl.pathname}`;
  const whitelist = getUpstreamFetchUrlWhitelist(base);

  const method = req.method;
  if (method !== "GET" && method !== "POST" && method !== "PATCH") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  const headers = buildUpstreamHeaders(req);
  let body: BodyInit | undefined;
  if (method === "POST" || method === "PATCH") {
    body = await req.text();
  }

  const fetchInit: RequestInit = {
    method,
    headers,
    body,
    redirect: "error",
    cache: "no-store",
  };

  let upstreamRes: Response;
  if (whitelist.includes(urlKey)) {
    upstreamRes = await fetch(requestUrl, fetchInit);
  } else if (quoteSubmitAllowed) {
    upstreamRes = await fetch(requestUrl, fetchInit);
  } else {
    return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
  }

  const isBinaryPdfEndpoint = upstreamPath === API_ROUTES.ORDERS_DOCUMENTS_BINARY;
  if (isBinaryPdfEndpoint) {
    console.info("[dxp-proxy][pdf-debug] upstream response", {
      method,
      upstreamUrl: upstreamFetchUrl.href,
      status: upstreamRes.status,
      contentType: upstreamRes.headers.get("content-type") ?? "",
      contentDisposition: upstreamRes.headers.get("content-disposition") ?? "",
      contentEncoding: upstreamRes.headers.get("content-encoding") ?? "",
      contentLength: upstreamRes.headers.get("content-length") ?? "",
    });
  }

  const responseHeaders = new Headers();
  const passThroughHeaders = [
    "Content-Type",
    "Content-Disposition",
    "Accept-Ranges",
    "Content-Range",
    "Cache-Control",
  ] as const;
  for (const key of passThroughHeaders) {
    const value = upstreamRes.headers.get(key);
    if (value) {
      responseHeaders.set(key, value);
    }
  }
  if (!responseHeaders.has("Content-Type")) {
    responseHeaders.set("Content-Type", "application/octet-stream");
  }

  if (isBinaryPdfEndpoint) {
    const responseBuffer = await upstreamRes.arrayBuffer();
    const markers = hasPdfMarkers(responseBuffer);
    console.info("[dxp-proxy][pdf-debug] upstream payload markers", {
      byteLength: responseBuffer.byteLength,
      ...markers,
    });
    return new NextResponse(responseBuffer, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  }

  return new NextResponse(upstreamRes.body, {
    status: upstreamRes.status,
    headers: responseHeaders,
  });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return proxy(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return proxy(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return proxy(req, context);
}
