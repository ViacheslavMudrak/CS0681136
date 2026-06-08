import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/contentSwitcher/ContentSwitcher';
import { ContentSwitcherClient } from 'components/contentSwitcher/partial/ContentSwitcherClient';

vi.mock('components/contentSwitcher/partial/ContentSwitcherClient', async () => {
  const { contentSwitcherClientViMock } = await import('src/test/mocks/viteSafeMocks');
  return contentSwitcherClientViMock();
});

import {
  createContentSwitcherFields,
  mockParamsContentSwitcher,
  mockRendering,
} from '../../_mock/contentSwitcher/ContentSwitcher.mock';

const mockPage = { mode: { isEditing: false } } as Page;

describe('ContentSwitcher Default', () => {
  it('delegates to ContentSwitcherClient with fields, params, and rendering', () => {
    const fields = createContentSwitcherFields();
    render(
      <Default
        fields={fields}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    expect(vi.mocked(ContentSwitcherClient)).toHaveBeenCalledWith(
      expect.objectContaining({
        fields,
        params: mockParamsContentSwitcher,
        rendering: mockRendering,
        page: mockPage,
      }),
      undefined,
    );
  });

  it('renders output from the client component', () => {
    const fields = createContentSwitcherFields();
    render(
      <Default
        fields={fields}
        params={mockParamsContentSwitcher as never}
        rendering={mockRendering}
        page={mockPage}
      />,
    );

    expect(screen.getByTestId('mock-content-switcher-client')).toHaveTextContent('Switcher Headline');
  });
});
