import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@laitram-l-l-c/intralox-ui-components', async () => {
  const actual = await vi.importActual<typeof import('@laitram-l-l-c/intralox-ui-components')>(
    '@laitram-l-l-c/intralox-ui-components',
  );
  return actual;
});

import MediaCard from 'components/ui/MediaCard';

describe('MediaCard', () => {
  it('renders media and children inside a link', () => {
    render(
      <MediaCard href="/card" mediaElement={<img alt="Tile" src="/img.jpg" />}>
        Card title
      </MediaCard>,
    );
    const link = screen.getByRole('link', { name: /card title/i });
    expect(link).toHaveAttribute('href', '/card');
    expect(screen.getByText('Card title')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Tile' })).toBeInTheDocument();
  });
});
