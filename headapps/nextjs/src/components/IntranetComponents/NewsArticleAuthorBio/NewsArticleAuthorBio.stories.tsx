import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NewsArticleAuthorBioComponent } from './NewsArticleAuthorBio';
import { NewsArticleAuthorBioProps } from './NewsArticleAuthorBio.types';

const meta: Meta<typeof NewsArticleAuthorBioComponent> = {
  title: 'Components/NewsArticleAuthorBio',
  component: NewsArticleAuthorBioComponent,
};

export default meta;
type Story = StoryObj<NewsArticleAuthorBioProps>;

const defaultProps: NewsArticleAuthorBioProps = {
  rendering: {
    uid: 'news-article-author-bio-1',
    componentName: 'NewsArticleAuthorBio',
    dataSource: '',
    params: {},
  },
  params: {},
  fields: {
    authorImage: {
      value: {
        src: '/images/sample-doctor-1.png',
        alt: 'Author profile picture',
        width: '180',
        height: '180',
      },
    },
    optionalEyebrow: {
      value: 'ABOUT THE AUTHOR',
    },
    authorName: {
      value: 'Author Name Here',
    },
    authorBio: {
      value:
        'Author bio and description goes here lorem ipsum dolor sit amet, mentitum reprimique et eum. Ne eam affert congue lus vide accumsan suscipit an, at legendos persequeris mel.',
    },
  },
};

export const Default: Story = {
  args: defaultProps,
};

export const LongBio: Story = {
  args: {
    ...defaultProps,
    fields: {
      ...defaultProps.fields,
      authorBio: {
        value:
          'Dr. Jane Smith is a board-certified physician with over 15 years of experience in internal medicine. She completed her medical degree at Johns Hopkins University School of Medicine and her residency at Massachusetts General Hospital. Dr. Smith is passionate about preventive care and patient education. In her spare time, she enjoys hiking, photography, and spending time with her family. She has published numerous articles in peer-reviewed medical journals and frequently speaks at national medical conferences.',
      },
    },
  },
};

export const DefaultEyebrow: Story = {
  args: {
    ...defaultProps,
    fields: {
      ...defaultProps.fields,
      optionalEyebrow: undefined, // Will use default "About the Author"
    },
  },
};

export const CustomEyebrow: Story = {
  args: {
    ...defaultProps,
    fields: {
      ...defaultProps.fields,
      optionalEyebrow: {
        value: 'MEET THE EXPERT',
      },
    },
  },
};

export const NoBio: Story = {
  args: {
    ...defaultProps,
    fields: {
      ...defaultProps.fields,
      authorBio: undefined,
    },
  },
};
