import type { Meta, StoryObj } from '@storybook/react';

import PeopleDirectory from './PeopleDirectory';
import type { PeopleDirectoryProps } from './PeopleDirectory.types';

const meta: Meta<typeof PeopleDirectory> = {
  title: 'Components/People Directory',
  component: PeopleDirectory,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<PeopleDirectoryProps>;

export const Primary: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'PeopleDirectory',
      dataSource: 'mock-datasource',
      params: {},
      placeholders: {},
      fields: {},
    },
    stylesSXA: '',
    fields: {
      headline: { value: 'Department People Directory' },
      placeholder: { value: 'Search name, job title, location, and more...' },
      companyCode: [
        { fields: { value: { value: 'Engineering' } } },
        { fields: { value: { value: 'Tech Support' } } },
      ],
      commonFilterCTA1: {
        value: {
          href: '#',
          text: 'ACRI Support',
          title: 'department:AP Digital and Bus Solutions',
          linktype: 'internal',
        },
      },
      commonFilterCTA2: {
        value: {
          href: '#',
          text: 'Managers',
          title: 'isManager:Y',
          linktype: 'internal',
        },
      },
      commonFilterCTA3: {
        value: {
          href: '#',
          text: 'AscTech',
          title: 'employeeClass:C04',
          linktype: 'internal',
        },
      },
    },
  },
};
