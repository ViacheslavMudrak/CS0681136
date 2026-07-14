import { ComponentProps } from 'lib/component-props';
import type {
  FieldJsonValue,
  MyNewsPreferenceSettingsFields,
} from '../MyNewsPreferenceSettings/MyNewsPreferenceSettings.types';
import type { ProfileTabFields } from '../ProfileTab/ProfileTab.types';

export type AccountTabNavigationFields = {
  profileTabLabel?: FieldJsonValue<string>;
  collaborationTabLabel?: FieldJsonValue<string>;
  settingsTabLabel?: FieldJsonValue<string>;
  myNewsPreferenceSettings?: MyNewsPreferenceSettingsFields;
  myProfileSettings?: ProfileTabFields;
};

export type AccountTabNavigationProps = ComponentProps & {
  fields: AccountTabNavigationFields;
  /** When false (public view of another user's profile), the Settings tab is hidden. Defaults to true. */
  isPersonalView?: boolean;
};

export const AccountTabNavigationStatics = {
  profileTab: 'Profile',
  collaborationSitesTab: 'Collaboration Sites',
  settingsTab: 'Settings',
};
