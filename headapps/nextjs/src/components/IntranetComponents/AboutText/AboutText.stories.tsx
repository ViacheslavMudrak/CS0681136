import type { Meta, StoryObj } from '@storybook/react';
import AboutText from './AboutText';
import type { AboutTextProps } from './AboutText.types';

const meta: Meta<typeof AboutText> = {
  title: 'Components/AboutText',
  component: AboutText,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<AboutTextProps>;

export const Default: Story = {
  args: {
    rendering: {
      uid: 'Empty',
      componentName: 'AboutText',
      dataSource: 'Empty',
      params: {
        textOnLeft: '0',
      },
    },
    fields: {
      headline: {
        value: 'Our Mission',
      },
      subHeadline: {
        value: 'Headline goes here to engage visitors',
      },
      body: {
        value:
          '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent nisi dolor, pellentesque eu rhoncus id, gravida non felis. Sed faucibus et quam ut suscipit. Nulla pretium aliquam porttitor. Vivamus pharetra odio sed sodales porta. Vivamus magna augue, venenatis id imperdiet vitae, pharetra ac magna. Mauris laoreet neque a imperdiet viverra. Etiam id nunc ut nisl tincidunt egestas. Phasellus accumsan eros in ipsum bibendum, sed elementum risus aliquet.</p>',
      },
    },
  },
};
