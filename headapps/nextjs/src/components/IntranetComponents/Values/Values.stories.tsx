// Values.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

import Values from './Values';
import type { ValuesProps } from './Values.types';

const meta: Meta<typeof Values> = {
  title: 'Components/Values',
  component: Values,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<ValuesProps>;

export const Default: Story = {
  args: {
    rendering: {
      componentName: 'Values',
      dataSource: 'Empty',
      params: {},
    },
    params: {},
    stylesSXA: '',
    fields: {
      data: {
        datasource: {
          title: {
            jsonValue: {
              value: 'Our Values',
            },
          },
          paragraph: {
            jsonValue: {
              value:
                "Ascension's culture is rooted in kindness, compassion and connection. Belonging at Ascension means every individual - patient or associate - feels supported and valued. This idea, closely tied to our Catholic identity, is integrated into every part of our organization. Our commitment to this culture is exemplified daily by dedicated associates.",
            },
          },
          children: {
            results: [
              {
                valueTitle: {
                  jsonValue: { value: 'Service of the poor' },
                },
                valueDescription: {
                  jsonValue: {
                    value: 'Generosity of spirit, especially for persons most in need.',
                  },
                },
                valueIcon: {
                  targetItem: {
                    id: '1',
                    name: 'VolunteerActivismOutlined',
                    value: { value: 'VolunteerActivismOutlined' },
                  },
                },
              },
              {
                valueTitle: {
                  jsonValue: { value: 'Reverence' },
                },
                valueDescription: {
                  jsonValue: {
                    value: 'Respect and compassion for the dignity and diversity of life.',
                  },
                },
                valueIcon: {
                  targetItem: {
                    id: '2',
                    name: 'VolunteerActivismOutlined',
                    value: { value: 'VolunteerActivismOutlined' },
                  },
                },
              },
              {
                valueTitle: {
                  jsonValue: { value: 'Integrity' },
                },
                valueDescription: {
                  jsonValue: {
                    value: 'Inspiring trust through personal leadership.',
                  },
                },
                valueIcon: {
                  targetItem: {
                    id: '3',
                    name: 'BalanceOutlined',
                    value: { value: 'BalanceOutlined' },
                  },
                },
              },
              {
                valueTitle: {
                  jsonValue: { value: 'Wisdom' },
                },
                valueDescription: {
                  jsonValue: { value: 'Integrating excellence and stewardship.' },
                },
                valueIcon: {
                  targetItem: {
                    id: '4',
                    name: 'LightbulbOutlined',
                    value: { value: 'LightbulbOutlined' },
                  },
                },
              },
              {
                valueTitle: {
                  jsonValue: { value: 'Creativity' },
                },
                valueDescription: {
                  jsonValue: { value: 'Courageous innovation' },
                },
                valueIcon: {
                  targetItem: {
                    id: '5',
                    name: 'PsychologyOutlined',
                    value: { value: 'PsychologyOutlined' },
                  },
                },
              },
              {
                valueTitle: {
                  jsonValue: { value: 'Dedication ' },
                },
                valueDescription: {
                  jsonValue: { value: 'Affirming the hope and joy of our ministry.' },
                },
                valueIcon: {
                  targetItem: {
                    id: '6',
                    name: 'LandscapeOutlined',
                    value: { value: 'LandscapeOutlined' },
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
