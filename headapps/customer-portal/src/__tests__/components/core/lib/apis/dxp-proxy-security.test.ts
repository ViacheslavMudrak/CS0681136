import { describe, expect, it } from "vitest";

import {
  API_ROUTES,
  getAllowedUpstreamPathWhitelist,
  getDxpProxyFetchPathWhitelist,
  getUpstreamFetchUrlWhitelist,
} from "@/lib/apis/api-routes";
import { buildDxpProxyFetchUrl, buildUpstreamFetchUrl } from "@/lib/apis/dxp-proxy-security";

const BASE = "https://apidev.example.com/v1/dxp";
const DXP_PROXY_PREFIX = "/api/dxp";

describe("API route whitelists", () => {
  it("includes every API_ROUTES path in upstream and proxy whitelists", () => {
    const upstream = getAllowedUpstreamPathWhitelist();
    const proxy = getDxpProxyFetchPathWhitelist(DXP_PROXY_PREFIX);
    for (const route of Object.values(API_ROUTES)) {
      expect(upstream).toContain(route);
      expect(proxy).toContain(`/api/dxp${route}`);
    }
  });

  it("builds upstream fetch URL whitelist from base", () => {
    const whitelist = getUpstreamFetchUrlWhitelist(BASE);
    expect(whitelist).toContain(`${BASE}/orders`);
    expect(whitelist).toContain(`${BASE}/users`);
  });
});

describe("buildDxpProxyFetchUrl", () => {
  it("builds proxy URLs with query params", () => {
    expect(buildDxpProxyFetchUrl(DXP_PROXY_PREFIX, API_ROUTES.ORDERS_LIST, { page: "1" })).toBe(
      "/api/dxp/orders?page=1"
    );
  });

  it("builds quote submit and order detail URLs", () => {
    expect(buildDxpProxyFetchUrl(DXP_PROXY_PREFIX, "/quotes/12", undefined)).toBe(
      "/api/dxp/quotes/12"
    );
    expect(
      buildDxpProxyFetchUrl(
        DXP_PROXY_PREFIX,
        `${API_ROUTES.ORDER_DETAIL}?orderHeaderId=1&accountId=2`,
        undefined
      )
    ).toBe("/api/dxp/orders?orderHeaderId=1&accountId=2");
  });

  it("rejects absolute URLs", () => {
    expect(buildDxpProxyFetchUrl(DXP_PROXY_PREFIX, "https://evil.com/x", undefined)).toBeNull();
  });
});

describe("buildUpstreamFetchUrl", () => {
  it("resolves allowed route under configured base", () => {
    const url = buildUpstreamFetchUrl(BASE, API_ROUTES.ORDERS_LIST, "?page=1");
    expect(url?.href).toBe(`${BASE}/orders?page=1`);
    expect(url?.origin).toBe("https://apidev.example.com");
  });

  it("resolves quote submit path", () => {
    const url = buildUpstreamFetchUrl(BASE, "/quotes/99", "");
    expect(url?.href).toBe(`${BASE}/quotes/99`);
  });

  it("rejects non-http(s) base URLs", () => {
    expect(buildUpstreamFetchUrl("file:///tmp", API_ROUTES.USERS, "")).toBeNull();
  });
});
