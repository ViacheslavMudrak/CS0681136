import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('components/shared/video/Video', () => ({
  default: () => <div data-testid="solutions-video-mock" />,
}));

vi.mock('components/shared/ImageView/ImageView', () => ({
  ImageView: () => <div data-testid="solutions-image-mock" />,
}));

vi.mock('@sitecore-content-sdk/nextjs', async () => {
  const { mediaTileSitecoreSdkMock } = await import('src/test/mocks/viteSafeMocks');
  return mediaTileSitecoreSdkMock();
});

import { SolutionsGroupClient } from 'components/solutions-group/partial/SolutionsGroupClient';
import type { ISolutionsGroupFields } from 'components/solutions-group/SolutionsGroup.type';

const videoBundle = {
  fields: {
    BrightcoveId: { value: 'bc-sg' },
    Autoplay: { value: false },
    Loop: { value: false },
    Caption: { value: '' },
    CoverImage: { value: { src: '', width: 1, height: 1, alt: '' } },
    Title: { value: 'T' },
  },
};

const baseFields = (): ISolutionsGroupFields => ({
  Text: { value: '<p>Main rich text</p>' },
  Image: {
    value: { src: 'https://example.com/sg.jpg', width: 800, height: 600, alt: '' },
  },
  MediaType: { fields: { Value: { value: 'image' } } },
  Video: videoBundle,
  QuickLinks: [],
});

const baseParams = {
  styles: '',
  RenderingIdentifier: 'solutions-1',
  ColorScheme: { Value: { value: 'Light' } },
  Theme: { Value: { value: 'landingPage' } },
} as never;

describe('SolutionsGroupClient', () => {
  it('sets root id from params.RenderingIdentifier (lowercased) for tab/hash targets', () => {
    const { container } = render(
      <SolutionsGroupClient fields={baseFields()} params={baseParams} />,
    );

    expect(container.firstChild).toHaveAttribute('id', 'solutions-1');
  });

  it('omits root id when RenderingIdentifier is absent', () => {
    const { container } = render(
      <SolutionsGroupClient
        fields={baseFields()}
        params={{ ...baseParams, RenderingIdentifier: undefined } as never}
      />,
    );

    expect(container.firstChild).not.toHaveAttribute('id');
  });

  it('renders rich text and ImageView when media is image', () => {
    render(<SolutionsGroupClient fields={baseFields()} params={baseParams} />);

    expect(screen.getByTestId('rich-text')).toHaveTextContent('Main rich text');
    expect(screen.getByTestId('solutions-image-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('solutions-video-mock')).not.toBeInTheDocument();
  });

  it('renders Video when media type is video', () => {
    const fields = baseFields();
    fields.MediaType = { fields: { Value: { value: 'video' } } };

    render(<SolutionsGroupClient fields={fields} params={baseParams} />);

    expect(screen.getByTestId('solutions-video-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('solutions-image-mock')).not.toBeInTheDocument();
  });

  it('renders empty hint when fields is undefined (line 28)', () => {
    render(<SolutionsGroupClient fields={undefined} params={baseParams} />);
    expect(screen.getByText('Solutions Group')).toHaveClass('is-empty-hint');
  });

  it('renders QuickLinks when provided (lines 147-156)', () => {
    const fields = baseFields();
    fields.QuickLinks = [
      {
        id: 'ql-1',
        fields: {
          Title: { value: 'Quick Link 1' },
          Link: { value: { href: '/ql-1', text: 'Quick Link 1' } },
          Icon: { fields: { Value: { value: 'fa-regular fa-check' } } },
        },
      },
      {
        id: 'ql-2',
        fields: {
          Title: { value: 'Quick Link 2' },
          Link: { value: { href: '/ql-2', text: 'Quick Link 2' } },
          Icon: null,
        },
      },
    ] as never;

    render(<SolutionsGroupClient fields={fields} params={baseParams} />);
    // QuickLinks rendered - check links are present
    expect(screen.getByRole('link', { name: 'Quick Link 1' })).toBeInTheDocument();
  });

  it('skips QuickLink item when fields is null (line 148-149)', () => {
    const fields = baseFields();
    fields.QuickLinks = [
      null, // null item - should be skipped
      {
        id: 'ql-valid',
        fields: {
          Title: { value: 'Valid Link' },
          Link: { value: { href: '/valid', text: 'Valid Link' } },
          Icon: null,
        },
      },
    ] as never;

    render(<SolutionsGroupClient fields={fields} params={baseParams} />);
    expect(screen.getByRole('link', { name: 'Valid Link' })).toBeInTheDocument();
  });
});
