import type { Meta, StoryObj } from '@storybook/react';
import type { Page } from '@sitecore-content-sdk/nextjs';
import { SitecoreProvider } from '@sitecore-content-sdk/nextjs';

import CdpPageView from 'components/content-sdk/CdpPageView';
import componentMap from '.sitecore/component-map.client';
import scConfig from 'sitecore.config';
import { STORY_DATASET, storyDatasetArgType } from 'src/storybook/storyDataset';

const storyPageDefault = {
  siteName: 'Storybook',
  mode: { isNormal: true, isEditing: false, isPreview: false },
  layout: {
    sitecore: {
      route: {
        itemId: '11111111-1111-1111-1111-111111111111',
        itemLanguage: 'en',
        name: 'Storybook page',
      },
      context: { variantId: '' },
    },
  },
} as unknown as Page;

const storyPageAlt = {
  ...storyPageDefault,
  layout: {
    sitecore: {
      ...storyPageDefault.layout.sitecore,
      route: {
        ...storyPageDefault.layout.sitecore.route,
        itemId: '22222222-2222-2222-2222-222222222222',
        name: 'Alt Storybook page',
      },
    },
  },
} as unknown as Page;

const meta = {
  title: 'XM / Content SDK / CDP Page View',
  component: CdpPageView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
  },
  argTypes: {
    ...storyDatasetArgType(['default', 'alternateRoute']),
  },
  decorators: [
    (Story, context) => {
      const key = (context.args as Record<string, unknown>)[STORY_DATASET];
      const page = key === 'alternateRoute' ? storyPageAlt : storyPageDefault;
      return (
        <SitecoreProvider api={scConfig.api} componentMap={componentMap} page={page}>
          <Story />
        </SitecoreProvider>
      );
    },
  ],
} satisfies Meta<{ storyDataset?: 'default' | 'alternateRoute' }>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * CDP page view hook — renders empty fragment; requires `SitecoreProvider` + route `itemId` for `useSitecore`.
 * In development, `CdpPageView` skips firing events (see component source). Default story uses the primary route stub.
 */
export const Default: Story = {
  render: () => <CdpPageView />,
  args: {
    [STORY_DATASET]: 'default',
  },
};

export const AlternateRouteContext: Story = {
  name: 'Route: Alternate context',
  render: () => <CdpPageView />,
  args: {
    [STORY_DATASET]: 'alternateRoute',
  },
};
