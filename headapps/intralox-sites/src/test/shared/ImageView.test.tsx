import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('@sitecore-content-sdk/nextjs', () => ({
  NextImage: ({ field, alt, className }: { field?: { value?: { src?: string } }; alt?: string; className?: string }) => (
    <img alt={alt ?? ''} src={field?.value?.src ?? ''} className={className} data-testid="next-image" />
  ),
}));

vi.mock('components/shared/ImageView/Caption', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="caption">{children}</div>,
}));

vi.mock('components/shared/ImageView/CaptionContent', () => ({
  default: ({ content }: { content?: string }) => <span>{content}</span>,
}));

import { ImageView } from 'components/shared/ImageView/ImageView';
import type { ImageOptimProps } from 'components/shared/ImageView/ImageView';

function makeImage(width: number, height: number, src = 'https://example.com/img.jpg'): ImageOptimProps['image'] {
  return { value: { src, width, height, alt: 'test image' } } as never;
}

describe('ImageView', () => {
  it('returns null when image has no width', () => {
    const { container } = render(<ImageView image={{ value: {} } as never} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when image has no height', () => {
    const { container } = render(<ImageView image={{ value: { width: 800 } } as never} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders image with default settings', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('renders with cover object fit class', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} cover />);
    const img = container.querySelector('[data-testid="next-image"]');
    expect(img?.className).toContain('object-cover');
  });

  it('renders with objectFit="contain" class', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} objectFit="contain" />);
    const img = container.querySelector('[data-testid="next-image"]');
    expect(img?.className).toContain('object-contain');
  });

  it('adjusts cropWidthCalc when original is wider than crop ratio (oldAspectRatio > newAspectRatio branch)', () => {
    // image 1600x400 (AR=4) with cropRatio=0.5 (new AR = 1/0.5 = 2) → 4 > 2 → adjusts cropWidthCalc
    const { container } = render(<ImageView image={makeImage(1600, 400)} cropRatio={0.5} />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('adjusts cropHeightCalc when original is taller than crop ratio (oldAspectRatio < newAspectRatio branch)', () => {
    // image 400x1600 (AR=0.25) with cropRatio=0.5 (new AR = 1/0.5 = 2) → 0.25 < 2 → adjusts cropHeightCalc
    const { container } = render(<ImageView image={makeImage(400, 1600)} cropRatio={0.5} />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('uses focal point left-top in rect calculation', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} focalPoint="left-top" />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('uses focal point right-top', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} focalPoint="right-top" />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('uses focal point top', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} focalPoint="top" />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('uses focal point left-bottom', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} focalPoint="left-bottom" />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('uses focal point right-bottom', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} focalPoint="right-bottom" />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('uses focal point bottom', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} focalPoint="bottom" />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('uses focal point left', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} focalPoint="left" />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('uses focal point right', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} focalPoint="right" />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('uses focal point center (default)', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} focalPoint="center" />);
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });

  it('renders caption when caption is provided and suppressCaption is false', () => {
    const { container } = render(
      <ImageView image={makeImage(800, 600)} caption="A nice image" suppressCaption={false} />,
    );
    expect(container.querySelector('[data-testid="caption"]')).toBeTruthy();
  });

  it('does not render caption when suppressCaption is true', () => {
    const { container } = render(
      <ImageView image={makeImage(800, 600)} caption="A nice image" suppressCaption={true} />,
    );
    expect(container.querySelector('[data-testid="caption"]')).toBeFalsy();
  });

  it('does not render caption when no caption prop', () => {
    const { container } = render(<ImageView image={makeImage(800, 600)} />);
    expect(container.querySelector('[data-testid="caption"]')).toBeFalsy();
  });

  it('renders caption with left border for aside region', () => {
    const { container } = render(
      <ImageView image={makeImage(800, 600)} caption="Caption text" region="aside" />,
    );
    expect(container.querySelector('[data-testid="caption"]')).toBeTruthy();
  });

  it('renders with cropWidth param and cropRatio', () => {
    const { container } = render(
      <ImageView image={makeImage(800, 600)} cropWidth={400} cropRatio={0.75} />,
    );
    expect(container.querySelector('[data-testid="next-image"]')).toBeTruthy();
  });
});
