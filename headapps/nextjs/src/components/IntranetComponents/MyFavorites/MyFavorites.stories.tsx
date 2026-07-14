import type { Meta, StoryObj } from '@storybook/react';

import MyFavorites from './MyFavorites';
import { MyFavoritesProps } from './MyFavorites.types';

const meta: Meta<typeof MyFavorites> = {
  title: 'Components/MyFavorites',
  component: MyFavorites,
};

export default meta;

type Story = StoryObj<typeof MyFavorites>;

const mockFavoriteItem = (icon: string, href: string, text: string) => ({
  fields: {
    title: {
      value: text,
    },
    url: {
      value: href,
    },
    icon: {
      value: icon,
    },
  },
});

export const Default: Story = {
  args: {
    rendering: {
      uid: 'MyFavorites-MockRendering',
      componentName: 'MyFavorites',
      dataSource: 'MockDataSource',
      params: {},
      fields: {},
    },
    stylesSXA: '',
    params: {},
    fields: {
      title: { value: 'My Top Favorites' },
      seeAllFavoritesLinkText: { value: 'See All Favorites' },
      addFavoriteIcon: { value: 'FavoriteBorderOutlined' },
      addFavoriteIcon_hover: { value: 'FavoriteOutlined' },
      addFavoriteText: { value: 'Add a Favorite' },
      defaultFavorites: [
        mockFavoriteItem('LocationOnOutlined', '/', 'St. Vincent Indiana'),
        mockFavoriteItem('CalendarMonth', '/', 'Location Schedule'),
        mockFavoriteItem('PolicyOutlined', '/', 'PolicyStat'),
        mockFavoriteItem('DescriptionOutlined', '/', 'License & Certifications'),
        mockFavoriteItem('SchoolOutlined', '/', 'Trainings'),
        mockFavoriteItem('AssignmentOutlined', '/', 'Benefits'),
      ],
    },
  } as MyFavoritesProps,
};
