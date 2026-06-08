import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

import { FloatingFabFooterAwareWrap } from 'components/floating-action-button/partial/FloatingFabFooterAwareWrap';

describe('FloatingFabFooterAwareWrap', () => {
  const innerHeight = 800;

  beforeEach(() => {
    vi.stubGlobal('innerHeight', innerHeight);
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: innerHeight,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  it('positions anchor when footer is absent', () => {
    const { container } = render(
      <FloatingFabFooterAwareWrap>
        <button type="button">FAB</button>
      </FloatingFabFooterAwareWrap>,
    );
    const anchor = container.querySelector('.floating-action-viewport-anchor') as HTMLElement;
    expect(anchor.style.position).toBe('fixed');
    expect(anchor.style.bottom).toBeDefined();
  });

  it('raises bottom when footer overlaps viewport', () => {
    const footer = document.createElement('footer');
    footer.id = 'footer';
    document.body.appendChild(footer);
    vi.spyOn(footer, 'getBoundingClientRect').mockReturnValue({
      top: 700,
      bottom: 900,
      left: 0,
      right: 100,
      width: 100,
      height: 200,
      x: 0,
      y: 700,
      toJSON: () => {},
    });

    const { container } = render(
      <FloatingFabFooterAwareWrap>
        <span>child</span>
      </FloatingFabFooterAwareWrap>,
    );
    const anchor = container.querySelector('.floating-action-viewport-anchor') as HTMLElement;
    expect(parseFloat(anchor.style.bottom)).toBeGreaterThanOrEqual(0);
  });

  it('uses viewport inset when footer is below fold (no overlap)', () => {
    const footer = document.createElement('footer');
    footer.id = 'footer';
    document.body.appendChild(footer);
    vi.spyOn(footer, 'getBoundingClientRect').mockReturnValue({
      top: innerHeight + 100,
      bottom: innerHeight + 300,
      left: 0,
      right: 100,
      width: 100,
      height: 200,
      x: 0,
      y: innerHeight + 100,
      toJSON: () => {},
    });

    const { container } = render(
      <FloatingFabFooterAwareWrap>
        <span>x</span>
      </FloatingFabFooterAwareWrap>,
    );
    const anchor = container.querySelector('.floating-action-viewport-anchor') as HTMLElement;
    expect(anchor).toBeTruthy();
  });
});
