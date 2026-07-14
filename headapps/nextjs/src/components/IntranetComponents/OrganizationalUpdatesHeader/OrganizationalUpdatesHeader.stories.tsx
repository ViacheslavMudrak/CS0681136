import type { Meta, StoryObj } from '@storybook/react';
import OrganizationalUpdatesHeader from './OrganizationalUpdatesHeader';
import type { OrganizationalUpdatesHeaderProps } from './OrganizationalUpdatesHeader.types';

const meta: Meta<OrganizationalUpdatesHeaderProps> = {
  title: 'Components/OrganizationalUpdatesHeader',
  component: OrganizationalUpdatesHeader,
  parameters: {
    layout: 'padded',
  },
  args: {
    fields: {
      to: {
        value: 'Chief Mission Integration Officers\nMission Integration Ministry-Wide Function',
      },
      cc: { value: 'Mission Leadership Team (MLT)' },
      from: {
        value: 'Tracie Loftis, Senior Vice President, Mission Integration, Ascension',
      },
    },
    rendering: {
      componentName: 'OrganizationalUpdatesHeader',
      dataSource: 'mock',
      params: {},
    },
    stylesSXA: '',
  },
};

export default meta;

type Story = StoryObj<OrganizationalUpdatesHeaderProps>;

export const Default: Story = {};

export const AllFieldsFilled: Story = {
  args: {
    fields: {
      to: {
        value: 'Chief Mission Integration Officers\nMission Integration Ministry-Wide Function',
      },
      cc: { value: 'Mission Leadership Team (MLT)' },
      from: {
        value: 'Tracie Loftis, Senior Vice President, Mission Integration, Ascension',
      },
    },
  },
};

export const WithoutCC: Story = {
  args: {
    fields: {
      to: {
        value: 'Chief Mission Integration Officers\nMission Integration Ministry-Wide Function',
      },
      cc: { value: '' },
      from: {
        value: 'Tracie Loftis, Senior Vice President, Mission Integration, Ascension',
      },
    },
  },
};

export const OnlyTo: Story = {
  args: {
    fields: {
      to: { value: 'Chief Mission Integration Officers' },
      cc: { value: '' },
      from: { value: '' },
    },
  },
};

export const OnlyFrom: Story = {
  args: {
    fields: {
      to: { value: '' },
      cc: { value: '' },
      from: { value: 'Tracie Loftis, Senior Vice President, Mission Integration, Ascension' },
    },
  },
};

export const Empty: Story = {
  args: {
    fields: {
      to: { value: '' },
      cc: { value: '' },
      from: { value: '' },
    },
  },
};
