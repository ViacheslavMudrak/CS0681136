/**
 * Shared Storybook control: pick a canned **dataset** (fields / page / params / props)
 * with inline radios instead of editing large objects in Controls.
 */
export const STORY_DATASET = 'storyDataset' as const;

export type WithStoryDataset = {
  [STORY_DATASET]?: string;
};

export function stripStoryDataset<A extends object>(args: A): Omit<A, typeof STORY_DATASET> {
  const { [STORY_DATASET]: _removed, ...rest } = args as A & WithStoryDataset;
  return rest as Omit<A, typeof STORY_DATASET>;
}

/**
 * Merges `datasets[args.storyDataset]` over args (after stripping `storyDataset`).
 * Unknown preset keys fall back to `fallbackKey`.
 */
export function mergeStoryDataset<A extends object>(
  args: A,
  datasets: Record<string, Partial<A>>,
  fallbackKey: string,
): Omit<A, typeof STORY_DATASET> {
  const raw = (args as Record<string, unknown>)[STORY_DATASET];
  const key = typeof raw === 'string' && raw in datasets ? raw : fallbackKey;
  const patch = datasets[key] ?? datasets[fallbackKey] ?? {};
  return { ...stripStoryDataset(args), ...patch } as Omit<A, typeof STORY_DATASET>;
}

export function storyDatasetArgType(
  options: readonly string[],
  labels?: { name?: string; description?: string },
): Record<typeof STORY_DATASET, object> {
  return {
    [STORY_DATASET]: {
      name: labels?.name ?? 'Content dataset',
      description:
        labels?.description ??
        'Switch canned mock data (fields / editing / params). The full fields object stays hidden from Controls when disabled there.',
      control: 'inline-radio',
      options: [...options],
    },
  };
}
