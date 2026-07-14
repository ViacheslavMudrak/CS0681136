import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  FunctionHomeHero as FunctionHomeHeroBanner,
  ResourceHomeHero as ResourceHomeHeroBanner,
} from './HomeHeroBanner';
import type { HomeHeroBannerProps } from './HomeHeroBanner.types';
import { LinkField } from '@sitecore-content-sdk/nextjs';
import {
  STORYBOOK_IMAGES,
  createStorybookImageReference,
  createStorybookImageField,
} from 'storybook/storybook-images';

const fieldData = {
  optionalEyebrow: { value: 'Optional Eyebrow' },
  bannerHeadlineText: { value: 'Home Hero Banner' },
  bannerSubtext: {
    value:
      '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc in ultrices aliquet, metus justo commodo felis, in venenatis neque ligula eget neque. Vivamus at varius risus. Integer convallis fermentum arcu, vitae dapibus justo malesuada vel. Aenean sagittis, orci nec tristique feugiat, justo nisl posuere nisl, nec mattis lorem nunc nec enim.</p>',
  },
  additionalLinksSectionHeader: { value: 'Tasks' },

  quickLinks: [
    {
      fields: {
        linkIcon: { fields: { value: { value: 'AutoAwesomeOutlined' } } },
        directoryEntry: [],
        generalLink: {
          value: {
            text: 'Accordion Page',
            href: '/Development/Accordion',
            target: '_blank',
            id: '{9DE07627-D90E-415F-A518-84EC0EA594FF}',
          },
        } as LinkField,
      },
    },
    {
      fields: {
        linkIcon: { fields: { value: { value: 'ScheduleOutlined' } } },
        directoryEntry: [
          {
            fields: {
              entryIcon: { fields: { value: { value: 'VerifiedUserOutlined' } } },
              entryTags: { value: '' },
              entryLink: {
                value: {
                  text: 'Content Title Demo Page',
                  href: '/Development/Content-Title',
                  target: '_blank',
                  id: '{62DCDDEC-6424-4243-9B69-267D52596A36}',
                },
              } as LinkField,
            },
          },
        ],
        generalLink: { value: { href: '' } } as LinkField,
      },
    },
    {
      fields: {
        linkIcon: { fields: { value: { value: 'VerifiedUserOutlined' } } },
        directoryEntry: [
          {
            fields: {
              entryIcon: { fields: { value: { value: 'Link' } } },
              entryTags: { value: '' },
              entryLink: {
                value: {
                  text: 'News Listing Demo Page',
                  href: '/Development/Featured-News-Listing',
                  target: '_blank',
                  id: '{6D2E545D-8BE9-4D53-8FE6-3F37DBEA8180}',
                },
              } as LinkField,
            },
          },
        ],
        generalLink: { value: { href: '' } } as LinkField,
      },
    },
    {
      fields: {
        linkIcon: { fields: { value: { value: 'Link' } } },
        directoryEntry: [],
        generalLink: {
          value: {
            text: 'DFD Home Page',
            href: '/',
            target: '_blank',
            id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
          },
        } as LinkField,
      },
    },
  ],

  desktopBannerImage: createStorybookImageField(
    STORYBOOK_IMAGES.content.sampledoctor1,
    'Default hero image',
    612,
    420
  ),
  mobileBannerImage: createStorybookImageField(
    STORYBOOK_IMAGES.content.sampledoctor1,
    'Default hero image',
    612,
    420
  ),
  backgroundImage: createStorybookImageReference(
    STORYBOOK_IMAGES.heroBackgrounds.default,
    'Default hero background',
    1920,
    1080
  ),
};

const meta: Meta<typeof FunctionHomeHeroBanner> = {
  title: 'Components/Home Hero Banner',
  component: FunctionHomeHeroBanner,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<HomeHeroBannerProps & { variant?: 'FunctionHomeHero' | 'ResourceHomeHero' }>;

export const FunctionHomeHero: Story = {
  args: {
    rendering: {
      componentName: 'FunctionHomeHeroBanner',
      dataSource: 'FunctionHomeHeroBanner',
    },
    params: {},
    fields: fieldData,
  },
  render: (args) => <FunctionHomeHeroBanner {...args} />,
};
export const ResourceHomeHero: Story = {
  args: {
    rendering: {
      componentName: 'ResourceHomeHeroBanner',
      dataSource: 'ResourceHomeHeroBanner',
    },
    params: {},
    fields: fieldData,
  },
  render: (args) => <ResourceHomeHeroBanner {...args} />,
};
