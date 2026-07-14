import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import TabContainer from './TabContainer';
import type { TabContainerProps } from './TabContainer.types';
import { STORYBOOK_IMAGES, createStorybookImageField } from 'storybook/storybook-images';

const meta: Meta<typeof TabContainer> = {
  title: 'Components/Tab Content',
  component: TabContainer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<TabContainerProps>;

export const StandardTabs: Story = {
  args: {
    rendering: {
      componentName: 'TabContainer',
      dataSource: 'Tab Content',
      fields: {
        headline: { value: 'Featured Content' },
        tabs: [
          {
            id: '1',
            name: 'Tab 1',
            fields: {
              tabLabel: { value: 'Community Health' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              date: { value: 'January 15, 2024' },
              headline: { value: 'Building Healthier Communities Together' },
              description: {
                value:
                  'Our community health initiatives focus on providing accessible healthcare services and education to underserved populations.',
              },
              link: {
                value: {
                  href: '/community-health',
                  text: 'Learn More',
                },
              },
            },
          },
          {
            id: '2',
            name: 'Tab 2',
            fields: {
              tabLabel: { value: 'Patient Care' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              date: { value: 'January 10, 2024' },
              headline: { value: 'Compassionate Care for Every Patient' },
              description: {
                value:
                  'We provide personalized, compassionate care that addresses the unique needs of each patient and their family.',
              },
              link: {
                value: {
                  href: '/patient-care',
                  text: 'Read More',
                },
              },
            },
          },
          {
            id: '3',
            name: 'Tab 3',
            fields: {
              tabLabel: { value: 'Medical Innovation' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              date: { value: 'January 5, 2024' },
              headline: { value: 'Advancing Healthcare Through Innovation' },
              description: {
                value:
                  'Our commitment to medical innovation ensures patients receive the most advanced treatments and technologies available.',
              },
              link: {
                value: {
                  href: '/innovation',
                  text: 'Discover More',
                },
              },
            },
          },
        ],
      },
    },
    params: {},
  },
  render: (args) => <TabContainer {...args} />,
};

export const WithImageOnlyTab: Story = {
  args: {
    rendering: {
      componentName: 'TabContainer',
      dataSource: 'Tab Content',
      fields: {
        headline: { value: 'Our Facilities' },
        tabs: [
          {
            id: '1',
            name: 'Tab 1',
            fields: {
              tabLabel: { value: 'Main Campus' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              imageOnly: { value: true },
            },
          },
          {
            id: '2',
            name: 'Tab 2',
            fields: {
              tabLabel: { value: 'Emergency Center' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              date: { value: 'Open 24/7' },
              headline: { value: 'Emergency Services Available Around the Clock' },
              description: {
                value: 'Our emergency department is staffed with expert physicians and nurses.',
              },
            },
          },
          {
            id: '3',
            name: 'Tab 3',
            fields: {
              tabLabel: { value: 'Surgical Suites' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              imageOnly: { value: true },
            },
          },
        ],
      },
    },
    params: {},
  },
  render: (args) => <TabContainer {...args} />,
};

export const WithTextOnlyTab: Story = {
  args: {
    rendering: {
      componentName: 'TabContainer',
      dataSource: 'Tab Content',
      fields: {
        headline: { value: 'Important Announcements' },
        tabs: [
          {
            id: '1',
            name: 'Tab 1',
            fields: {
              tabLabel: { value: 'Visitor Policy' },
              date: { value: 'Updated January 2024' },
              headline: { value: 'New Visitor Guidelines' },
              description: {
                value:
                  'We have updated our visitor policy to ensure the safety and comfort of all patients. Please review the new guidelines before your visit.',
              },
              link: {
                value: {
                  href: '/visitor-policy',
                  text: 'View Full Policy',
                },
              },
              textOnly: { value: true },
            },
          },
          {
            id: '2',
            name: 'Tab 2',
            fields: {
              tabLabel: { value: 'News Update' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              date: { value: 'January 12, 2024' },
              headline: { value: 'Award-Winning Care Recognition' },
              description: {
                value:
                  'Our hospital has been recognized for excellence in patient care and safety.',
              },
            },
          },
          {
            id: '3',
            name: 'Tab 3',
            fields: {
              tabLabel: { value: 'Community Notice' },
              date: { value: 'Ongoing' },
              headline: { value: 'Free Health Screenings Available' },
              description: {
                value:
                  'Join us for free health screenings every first Saturday of the month. No appointment necessary.',
              },
              link: {
                value: {
                  href: '/screenings',
                  text: 'Learn More',
                },
              },
              textOnly: { value: true },
            },
          },
        ],
      },
    },
    params: {},
  },
  render: (args) => <TabContainer {...args} />,
};

export const TwoTabs: Story = {
  args: {
    rendering: {
      componentName: 'TabContainer',
      dataSource: 'Tab Content',
      fields: {
        headline: { value: 'Our Services' },
        tabs: [
          {
            id: '1',
            name: 'Tab 1',
            fields: {
              tabLabel: { value: 'Primary Care' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              date: { value: 'Available Now' },
              headline: { value: 'Comprehensive Primary Care Services' },
              description: {
                value: 'Expert primary care physicians dedicated to your health and wellness.',
              },
              link: {
                value: {
                  href: '/primary-care',
                  text: 'Schedule Appointment',
                },
              },
            },
          },
          {
            id: '2',
            name: 'Tab 2',
            fields: {
              tabLabel: { value: 'Specialty Care' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              date: { value: 'By Referral' },
              headline: { value: 'Advanced Specialty Medical Care' },
              description: {
                value: 'Access to leading specialists across multiple medical disciplines.',
              },
              link: {
                value: {
                  href: '/specialty-care',
                  text: 'Explore Specialties',
                },
              },
            },
          },
        ],
      },
    },
    params: {},
  },
  render: (args) => <TabContainer {...args} />,
};

export const MixedContentTypes: Story = {
  args: {
    rendering: {
      componentName: 'TabContainer',
      dataSource: 'Tab Content',
      fields: {
        headline: { value: 'Explore Our Hospital' },
        tabs: [
          {
            id: '1',
            name: 'Tab 1',
            fields: {
              tabLabel: { value: 'Standard' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              date: { value: 'Featured' },
              headline: { value: 'Standard Card Layout' },
              description: {
                value:
                  'This tab shows the standard layout with image, date, headline, and description.',
              },
              link: {
                value: {
                  href: '#',
                  text: 'Learn More',
                },
              },
            },
          },
          {
            id: '2',
            name: 'Tab 2',
            fields: {
              tabLabel: { value: 'Image Only' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              imageOnly: { value: true },
            },
          },
          {
            id: '3',
            name: 'Tab 3',
            fields: {
              tabLabel: { value: 'Text Only' },
              date: { value: 'Important' },
              headline: { value: 'Text Only Card Layout' },
              description: {
                value:
                  'This tab demonstrates the text-only layout with centered content and no image.',
              },
              link: {
                value: {
                  href: '#',
                  text: 'Read More',
                },
              },
              textOnly: { value: true },
            },
          },
          {
            id: '4',
            name: 'Tab 4',
            fields: {
              tabLabel: { value: 'Another Standard' },
              image: createStorybookImageField(
                STORYBOOK_IMAGES.content.sampledoctor1,
                'Another standard',
                600,
                400
              ),
              date: { value: 'Recent' },
              headline: { value: 'Another Standard Card' },
              description: {
                value: 'Back to the standard layout with all content elements.',
              },
            },
          },
        ],
      },
    },
    params: {},
  },
  render: (args) => <TabContainer {...args} />,
};
