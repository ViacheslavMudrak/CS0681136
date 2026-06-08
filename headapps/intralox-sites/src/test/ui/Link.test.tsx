import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@laitram-l-l-c/intralox-ui-components', async () => {
  const actual = await vi.importActual<typeof import('@laitram-l-l-c/intralox-ui-components')>(
    '@laitram-l-l-c/intralox-ui-components',
  );
  return actual;
});

import Link from 'components/ui/Link';

describe('Link', () => {
  it('renders an anchor with href', () => {
    render(<Link href="/about">About us</Link>);
    expect(screen.getByRole('link', { name: 'About us' })).toHaveAttribute('href', '/about');
  });

  it('applies CTA pill classes when buttonType is pill', () => {
    render(
      <Link href="/cta" buttonType="pill" buttonTheme="alert">
        Alert CTA
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Alert CTA' });
    expect(link.className).toContain('bg-warning');
  });
});
