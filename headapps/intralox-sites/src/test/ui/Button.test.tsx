import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@laitram-l-l-c/intralox-ui-components', async () => {
  const actual = await vi.importActual<typeof import('@laitram-l-l-c/intralox-ui-components')>(
    '@laitram-l-l-c/intralox-ui-components',
  );
  return actual;
});

import Button from 'components/ui/Button';
import { ctaButtonClasses } from 'components/ui/ctaVariants';

describe('Button', () => {
  it('renders children with primary variant', () => {
    render(<Button variant="primary">Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onPress when clicked', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button variant="primary" onPress={onPress}>
        Open
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('forwards onClick to onPress', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button variant="primary" onClick={onClick}>
        Legacy
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Legacy' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respects isDisabled', () => {
    render(
      <Button variant="muted" isDisabled>
        Disabled
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  it('applies pill CTA classes when buttonType is pill', () => {
    render(
      <Button variant="primary" buttonType="pill" buttonTheme="default">
        Pill CTA
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Pill CTA' });
    expect(btn.className).toContain('rounded-[9999px]');
    expect(btn.className).toContain('bg-action');
  });

  it('renders as link when btnVariant is link', () => {
    render(
      <Button btnVariant="link" href="/test" buttonType="more">
        More
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'More' });
    expect(link).toHaveAttribute('href', '/test');
    expect(link.className).toContain('border-action');
  });
});

describe('ctaButtonClasses', () => {
  it('returns pill contrast theme when contrast is true', () => {
    const classes = ctaButtonClasses({ buttonType: 'pill', contrast: true });
    expect(classes).toContain('text-action');
    expect(classes).toContain('bg-surface');
  });
});
