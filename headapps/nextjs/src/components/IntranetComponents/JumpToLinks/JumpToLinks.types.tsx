import { ComponentProps } from 'lib/component-props';

export type JumpLinkItem = {
  id: string;
  icon: string;
};

export type JumpToLinksProps = ComponentProps & {
  fields?: Record<string, never>; // No fields needed - component finds jumplinks from DOM
};

export const JumpToLinksStatics = {
  jumpToLinkLabel: 'Jump To:',
  authoringNote:
    'No components are configured with a jumplink icon on this page. Please add a jumplink icon on any component to enable the jumplink component.',
};
