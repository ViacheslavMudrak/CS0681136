import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('components/callToAction/partial/LinkVIew', () => ({
  default: () => <div data-testid="text-block-link-view" />,
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { mediaTileSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return {
    ...mediaTileSitecoreSdkMock(),
    useSitecore: () => ({
      page: { mode: { isEditing: false, isPreview: false } },
    }),
  };
});

import { TextBlockClient } from 'components/textBlock/partial/TextBlockClient';
import type { ITextBlockFields } from 'components/textBlock/TextBlock.type';

const fields: ITextBlockFields = {
  Eyebrow: { value: 'Eyebrow' },
  Title: { value: 'Heading' },
  Description: { value: 'Supporting copy' },
  Link: { value: { href: '/next', text: 'Continue' } },
};

const baseParams = {
  styles: '',
  RenderingIdentifier: 'TextBlockMain',
} as never;

describe('TextBlockClient', () => {
  it('renders eyebrow, title, and description', () => {
    render(<TextBlockClient fields={fields} params={baseParams} />);

    const richTexts = screen.getAllByTestId('rich-text');
    expect(richTexts.some((el) => el.textContent === 'Eyebrow')).toBe(true);
    expect(richTexts.some((el) => el.textContent === 'Heading')).toBe(true);
    expect(richTexts.some((el) => el.textContent === 'Supporting copy')).toBe(true);
    expect(screen.getByTestId('text-block-link-view')).toBeInTheDocument();
  });

  it('does not render link view when link href is empty', () => {
    render(
      <TextBlockClient
        fields={{ ...fields, Link: { value: { href: '' } } }}
        params={baseParams}
      />,
    );

    expect(screen.queryByTestId('text-block-link-view')).not.toBeInTheDocument();
  });
});
