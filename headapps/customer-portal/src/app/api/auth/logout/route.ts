import { NextResponse } from "next/server";
import {
  clearOktaSession,
  getUserInfo,
  revokeAllOktaSessionsForUser
} from "@/lib/okta-auth";

/**
 * POST /api/auth/logout
 * Revokes active Okta sessions for the current user (when configured)
 * and clears local Okta auth cookies.
 */
export async function POST() {
  try {
    const userInfo = await getUserInfo();

    if (userInfo?.sub) {
      try {
        await revokeAllOktaSessionsForUser(userInfo.sub);
      } catch (error) {
        console.warn("Failed to revoke all Okta user sessions:", error);
      }
    }

    await clearOktaSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear session" },
      { status: 500 }
    );
  }
}

