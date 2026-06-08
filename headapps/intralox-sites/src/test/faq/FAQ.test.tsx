import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { faqClientSpy } = vi.hoisted(() => ({
  faqClientSpy: vi.fn(({ fields }: { fields: { Title: { value: string } } }) => (
    <div data-testid="faq-client-stub">{fields.Title.value}</div>
  )),
}));

vi.mock('components/faq/partial/FAQClient', () => ({
  FAQClient: (props: { fields: { Title: { value: string } }; params: unknown }) =>
    faqClientSpy(props),
}));

import { Default } from 'components/faq/FAQ';
import type { IFAQFields } from 'components/faq/FAQ.type';

const baseParams = { styles: '', RenderingIdentifier: 'faq-1' } as never;

describe('FAQ Default', () => {
  it('delegates to FAQClient', () => {
    const fields: IFAQFields = {
      Title: { value: 'FAQ block' },
      Description: { value: '' },
      FaqItems: [],
    };

    render(<Default fields={fields} params={baseParams} />);

    expect(screen.getByTestId('faq-client-stub')).toHaveTextContent('FAQ block');
    expect(faqClientSpy).toHaveBeenCalledWith(expect.objectContaining({ fields, params: baseParams }));
  });
});
