import { STORYBOOK_IMAGES, createStorybookImageField } from 'storybook/storybook-images';

import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Light as FeaturedResources } from './FeaturedResources';
import type { FeaturedResourcesProps } from './FeaturedResources.types';

const meta: Meta<typeof FeaturedResources> = {
  title: 'Components/Featured Resources',
  component: FeaturedResources,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<FeaturedResourcesProps>;

export const Primary: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'FeaturedResources',
      dataSource: 'mock-datasource',
      params: {},
      placeholders: {},
      fields: {},
    },
    params: {},
    fields: {
      data: {
        datasource: {
          headlineTitle: {
            jsonValue: { value: 'Resources' },
          },
          featuredResourceOptionalEyebrow: {
            jsonValue: { value: 'Featured' },
          },
          featuredResourceHeadlineText: {
            jsonValue: { value: 'Featured Resources Block' },
          },
          featuredResourceSubtext: {
            jsonValue: {
              value:
                'Explore our highlighted resources to help you get started with tools, guides, and insights.',
            },
          },
          featuredResourceUrl: {
            jsonValue: [
              {
                fields: {
                  generalLink: {
                    value: {
                      href: '/resource/featured',
                      text: 'Learn More',
                      target: '_blank',
                    },
                  },
                  linkIcon: {
                    fields: { value: { value: 'ArrowOutward' } },
                  },
                  directoryEntry: [],
                },
              },
            ],
          },
          featuredResourceImage: {
            jsonValue: createStorybookImageField(
              STORYBOOK_IMAGES.content.sampledoctor1,
              'Default image',
              1920,
              1080
            ),
          },
          featuredResourceMobileCtaText: {
            jsonValue: { value: 'Get Started' },
          },
          children: {
            results: [
              {
                nonFeaturedResourceName: {
                  jsonValue: { value: 'Resource One' },
                },
                nonFeaturedResourceDescription: {
                  jsonValue: {
                    value: 'This is the first supporting resource with some descriptive text.',
                  },
                },
                nonFeaturedResourceLinkText: {
                  jsonValue: { value: 'Read More' },
                },
                nonFeaturedResourceLink: {
                  jsonValue: [
                    {
                      fields: {
                        generalLink: {
                          value: {
                            href: '/resource/one',
                            text: 'Read More',
                          },
                        },
                        linkIcon: {
                          fields: { value: { value: 'Description' } },
                        },
                        directoryEntry: [],
                      },
                    },
                  ],
                },
              },
              {
                nonFeaturedResourceName: {
                  jsonValue: { value: 'Resource Two' },
                },
                nonFeaturedResourceDescription: {
                  jsonValue: {
                    value: 'Here is another resource link that provides more detail.',
                  },
                },
                nonFeaturedResourceLinkText: {
                  jsonValue: { value: 'Check it out' },
                },
                nonFeaturedResourceLink: {
                  jsonValue: [
                    {
                      fields: {
                        generalLink: {
                          value: {
                            href: '/resource/two',
                            text: 'Check it out',
                          },
                        },
                        linkIcon: {
                          fields: { value: { value: 'MenuBook' } },
                        },
                        directoryEntry: [],
                      },
                    },
                  ],
                },
              },
              {
                nonFeaturedResourceName: {
                  jsonValue: { value: 'Resource Three' },
                },
                nonFeaturedResourceDescription: {
                  jsonValue: {
                    value: 'A third resource with supporting text and helpful details.',
                  },
                },
                nonFeaturedResourceLinkText: {
                  jsonValue: { value: 'Discover' },
                },
                nonFeaturedResourceLink: {
                  jsonValue: [
                    {
                      fields: {
                        generalLink: {
                          value: {
                            href: '/resource/three',
                            text: 'Discover',
                          },
                        },
                        linkIcon: {
                          fields: { value: { value: 'HelpOutline' } },
                        },
                        directoryEntry: [],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
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
            userDefaultSettings: {},
            defaultImages: {
              featuredResourcesDarkBackground: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Default image',
                1920,
                1080
              ),
              featuredResourcesLightBackground: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Default image',
                1920,
                1080
              ),
            },
            landingPageSettings: {
              newsLandingPage: {
                name: 'News',
                fields: {},
              },
            },
            scriptSettings: null,
          },
          route: {
            name: 'Featured Resources',
            placeholders: {},
          },
        },
      },
    },
  },
};
