import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import RelatedPages from './RelatedPages';
import type { RelatedPagesProps } from './RelatedPages.types';

const meta: Meta<typeof RelatedPages> = {
  title: 'Components/Related Pages',
  component: RelatedPages,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<RelatedPagesProps>;

export const Primary: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'RelatedPages',
      dataSource: 'mock-datasource',
      placeholders: {},
      fields: {},
    },
    params: {},
    fields: {
      headLine: { value: 'Related Pages Headline' },
      relatedPages: [
        {
          id: 'card-1',
          name: 'Card 1',
          url: 'https://www.google.com',
          fields: {
            eyebrow: { value: '' },
            title: { value: 'Card Headline 1' },
            pageIntroduction: {
              value:
                'Lorem ipsum dolor sit amet, mentitum reprimique et eum. Ne eam affert congue. ',
            },
          },
        },
        {
          id: 'card-2',
          name: 'Card 2',
          url: 'https://www.google.com',
          fields: {
            eyebrow: { value: 'Optional eyebrow' },
            title: { value: 'Card Headline 2 on Multiple Lines' },
            pageIntroduction: {
              value:
                'Lorem ipsum dolor sit amet, mentitum reprimique et eum. Ne eam affert congue. Ius vide accumsan suscipit an, at legendos persequeris mel. Usu ei nihil timeam. Nec an iudico essent necessitatibus.',
            },
          },
        },
        {
          id: 'card-3',
          name: 'Card 3',
          url: 'https://www.google.com',
          fields: {
            eyebrow: { value: 'Optional eyebrow' },
            title: { value: 'Card Headline 3 on Multiple Lines' },
            pageIntroduction: {
              value:
                'Lorem ipsum dolor sit amet, mentitum reprimique et eum. Ne eam affert congue. Ius vide accumsan suscipit an, at legendos persequeris mel.',
            },
          },
        },
        {
          id: 'card-4',
          name: 'Card 4',
          url: 'https://www.google.com',
          fields: {
            eyebrow: { value: 'Optional eyebrow' },
            title: { value: 'Card Headline 4 on Multiple' },
            pageIntroduction: {
              value:
                'Lorem ipsum dolor sit amet, mentitum reprimique et eum. Ne eam affert congue. Ius vide accumsan suscipit an, at legendos persequeris mel. Usu ei nihil timeam. Nec an iudico essent necessitatibus.',
            },
          },
        },
      ],
    },
  },
};
