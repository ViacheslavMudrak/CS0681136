import { getBaseOktaConfig, getOktaClientSecret } from "lib/okta-config";
import { clearOktaSession } from "@/lib/okta-auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Token API Endpoint
 * 1. Code exchange: accepts authorization code (or interaction_code) + code_verifier, exchanges with Okta, sets cookies.
 * 2. Set tokens: accepts access_token (e.g. from widget login), sets cookies so middleware sees auth on next request.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      interaction_code,
      code_verifier,
      grant_type,
      returnUrl,
      access_token: accessTokenDirect,
      id_token: idTokenDirect,
      refresh_token: refreshTokenDirect,
      expires_in: expiresInDirect,
    } = body;

    // Path 2: Widget login – we already have tokens, just set cookies
    //TODO: Need to refactor below logic if required
    if (accessTokenDirect) {
      const cookieStore = await cookies();
      const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
      const expiresIn = Number(expiresInDirect) || 3600;
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        domain: cookieDomain,
        maxAge: expiresIn,
      };
      cookieStore.set("okta_access_token", accessTokenDirect, cookieOptions);
      if (idTokenDirect) {
        cookieStore.set("okta_id_token", idTokenDirect, cookieOptions);
      }
      if (refreshTokenDirect) {
        cookieStore.set("okta_refresh_token", refreshTokenDirect, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 30,
        });
      }
      return NextResponse.json({
        success: true,
        redirectUrl: returnUrl || "/",
        access_token: accessTokenDirect,
        id_token: idTokenDirect ?? undefined,
        refresh_token: refreshTokenDirect ?? undefined,
      });
    }

    // Path 1: Refresh-token flow from authenticated API client
    if (grant_type === "refresh_token") {
      const cookieStore = await cookies();
      const refreshTokenFromCookie = cookieStore.get("okta_refresh_token")?.value;

      if (!refreshTokenFromCookie) {
        await clearOktaSession();
        return NextResponse.json(
          {
            error: "refresh_token_missing",
            error_description: "Refresh token is unavailable",
            session_expired: true,
          },
          { status: 401 }
        );
      }

      const config = getBaseOktaConfig();
      const tokenUrl = `https://${config.domain}/oauth2/default/v1/token`;
      const refreshParams = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: config.clientId,
        refresh_token: refreshTokenFromCookie,
      });

      try {
        const clientSecret = getOktaClientSecret();
        refreshParams.append("client_secret", clientSecret);
      } catch {
        // SPA flow does not require client secret.
      }

      const refreshResponse = await fetch(tokenUrl, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: refreshParams,
      });

      if (!refreshResponse.ok) {
        const refreshError = await refreshResponse.json().catch(() => ({}));
        console.warn("Refresh token exchange failed:", refreshError);
        await clearOktaSession();
        return NextResponse.json(
          {
            error: "refresh_failed",
            error_description: "Session refresh failed. Please sign in again.",
            session_expired: true,
          },
          { status: 401 }
        );
      }

      const refreshedTokens = (await refreshResponse.json()) as {
        access_token?: string;
        id_token?: string;
        refresh_token?: string;
        expires_in?: number;
      };

      if (!refreshedTokens.access_token) {
        await clearOktaSession();
        return NextResponse.json(
          {
            error: "refresh_failed",
            error_description: "Session refresh did not return an access token.",
            session_expired: true,
          },
          { status: 401 }
        );
      }

      const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        domain: cookieDomain,
        maxAge: refreshedTokens.expires_in || 3600,
      };

      cookieStore.set("okta_access_token", refreshedTokens.access_token, cookieOptions);
      if (refreshedTokens.id_token) {
        cookieStore.set("okta_id_token", refreshedTokens.id_token, cookieOptions);
      }
      if (refreshedTokens.refresh_token) {
        cookieStore.set("okta_refresh_token", refreshedTokens.refresh_token, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 30,
        });
      }

      return NextResponse.json({
        success: true,
        access_token: refreshedTokens.access_token,
        id_token: refreshedTokens.id_token,
        refresh_token: refreshedTokens.refresh_token,
      });
    }

    // Path 2: Code exchange (OAuth / authorization verify)
    const authCode = interaction_code || code;
    const grantType = interaction_code
      ? "interaction_code"
      : "authorization_code";

    if (!authCode) {
      return NextResponse.json(
        {
          error: "missing_code",
          error_description:
            "No authorization code, interaction code, or access_token provided"
        },
        { status: 400 }
      );
    }

    const config = getBaseOktaConfig();
    const tokenUrl = `https://${config.domain}/oauth2/default/v1/token`;

    // Build token exchange parameters
    const tokenParams = new URLSearchParams({
      grant_type: grantType,
      redirect_uri: config.redirectUri,
      client_id: config.clientId
    });

    // Add the appropriate code parameter
    if (interaction_code) {
      tokenParams.append("interaction_code", interaction_code);
    } else {
      tokenParams.append("code", code);
    }

    // Use PKCE if code_verifier is provided, otherwise fallback to client secret
    if (code_verifier) {
      tokenParams.append("code_verifier", code_verifier);
    } else {
      // Fallback to client secret flow
      try {
        const clientSecret = getOktaClientSecret();
        tokenParams.append("client_secret", clientSecret);
      } catch (error) {
        return NextResponse.json(
          {
            error: "token_exchange_failed",
            error_description: "Missing authentication credentials"
          },
          { status: 400 }
        );
      }
    }

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body: tokenParams
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error("Token exchange failed:", errorData);
      return NextResponse.json(
        {
          error: "token_exchange_failed",
          error_description:
            errorData.error_description ||
            "Failed to exchange authorization code"
        },
        { status: 400 }
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, id_token, refresh_token, expires_in } = tokens;

    // Set secure httpOnly cookies for tokens
    // Use COOKIE_DOMAIN environment variable for SSO session sharing across subdomains
    // Domain should start with '.' (e.g., '.intralox.com') to work across all subdomains
    const cookieStore = await cookies();
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      domain: cookieDomain, // e.g., '.intralox.com' for SSO across subdomains
      maxAge: expires_in || 3600 // Default to 1 hour
    };

    cookieStore.set("okta_access_token", access_token, cookieOptions);
    cookieStore.set("okta_id_token", id_token, cookieOptions);

    if (refresh_token) {
      cookieStore.set("okta_refresh_token", refresh_token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    // Get user info from ID token (decode JWT)
    let userInfo = null;
    try {
      const idTokenParts = id_token.split(".");
      if (idTokenParts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(idTokenParts[1], "base64").toString("utf-8")
        );
        userInfo = {
          sub: payload.sub,
          email: payload.email,
          name: payload.name
        };
        cookieStore.set("okta_user_info", JSON.stringify(userInfo), {
          ...cookieOptions,
          maxAge: expires_in || 3600
        });
      }
    } catch (err) {
      console.warn("Failed to decode ID token:", err);
    }

    return NextResponse.json({
      success: true,
      redirectUrl: returnUrl || "/",
      userInfo,
      access_token: access_token,
      id_token: id_token,
      refresh_token: refresh_token ?? undefined,
    });
  } catch (error) {
    console.error("POST token exchange error:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        error_description: "An internal error occurred during token exchange"
      },
      { status: 500 }
    );
  }
}
