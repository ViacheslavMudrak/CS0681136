import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import Caption from 'components/shared/ImageView/Caption';
import CaptionContent from 'components/shared/ImageView/CaptionContent';

describe('Caption', () => {
  it('applies left border class', () => {
    const { container } = render(
      <Caption border="left" className="extra">
        <span>child</span>
      </Caption>,
    );
    expect(container.firstElementChild?.className).toContain('border-l');
    expect(container.firstElementChild?.className).toContain('extra');
  });

  it.each(['right', 'top', 'bottom'] as const)('applies %s border class', (border) => {
    const { container } = render(<Caption border={border}>x</Caption>);
    const map = { right: 'border-r', top: 'border-t', bottom: 'border-b' } as const;
    expect(container.firstElementChild?.className).toContain(map[border]);
  });

  it('omits border class when border is undefined', () => {
    const { container } = render(<Caption>no border</Caption>);
    expect(container.firstElementChild?.className).not.toMatch(/border-[lrbt]/);
  });
});

describe('CaptionContent', () => {
  it('returns null when content is empty', () => {
    const { container } = render(<CaptionContent content="" />);
    expect(container.firstChild).toBeNull();
  });

  it.each(['xs', 'sm', 'md', 'lg'] as const)('uses spacing %s', (spacing) => {
    const { container } = render(
      <CaptionContent content="<p>Hi</p>" spacing={spacing} />,
    );
    expect(container.querySelector('div')?.innerHTML).toContain('<p>Hi</p>');
    const spaceMap = { xs: 'space-y-1', sm: 'space-y-2', md: 'space-y-4', lg: 'space-y-6' };
    expect(container.firstElementChild?.className).toContain(spaceMap[spacing]);
  });
});
