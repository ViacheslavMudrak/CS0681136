import { vi } from "vitest";

type OktaAuthClientModule = typeof import("@/lib/okta-auth-client");

/**
 * Partial vitest mock for `@/lib/okta-auth-client` that keeps real exports and stubs
 * session helpers used by auth-utils / logout flows.
 */
export async function createOktaAuthClientVitestMock(
  importOriginal: () => Promise<OktaAuthClientModule>,
  overrides: Partial<Record<keyof OktaAuthClientModule, unknown>> = {}
): Promise<OktaAuthClientModule> {
  const actual = await importOriginal();
  return {
    ...actual,
    markFreshLoginSession: vi.fn(),
    isFreshLoginSession: vi.fn(() => false),
    redirectToLogin: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as OktaAuthClientModule;
}
