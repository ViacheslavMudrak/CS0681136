import {
  buildClientVerifyQuery,
  type EmailVerifyFlow
} from "@/lib/okta-email-verify";
import { NextRequest, NextResponse } from "next/server";

const FLOW_QUERY_KEY = "flow";

export function GET(request: NextRequest) {
  const currentUrl = new URL(request.url);
  const forwardedQuery = buildClientVerifyQuery(currentUrl.searchParams);

  const flow = currentUrl.searchParams.get(FLOW_QUERY_KEY);
  if (
    flow === "register" ||
    flow === "reset-password" ||
    flow === "login"
  ) {
    forwardedQuery.set(FLOW_QUERY_KEY, flow as EmailVerifyFlow);
  }

  const otp = forwardedQuery.get("otp");
  const state = forwardedQuery.get("state");
  if (flow === "reset-password" && otp && state) {
    const resetUrl = new URL("/reset-password", currentUrl.origin);
    resetUrl.searchParams.set("otp", otp);
    resetUrl.searchParams.set("state", state);
    return NextResponse.redirect(resetUrl);
  }

  const redirectUrl = new URL("/authorization/verify", currentUrl.origin);
  redirectUrl.search = forwardedQuery.toString();

  return NextResponse.redirect(redirectUrl);
}
