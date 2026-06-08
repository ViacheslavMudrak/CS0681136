import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@laitram-l-l-c/intralox-ui-components', async () => {
  const actual = await vi.importActual<typeof import('@laitram-l-l-c/intralox-ui-components')>(
    '@laitram-l-l-c/intralox-ui-components',
  );
  return actual;
});

import ButtonView from 'components/shared/ButtonView';
import { ctaButtonClasses } from 'components/ui/ctaVariants';

describe('ButtonView', () => {
  it('renders a pill CTA through ui/Button', () => {
    render(
      <ButtonView buttonType="pill" buttonTheme="default">
        Save
      </ButtonView>,
    );
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn.className).toContain('rounded-[9999px]');
    expect(btn.className).toContain('bg-action');
  });

  it('forwards onClick to ui/Button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ButtonView buttonType="pill" onClick={onClick}>
        Open
      </ButtonView>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('uses rect CTA classes when buttonType is omitted', () => {
    render(<ButtonView>Rect</ButtonView>);
    const btn = screen.getByRole('button', { name: 'Rect' });
    expect(btn.className).toContain(ctaButtonClasses({ buttonType: 'rect' }).split(' ')[0]);
  });

  it('applies more-link CTA classes for buttonType="more"', () => {
    render(
      <ButtonView buttonType="more" contrast>
        More
      </ButtonView>,
    );
    const btn = screen.getByRole('button', { name: 'More' });
    expect(btn.className).toContain('border-action');
    expect(btn.className).toContain('text-ink-inverse');
  });
});
