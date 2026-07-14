import type { Meta, StoryObj } from '@storybook/react';

import DfdTilePayInformation from './DfdTilePayInformation';
import type { DfdTilePayInformationProps } from './DfdTilePayInformation.types';

const meta: Meta<typeof DfdTilePayInformation> = {
  title: 'Components/DfdTilePayInformation',
  component: DfdTilePayInformation,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<DfdTilePayInformationProps>;

const mockProps: DfdTilePayInformationProps = {
  rendering: {
    componentName: 'DfdTilePayInformation',
    uid: 'dfd-expenses-story',
    dataSource: 'Empty',
    params: {},
  },

  params: {},

  fields: {
    tileIcon: {
      name: 'AccountBalanceWallet',
      fields: {
        value: {
          value: 'AccountBalanceWallet',
        },
      },
    },
    tileName: {
      value: 'Pay Information',
    },
    tileLabel: {
      value: 'Next Pay Date',
    },
    paystubsDeeplink: {
      value: {
        href: ' https://ibpcjb-dev1.fa.ocs.oraclecloud.com/fscmUI/redwood/payslips/payslips/launch',
        text: 'View Paystubs',
      },
    },
    payrollCalendarDeeplink: {
      value: {
        href: 'https://ascensionprod.service-now.com/hrportal?id=kb_article_view&sysparm_article=KB123031',
        text: 'View Payroll Calendar',
      },
    },
    manageDirectDepositDeeplink: {
      value: {
        href: 'https://ibpcjb-dev1.fa.ocs.oraclecloud.com/fscmUI/redwood/payment-methods/paymentmethods/mypaymentmethods',
        text: 'Manage Direct Deposit',
      },
    },
    w2FormsDeeplink: {
      value: {
        href: 'https://ibpcjb-dev1.fa.ocs.oraclecloud.com/fscmUI/redwood/year-end-documents/year-end-documents/launch',
        text: 'View W2 Forms',
      },
    },
    payIncreasesDeeplink: {
      value: {
        href: 'https://ibpcjb-dev1.fa.ocs.oraclecloud.com/fscmUI/redwood/compensation-salary/mycompensation/mycompensation-main',
        text: 'View Pay Increases',
      },
    },
  },
};

export const Default: Story = {
  args: mockProps,
};
