import { STORYBOOK_IMAGES, createStorybookImageField } from 'storybook/storybook-images';

import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { default as CollabSiteHero } from './CollabSiteHero';
import type { CollabSiteHeroProps } from './CollabSiteHero.types';

const meta: Meta<typeof CollabSiteHero> = {
  title: 'Components/Collab Site Hero',
  component: CollabSiteHero,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CollabSiteHeroProps>;

const basePage = {
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
        defaultImages: {
          collabSiteHeroBackground: {
            value: {
              src: STORYBOOK_IMAGES.heroBackgrounds.collab,
              alt: 'Collab Site Hero background',
              width: '1920',
              height: '1080',
            },
          },
        },
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
          collabSpaceName: { value: 'Executive Leadership' },
          collabSpaceDescription: {
            value: 'Strategic planning and confidential documentation for L7+ leadership',
          },
          collabSpaceThumbnail: createStorybookImageField(
            STORYBOOK_IMAGES.profiles.group,
            'Executive Leadership thumbnail',
            200,
            200
          ),
          collabSpaceLogo: createStorybookImageField(
            STORYBOOK_IMAGES.icons.companyLogo,
            'Executive Leadership logo',
            100,
            100
          ),
        },
        name: 'Collab Site Hero',
        placeholders: {},
      },
    },
  },
};

export const Primary: Story = {
  args: {
    rendering: {
      componentName: 'CollabSiteHero',
      dataSource: 'Empty',
    },
    params: {},
    fields: {},
    page: basePage,
  },
};

export const WithoutDescription: Story = {
  args: {
    ...Primary.args,
    page: {
      ...basePage,
      layout: {
        sitecore: {
          ...basePage.layout.sitecore,
          route: {
            ...basePage.layout.sitecore.route,
            fields: {
              ...basePage.layout.sitecore.route.fields,
              collabSpaceDescription: { value: '' },
            },
          },
        },
      },
    },
  },
};

export const EditingMode: Story = {
  args: {
    ...Primary.args,
    page: {
      ...basePage,
      mode: {
        ...basePage.mode,
        name: LayoutServicePageState.Edit,
        isNormal: false,
        isEditing: true,
      },
      layout: {
        sitecore: {
          ...basePage.layout.sitecore,
          route: {
            ...basePage.layout.sitecore.route,
            fields: {
              ...basePage.layout.sitecore.route.fields,
              collabSpaceThumbnail: createStorybookImageField('', '', 0, 0),
            },
          },
        },
      },
    },
  },
};
