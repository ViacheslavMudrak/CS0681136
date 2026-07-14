/**
 * NOTE: This component fetches personalized market news via the /api/component-data-fetching/market-news-hero route
 * (SWR + NextAuth session). In Storybook there is no session, so useSwrWithAuth returns
 * no data and the component renders its empty shell (component chrome with no articles).
 * To see articles, run the app locally with a valid session and a datasource item that
 * has nonMarketNewsSiteArea configured.
 */

import { STORYBOOK_IMAGES, createStorybookImageField } from 'storybook/storybook-images';

import type { Meta, StoryObj } from '@storybook/react';

import MarketNewsHero from './MarketNewsHero';
import { MarketNewsHeroProps } from './MarketNewsHero.types';

const meta: Meta<typeof MarketNewsHero> = {
  title: 'Components/Market News Hero',
  component: MarketNewsHero,
};
export default meta;

type Story = StoryObj<typeof MarketNewsHero>;

const baseArgs: MarketNewsHeroProps = {
  fields: {
    placeholderImage: createStorybookImageField(
      STORYBOOK_IMAGES.heroBackgrounds.marketNewsBackground,
      'Default image',
      1920,
      1080
    ),
    optionalEyebrow: { value: 'My Top Market News' },
    featuredLinkText: { value: 'Read more' },
    nonFeaturedLinkText: { value: 'See All Market News' },
    nonMarketNewsSiteArea: { id: '{SYSTEM-NEWS-SITE-AREA-ID}', name: 'System News', fields: {} },
  },
  rendering: {
    componentName: 'MarketNewsHero',
    uid: 'mock-uid-123',
    params: {},
    fields: {},
    dataSource: 'mock-datasource',
  },
  params: {},
  stylesSXA: '',
} as unknown as MarketNewsHeroProps;

/** Default — shows component shell with no articles (no session in Storybook) */
export const Default: Story = {
  args: baseArgs,
};

/** Missing nonMarketNewsSiteArea — SWR key is null; same empty shell */
export const MissingFallbackSiteArea: Story = {
  args: {
    ...baseArgs,
    fields: {
      ...baseArgs.fields,
      nonMarketNewsSiteArea: undefined,
    },
  } as unknown as MarketNewsHeroProps,
};
