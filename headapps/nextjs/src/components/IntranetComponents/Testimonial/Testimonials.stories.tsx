import type { Meta, StoryObj } from '@storybook/react';

import { Default as Testimonial } from './Testimonial';
import type { TestimonialProps } from './Testimonial.types';
import { STORYBOOK_IMAGES, createStorybookImageReference } from 'storybook/storybook-images';

const baseDatasource: TestimonialProps['fields']['data']['datasource'] = {
  title: {
    jsonValue: { value: 'What our associates say' },
  },
  backgroundImage: {
    jsonValue: {
      value: createStorybookImageReference(
        STORYBOOK_IMAGES.bannerBackgrounds.default,
        'Default testimonial background',
        1920,
        1080
      ),
    },
  },
  children: {
    results: [
      {
        id: 'testimonial-1',
        quote: {
          jsonValue: {
            value:
              'The core Values and Mission of St. Vincent are what drew me into this hospital ministry many years ago. We are the hands and feet of Jesus to the many families we serve.',
          },
        },
        authorImage: {
          jsonValue: {
            value: { src: '/images/sample-person-1.svg', alt: 'Laura Petraitas' },
          },
        },
        authorName: { jsonValue: { value: 'Laura Petraitas' } },
        authorTitle: { jsonValue: { value: 'RN, Lactation' } },
      },
      {
        id: 'testimonial-2',
        quote: {
          jsonValue: {
            value:
              'Working at Ascension has been incredibly rewarding. The team here truly cares about making a difference in our community.',
          },
        },
        authorImage: {
          jsonValue: {
            value: { src: '/images/sample-person-1.svg', alt: 'Michael Chen' },
          },
        },
        authorName: { jsonValue: { value: 'Michael Chen' } },
        authorTitle: { jsonValue: { value: 'Healthcare Professional' } },
      },
      {
        id: 'testimonial-3',
        quote: {
          jsonValue: {
            value:
              'The support and dedication I see every day from my colleagues inspires me to give my best to every patient.',
          },
        },
        authorImage: {
          jsonValue: {
            value: { src: '/images/sample-person-1.svg', alt: 'Sarah Johnson' },
          },
        },
        authorName: { jsonValue: { value: 'Sarah Johnson' } },
        authorTitle: { jsonValue: { value: 'Registered Nurse' } },
      },
    ],
  },
  sharedTestimonials: {
    targetItems: [
      {
        id: 'shared-testimonial-1',
        quote: {
          jsonValue: {
            value: 'This is a shared testimonial that can be used across multiple pages.',
          },
        },
        authorImage: {
          jsonValue: {
            value: { src: '/images/sample-person-1.svg', alt: 'Emily Davis' },
          },
        },
        authorName: { jsonValue: { value: 'Emily Davis' } },
        authorTitle: { jsonValue: { value: 'Department Manager' } },
      },
    ],
  },
};

const baseArgs: TestimonialProps = {
  rendering: {
    componentName: 'Testimonial',
    dataSource: '/sitecore/content/Example/Data/Testimonial',
  },
  params: {},
  stylesSXA: '',
  fields: {
    data: {
      datasource: baseDatasource,
    },
  },
};

const meta: Meta<typeof Testimonial> = {
  title: 'Components/Testimonial',
  component: Testimonial,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<TestimonialProps>;

export const Primary: Story = {
  args: {
    ...baseArgs,
  },
};

export const DirectChildrenOnly: Story = {
  args: {
    ...baseArgs,
    fields: {
      data: {
        datasource: {
          ...baseDatasource,
          sharedTestimonials: { targetItems: [] },
        },
      },
    },
  },
};

export const SharedTestimonialsOnly: Story = {
  args: {
    ...baseArgs,
    fields: {
      data: {
        datasource: {
          ...baseDatasource,
          children: { results: [] },
        },
      },
    },
  },
};

export const SingleTestimonial: Story = {
  args: {
    ...baseArgs,
    fields: {
      data: {
        datasource: {
          ...baseDatasource,
          title: { jsonValue: { value: 'Featured Testimonial' } },
          children: {
            results: [
              {
                id: 'testimonial-single',
                quote: {
                  jsonValue: {
                    value:
                      'The core Values and Mission of St. Vincent are what drew me into this hospital ministry many years ago.',
                  },
                },
                authorImage: {
                  jsonValue: {
                    value: { src: '/images/sample-person-1.svg', alt: 'Laura Petraitas' },
                  },
                },
                authorName: { jsonValue: { value: 'Laura Petraitas' } },
                authorTitle: { jsonValue: { value: 'RN, Lactation' } },
              },
            ],
          },
          sharedTestimonials: { targetItems: [] },
        },
      },
    },
  },
};
