import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { ctaClientSpy } = vi.hoisted(() => ({
  ctaClientSpy: vi.fn(({ fields }: { fields: { Heading: { value: string } } }) => (
    <div data-testid="cta-client-stub">{fields.Heading.value}</div>
  )),
}));

vi.mock('components/callToAction/partial/CallToActionClient', () => ({
  CallToActionClient: (props: {
    fields: { Heading: { value: string } };
    params: unknown;
  }) => ctaClientSpy(props),
}));

import type { Page } from '@sitecore-content-sdk/nextjs';

import { Default } from 'components/callToAction/CallToAction';
import type { ICallToActionFields } from 'components/callToAction/CallToAction.type';

const baseParams = { styles: '', RenderingIdentifier: 'cta-1' } as never;
const basePage = {
  mode: { isEditing: false },
  layout: { sitecore: { route: {} } },
} as unknown as Page;

describe('CallToAction Default', () => {
  it('delegates to CallToActionClient', () => {
    const fields = {
      Heading: { value: 'CTA heading' },
      Text: { value: '' },
      Link: { value: { href: '/' } },
      Image: { value: { src: '', width: 1, height: 1, alt: '' } },
    } as ICallToActionFields;

    render(<Default fields={fields} params={baseParams} page={basePage} />);

    expect(screen.getByTestId('cta-client-stub')).toHaveTextContent('CTA heading');
    expect(ctaClientSpy).toHaveBeenCalledWith(
      expect.objectContaining({ fields, params: baseParams }),
    );
  });
});
