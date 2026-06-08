import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('components/contentSwitcher/partial/ContentSwitcherClient', async () => {
  const { contentSwitcherClientViMock } = await import('src/test/mocks/viteSafeMocks');
  return contentSwitcherClientViMock();
});

import { Default } from 'components/contentSwitcher/ContentSwitcher';
import type { IContentSwitcherProps } from 'components/contentSwitcher/ContentSwitcher';
import type { IContentSwitcherFields } from 'components/contentSwitcher/ContentSwitcher.type';

const basePage = {
  mode: { isEditing: false, isPreview: false },
} as IContentSwitcherProps['page'];
const baseParams = {
  styles: '',
  RenderingIdentifier: 'ContentSwitcherTest',
} as IContentSwitcherProps['params'];
const baseRendering = {
  componentName: 'ContentSwitcher',
} as IContentSwitcherProps['rendering'];

const baseFields: IContentSwitcherFields = {
  Headline: { value: 'Switcher headline' },
  Description: { value: '<p>Intro copy</p>' },
  TabItems: [],
};

describe('ContentSwitcher Default', () => {
  it('renders the client shell with fields from props', () => {
    render(
      <Default
        fields={baseFields}
        params={baseParams}
        page={basePage}
        rendering={baseRendering}
      />,
    );
    expect(screen.getByTestId('mock-content-switcher-client')).toHaveTextContent(
      'Switcher headline',
    );
  });
});
