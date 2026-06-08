import type { ComponentProps } from 'lib/component-props';

export type StoryMockParams = ComponentProps['params'];

export type MockParamsOptions = Partial<StoryMockParams>;

/**
 * Baseline `params` with `RenderingIdentifier` and `styles` (Sitecore placeholder chrome).
 */
export function createMockParams(options: MockParamsOptions = {}): StoryMockParams {
  return {
    RenderingIdentifier: 'storybook-mock-rendering',
    styles: '',
    ...options,
  } as StoryMockParams;
}
