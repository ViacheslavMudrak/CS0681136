import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import TextCardGrid from './TextCardGrid';
import type { TextCardGridProps } from './TextCardGrid.types';

const meta: Meta<typeof TextCardGrid> = {
  title: 'Components/Text Card Grid',
  component: TextCardGrid,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<TextCardGridProps>;

export const Primary: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'TextCardGrid',
      dataSource: 'mock-datasource',
      params: {
        tileOnLeft: '0',
        columnLayout: 'threeColumn',
      },
      placeholders: {},
      fields: {},
    },
    params: {},
    fields: {
      data: {
        datasource: {
          optionalEyebrow: { jsonValue: { value: 'Lorem Ipsum Eyebrow' } },
          sectionHeadline: { jsonValue: { value: 'Lorem Ipsum Title' } },
          sectionSubtext: {
            jsonValue: {
              value:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.',
            },
          },
          headlineButton: {
            jsonValue: {
              value: {
                href: 'https://www.example.com',
                text: 'Learn More',
                target: '_blank',
              },
            },
          },
          children: {
            results: [
              {
                tileIcon: { targetItem: { value: { value: 'Star' } } },
                tileTitle: { jsonValue: { value: 'Lorem Ipsum' } },
                tileDescription: {
                  jsonValue: {
                    value:
                      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.',
                  },
                },
                tileDestinationUrl: {
                  jsonValue: {
                    value: {
                      href: '/',
                      text: 'Read more',
                      target: '_self',
                    },
                  },
                },
              },
              {
                tileIcon: { targetItem: { value: { value: 'Bolt' } } },
                tileTitle: { jsonValue: { value: 'Dolor Sit Amet' } },
                tileDescription: {
                  jsonValue: {
                    value: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                  },
                },
                tileDestinationUrl: {
                  jsonValue: {
                    value: {
                      href: '/',
                      text: 'Read more',
                      target: '_self',
                    },
                  },
                },
              },
              {
                tileIcon: { targetItem: { value: { value: 'Eco' } } },
                tileTitle: { jsonValue: { value: 'Consectetur Adipiscing' } },
                tileDescription: {
                  jsonValue: {
                    value:
                      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
                  },
                },
                tileDestinationUrl: {
                  jsonValue: {
                    value: {
                      href: '/',
                      text: 'Read more',
                      target: '_self',
                    },
                  },
                },
              },
              {
                tileIcon: { targetItem: { value: { value: 'Build' } } },
                tileTitle: { jsonValue: { value: 'Eiusmod Tempor' } },
                tileDescription: {
                  jsonValue: {
                    value:
                      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
                  },
                },
                tileDestinationUrl: {
                  jsonValue: {
                    value: {
                      href: '/',
                      text: 'Read more',
                      target: '_self',
                    },
                  },
                },
              },
              {
                tileIcon: { targetItem: { value: { value: 'Security' } } },
                tileTitle: { jsonValue: { value: 'Incididunt Ut Labore' } },
                tileDescription: {
                  jsonValue: {
                    value:
                      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
                  },
                },
                tileDestinationUrl: {
                  jsonValue: {
                    value: {
                      href: '/',
                      text: 'Read more',
                      target: '_self',
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
};
