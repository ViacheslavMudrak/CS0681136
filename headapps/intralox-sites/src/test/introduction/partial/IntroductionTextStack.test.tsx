import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span' }: { field?: { value?: string }; tag?: string }) => {
    const Tag = tag as keyof JSX.IntrinsicElements;
    return field?.value ? <Tag data-testid="sdk-text">{field.value}</Tag> : null;
  },
  RichText: ({ field }: { field?: { value?: string } }) =>
    field?.value ? <div data-testid="sdk-richtext">{field.value}</div> : null,
}));

import { IntroductionTextStack } from 'components/introduction/partial/IntroductionTextStack';

describe('IntroductionTextStack', () => {
  it('returns null when both headline and text are empty and not editing', () => {
    const { container } = render(
      <IntroductionTextStack headline={{ value: '' }} text={{ value: '' }} isEditing={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders headline when present', () => {
    render(
      <IntroductionTextStack
        headline={{ value: 'Hello World' }}
        text={{ value: '' }}
        isEditing={false}
      />,
    );
    expect(screen.getByTestId('sdk-text')).toHaveTextContent('Hello World');
  });

  it('renders text when present but headline is empty (line 61 mt-0 branch)', () => {
    const { container } = render(
      <IntroductionTextStack
        headline={{ value: '' }}
        text={{ value: '<p>Body text</p>' }}
        isEditing={false}
      />,
    );
    const textDiv = container.querySelector('div[class*="mt-0"]');
    expect(textDiv).toBeTruthy();
    expect(screen.getByTestId('sdk-richtext')).toBeInTheDocument();
  });

  it('shows mt-4 on text div when headline is also shown (line 61 mt-4 branch)', () => {
    const { container } = render(
      <IntroductionTextStack
        headline={{ value: 'Title' }}
        text={{ value: '<p>Body</p>' }}
        isEditing={false}
      />,
    );
    const textDiv = container.querySelector('div[class*="mt-4"]');
    expect(textDiv).toBeTruthy();
  });

  it('showHeadline true but headline is undefined returns null for that slot (line 56 null branch)', () => {
    render(
      <IntroductionTextStack
        headline={undefined}
        text={{ value: '<p>body</p>' }}
        isEditing={true}
      />,
    );
    expect(screen.queryByTestId('sdk-text')).toBeNull();
    expect(screen.getByTestId('sdk-richtext')).toBeInTheDocument();
  });

  it('showText true but text is undefined returns null for text slot (line 59 null branch)', () => {
    render(
      <IntroductionTextStack
        headline={{ value: 'Headline' }}
        text={undefined}
        isEditing={true}
      />,
    );
    expect(screen.getByTestId('sdk-text')).toBeInTheDocument();
    expect(screen.queryByTestId('sdk-richtext')).toBeNull();
  });

  it('renders both when editing even with empty content', () => {
    render(
      <IntroductionTextStack
        headline={{ value: 'Hello' }}
        text={{ value: '<p>content</p>' }}
        isEditing={true}
      />,
    );
    expect(screen.getByTestId('sdk-text')).toBeInTheDocument();
    expect(screen.getByTestId('sdk-richtext')).toBeInTheDocument();
  });
});
