import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Default as ResourceBar } from './ResourceBar';
import type { ResourceBarProps } from './ResourceBar.types';
import { LinkField } from '@sitecore-content-sdk/nextjs';

const meta: Meta<typeof ResourceBar> = {
  title: 'Components/Resource Bar',
  component: ResourceBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ResourceBarProps>;

export const Primary: Story = {
  args: {
    rendering: {
      uid: 'Empty',
      componentName: 'ResourceBar',
      dataSource: 'Empty',
    },
    params: {},
    fields: {
      items: [
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'PhotoFilterSharp' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'PasswordSharp' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'VerifiedUserOutlined' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'ScheduleOutlined' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'InsertChartOutlined' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
      ],
    },
  },
};

export const Secondary: Story = {
  args: {
    rendering: {
      uid: 'Empty',
      componentName: 'ResourceBar',
      dataSource: 'Empty',
    },
    params: {},
    fields: {
      items: [
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'PhotoFilterSharp' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'PasswordSharp' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'VerifiedUserOutlined' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'ScheduleOutlined' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'InsertChartOutlined' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'InsertChartOutlined' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'InsertChartOutlined' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'InsertChartOutlined' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'InsertChartOutlined' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
        {
          fields: {
            tileName: { value: 'Resource Name' },
            tileDescription: { value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
            tileLinkReference: [
              {
                fields: {
                  linkIcon: { fields: { value: { value: 'InsertChartOutlined' } } },
                  generalLink: {
                    value: {
                      text: '',
                      anchor: '',
                      linktype: 'internal',
                      class: '',
                      title: '',
                      target: '_blank',
                      querystring: '',
                      id: '{103C8B2F-80E2-4FA6-A6C6-B1C621D0110D}',
                      href: '/',
                    },
                  } as LinkField,
                  directoryEntry: [],
                },
              },
            ],
          },
        },
      ],
    },
  },
};
