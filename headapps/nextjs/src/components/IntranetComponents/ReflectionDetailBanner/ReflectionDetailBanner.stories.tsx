import React from 'react';

import { LayoutServicePageState, type Page } from '@sitecore-content-sdk/nextjs';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ReflectionDetailBanner from './ReflectionDetailBanner';
import type { ReflectionDetailBannerProps } from './ReflectionDetailBanner.types';

type BannerStoryProps = ReflectionDetailBannerProps & { page: Page };

const meta: Meta<BannerStoryProps> = {
  title: 'Components/Reflection Detail Banner',
  component: ReflectionDetailBanner as unknown as React.ComponentType<BannerStoryProps>,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<BannerStoryProps>;

export const Default: Story = {
  args: {
    fields: {
      data: {
        datasource: {
          reflectionThoughtLabel: {
            jsonValue: {
              value: 'For reflection & discussion',
            },
          },
          reflectionThoughtIcon: {
            jsonValue: {
              id: 'd124c9bf-ebb6-4306-b479-e76fa07564cd',
              url: '/Settings/Authoring-Control-Settings/Icons/QuestionAnswer',
              name: 'QuestionAnswer',
              displayName: 'QuestionAnswer',
              fields: {
                value: {
                  value: 'QuestionAnswer',
                },
              },
            },
          },
          reflectionThoughtDescription: {
            jsonValue: {
              value:
                '<p>Reflect on your encounters this week. Where did you make a difference in the lives of others? How did your efforts give witness to our Value of Integrity?</p>',
            },
          },
          reflectionCallToActionLabel: {
            jsonValue: {
              value: 'Call to action',
            },
          },
          reflectionCallToActionIcon: {
            jsonValue: {
              id: '3e40c13b-18cb-492f-ab60-cf3bbbb92f6b',
              url: '/Settings/Authoring-Control-Settings/Icons/Campaign',
              name: 'Campaign',
              displayName: 'Campaign',
              fields: {
                value: {
                  value: 'Campaign',
                },
              },
            },
          },
          reflectionCallToActionDescription: {
            jsonValue: {
              value:
                '<p>What will you do this week to demonstrate integrity and inspire trust in your team?</p>',
            },
          },
          reflectionPrayerLabel: {
            jsonValue: {
              value: 'Prayer',
            },
          },
          reflectionPrayerIcon: {
            jsonValue: {
              id: '26676022-1605-4930-b4a7-1e2399118f53',
              url: '/Settings/Authoring-Control-Settings/Icons/FavoriteBorderOutlined',
              name: 'FavoriteBorderOutlined',
              displayName: 'HeartIcon',
              fields: {
                value: {
                  value: 'FavoriteBorderOutlined',
                },
              },
            },
          },
          reflectionPrayerDescription: {
            jsonValue: {
              value:
                '<p>God of our journey, fill us with the spirit of Integrity. As we serve faithfully and engage fully in our shared work, may our words and actions demonstrate solidarity and collaboration. With eager and grateful hearts, we pray. Amen.</p>',
            },
          },
        },
      },
    },
    rendering: {
      componentName: 'ReflectionDetailBanner',
      uid: 'reflection-detail-banner-mock',
      dataSource: 'Empty',
      params: {},
    },
    params: {},
    stylesSXA: '',

    page: {
      locale: 'en',
      mode: {
        name: LayoutServicePageState.Normal,
        isNormal: true,
        isPreview: false,
        isEditing: false,
        isDesignLibrary: false,
        designLibrary: { isVariantGeneration: false },
      },
      layout: {
        sitecore: {
          context: {
            homePageId: '103C8B2F-80E2-4FA6-A6C6-B1C621D0110D',
            itemPath: '/sitecore/test',
            defaultImages: null,
            landingPageSettings: null,
            userDefaultSettings: null,
            scriptSettings: null,
          },
          route: {
            name: 'Reflection Detail Page',
            placeholders: {},
            fields: {
              title: { value: 'Brother Bonaventure Thelen Day' },
              quote: { value: '"Brother Bonaventure Thelen Day"' },
              author: { value: 'Nour Salmeen' },
              bodyText: {
                value:
                  "<p><b>Today as we remember Brother Bonaventure Thelen and the legacy of the Alexian Brothers — one of Ascension's Historic Founders, let's connect to our Value of Service of the Poor.</b></p><p>Brother Bonaventure Thelen (1825-1898) arrived in the U.S. from Europe and established the first Alexian Brothers Hospital for men and boys in a small house in Chicago.</p>",
              },
            },
          },
        },
      },
    },
  },
};
