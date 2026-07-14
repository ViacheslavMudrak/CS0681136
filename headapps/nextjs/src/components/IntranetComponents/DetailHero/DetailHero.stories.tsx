import { STORYBOOK_IMAGES, createStorybookImageReference } from 'storybook/storybook-images';

import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { default as DetailHero } from './DetailHero';
import type { DetailHeroProps } from './DetailHero.types';

const meta: Meta<typeof DetailHero> = {
  title: 'Components/Detail Hero',
  component: DetailHero,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<DetailHeroProps>;

export const Primary: Story = {
  args: {
    rendering: {
      componentName: 'DetailHero',
      dataSource: 'Empty',
    },
    params: {},
    fields: {
      backgroundImage: createStorybookImageReference(
        STORYBOOK_IMAGES.heroBackgrounds.default,
        'Default hero background',
        1920,
        1080
      ),
    },
    // this portion gets injected into the useSitecore() hook page property
    page: {
      locale: 'en',
      mode: {
        name: LayoutServicePageState.Normal,
        isNormal: true,
        isPreview: false,
        isEditing: false,
        isDesignLibrary: false,
        designLibrary: {
          isVariantGeneration: false,
        },
      },
      layout: {
        sitecore: {
          context: {
            homePageId: '103C8B2F-80E2-4FA6-A6C6-B1C621D0110D',
            defaultImages: {},
            userDefaultSettings: {},
            landingPageSettings: {
              newsLandingPage: {
                name: 'News',
                fields: {},
              },
            },
            scriptSettings: null,
          },
          route: {
            fields: {
              title: { value: 'Header' },
              pageIntroduction: {
                value:
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin accumsan interdum.',
              },
            },
            name: 'Detail Hero',
            placeholders: {},
          },
        },
      },
    },
  },
};

export const GreenBackground: Story = {
  args: {
    ...Primary.args,
    fields: {
      backgroundImage: createStorybookImageReference(
        STORYBOOK_IMAGES.heroBackgrounds.green,
        'Green hero background',
        1920,
        1080
      ),
    },
  },
};

export const WithoutBackground: Story = {
  args: {
    ...Primary.args,
    fields: {
      backgroundImage: createStorybookImageReference('', 'No background', 0, 0),
    },
  },
};
