import { cookies } from "next/headers";

export type ServerAuthSession = {
  isAuthenticated: boolean;
  accessToken?: string;
};

/**
 * Reads the Okta access token cookie on the server for auth hints during RSC render.
 */
export async function getServerAuthSession(): Promise<ServerAuthSession> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("okta_access_token")?.value;

  return {
    isAuthenticated: Boolean(accessToken),
    accessToken,
  };
}
