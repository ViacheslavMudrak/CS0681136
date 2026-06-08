import type { Meta, StoryObj } from '@storybook/react';

import { STORY_DATASET, storyDatasetArgType } from 'src/storybook/storyDataset';

const meta = {
  title: 'Development / Storybook Shell',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    [STORY_DATASET]: 'default',
  },
  argTypes: {
    ...storyDatasetArgType(['default', 'emphasis']),
  },
} satisfies Meta<{ storyDataset?: 'default' | 'emphasis' }>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Uses design-system Tailwind tokens from globals (same chain as Next `layout.tsx`).
 */
export const Default: Story = {
  render: (args) => {
    const tone =
      args[STORY_DATASET] === 'emphasis'
        ? 'border-brand-red bg-surface-muted-light'
        : 'border-stroke-default bg-surface';
    return (
      <div className={`font-roboto max-w-md rounded border p-6 shadow-sm ${tone}`}>
        <p className="text-font-medium font-medium text-ink-primary">Storybook — intralox-sites</p>
        <p className="mt-3 text-font-normal leading-relaxed text-ink-secondary">
          Phase 2: `globals.css` → `main.scss`, Swiper base CSS, and Roboto via preview decorator match the
          Next root layout.
        </p>
      </div>
    );
  },
};
