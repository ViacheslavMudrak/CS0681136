import type { Meta, StoryObj } from '@storybook/react';
import EmployeeSpotlight from './EmployeeSpotlight';
import type { EmployeeSpotlightProps } from './EmployeeSpotlight.types';

const meta: Meta<EmployeeSpotlightProps> = {
  title: 'Components/EmployeeSpotlight',
  component: EmployeeSpotlight,
  tags: ['autodocs'],
  parameters: {},
};

export default meta;

type Story = StoryObj<EmployeeSpotlightProps>;

export const Default: Story = {
  args: {
    fields: {
      spotlightImage: {
        value: {
          src: '/images/sample-doctor-1.png',
          alt: 'Employee Photo',
        },
      },
      headline: { value: 'About Erlyn' },
      spotlight1Tag: { value: 'Associate:' },
      spotlight1Value: { value: 'Erlyn Espino, RN' },
      spotlight2Tag: { value: 'Department' },
      spotlight2Value: {
        value: 'Cardiology, Ascension Saint Alexius Cardiology',
      },
      spotlight3Tag: { value: 'Years of service' },
      spotlight3Value: { value: '3' },
    },
    rendering: {
      componentName: 'EmployeeSpotlight',
      dataSource: 'mock',
      params: {},
    },
    stylesSXA: '',
  },
};
