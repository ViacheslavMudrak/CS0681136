import type { Meta, StoryObj } from '@storybook/react';
import SaveTheDate from './SaveTheDate';
import type { SaveTheDateProps } from './SaveTheDate.types';

const meta: Meta<SaveTheDateProps> = {
  title: 'Components/SaveTheDate',
  component: SaveTheDate,
  args: {
    rendering: {
      uid: 'Empty',
      componentName: 'SaveTheDate',
      dataSource: 'Empty',
    },
    params: {},
    fields: {
      data: {
        datasource: {
          headline: {
            jsonValue: { value: 'Save the Date' },
          },
          children: {
            results: [
              {
                date: { jsonValue: { value: '7 October 2026' } },
                eventTitle: {
                  jsonValue: {
                    value:
                      'Event title goes here Lorem Ipsum dolor sit amet Event title goes here Lorem Ipsum dolor sit amet',
                  },
                },
                time: { jsonValue: { value: '9:00 AM – 12:00 PM CST' } },
                eventDescription: {
                  jsonValue: {
                    value:
                      'Event description here Lorem ipsum dolor set amit adispicing Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.',
                  },
                },
                buttonLink: {
                  jsonValue: {
                    value: {
                      href: '/events/leadership-summit',
                      text: 'Learn more',
                    },
                  },
                },
              },
              {
                date: { jsonValue: { value: '7 October 2026' } },
                eventTitle: {
                  jsonValue: { value: 'Event title goes here Lorem Ipsum dolor sit amet' },
                },
                time: { jsonValue: { value: '9:00 AM – 12:00 PM CST' } },
                eventDescription: {
                  jsonValue: {
                    value:
                      'Event description here Lorem ipsum dolor set amit adispicing Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.',
                  },
                },
                buttonLink: {
                  jsonValue: {
                    value: {
                      href: '/events/leadership-summit',
                      text: 'Learn more',
                    },
                  },
                },
              },
              {
                date: { jsonValue: { value: '7 October 2026' } },
                eventTitle: {
                  jsonValue: { value: 'Event title goes here Lorem Ipsum dolor sit amet' },
                },
                time: { jsonValue: { value: '9:00 AM – 12:00 PM CST' } },
                eventDescription: {
                  jsonValue: {
                    value:
                      'Event description here Lorem ipsum dolor set amit adispicing Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.',
                  },
                },
                buttonLink: {
                  jsonValue: {
                    value: {
                      href: '/events/leadership-summit',
                      text: 'Learn more',
                    },
                  },
                },
              },
              {
                date: { jsonValue: { value: '7 October 2026' } },
                eventTitle: {
                  jsonValue: { value: 'Event title goes here Lorem Ipsum dolor sit amet' },
                },
                time: { jsonValue: { value: '9:00 AM – 12:00 PM CST' } },
                eventDescription: {
                  jsonValue: {
                    value:
                      'Event description here Lorem ipsum dolor set amit adispicing Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.',
                  },
                },
                buttonLink: {
                  jsonValue: {
                    value: {
                      href: '/events/leadership-summit',
                      text: 'Learn more',
                    },
                  },
                },
              },
              {
                date: { jsonValue: { value: '7 October 2026' } },
                eventTitle: {
                  jsonValue: { value: 'Event 5 title goes here Lorem Ipsum dolor sit amet' },
                },
                time: { jsonValue: { value: '9:00 AM – 12:00 PM CST' } },
                eventDescription: {
                  jsonValue: {
                    value:
                      'Event description here Lorem ipsum dolor set amit adispicing Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.',
                  },
                },
                buttonLink: {
                  jsonValue: {
                    value: {
                      href: '/events/leadership-summit',
                      text: 'Learn more',
                    },
                  },
                },
              },
              {
                date: { jsonValue: { value: '7 October 2026' } },
                eventTitle: {
                  jsonValue: { value: 'Event 6 title goes here Lorem Ipsum dolor sit amet' },
                },
                time: { jsonValue: { value: '9:00 AM – 12:00 PM CST' } },
                eventDescription: {
                  jsonValue: {
                    value:
                      'Event description here Lorem ipsum dolor set amit adispicing Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.',
                  },
                },
                buttonLink: {
                  jsonValue: {
                    value: {
                      href: '/events/leadership-summit',
                      text: 'Learn more',
                    },
                  },
                },
              },
              {
                date: { jsonValue: { value: '7 October 2026' } },
                eventTitle: {
                  jsonValue: { value: 'Event 7 title goes here Lorem Ipsum dolor sit amet' },
                },
                time: { jsonValue: { value: '9:00 AM – 12:00 PM CST' } },
                eventDescription: {
                  jsonValue: {
                    value:
                      'Event description here Lorem ipsum dolor set amit adispicing Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.',
                  },
                },
                buttonLink: {
                  jsonValue: {
                    value: {
                      href: '/events/leadership-summit',
                      text: 'Learn more',
                    },
                  },
                },
              },
              {
                date: { jsonValue: { value: '7 October 2026' } },
                eventTitle: {
                  jsonValue: { value: 'Event 8 title goes here Lorem Ipsum dolor sit amet' },
                },
                time: { jsonValue: { value: '9:00 AM – 12:00 PM CST' } },
                eventDescription: {
                  jsonValue: {
                    value:
                      'Event description here Lorem ipsum dolor set amit adispicing Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.',
                  },
                },
                buttonLink: {
                  jsonValue: {
                    value: {
                      href: '/events/leadership-summit',
                      text: 'Learn more',
                    },
                  },
                },
              },
              {
                date: { jsonValue: { value: '7 October 2026' } },
                eventTitle: {
                  jsonValue: { value: 'Event 8 title goes here Lorem Ipsum dolor sit amet' },
                },
                time: { jsonValue: { value: '9:00 AM – 12:00 PM CST' } },
                eventDescription: {
                  jsonValue: {
                    value:
                      'Event description here Lorem ipsum dolor set amit adispicing Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.',
                  },
                },
                buttonLink: {
                  jsonValue: {
                    value: {
                      href: '/events/leadership-summit',
                      text: 'Learn more',
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
};

export default meta;

type Story = StoryObj<SaveTheDateProps>;

export const Default: Story = {};
