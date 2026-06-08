import type { ComponentRendering } from '@sitecore-content-sdk/nextjs';

export type MockRenderingOptions = Partial<ComponentRendering> & {
  uid?: string;
  componentName?: string;
};

/**
 * Minimal `rendering` for layouts that read `uid` / `componentName`.
 */
export function createMockRendering(options: MockRenderingOptions = {}): ComponentRendering {
  const { uid = 'storybook-mock-uid', componentName = 'Mock', ...rest } = options;
  return {
    uid,
    componentName,
    ...rest,
  } as ComponentRendering;
}
