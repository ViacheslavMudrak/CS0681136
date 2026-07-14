import type { ScriptSettings } from 'src/lib/global-scripts/types';
import { DefaultImagesModel } from 'ts/default-images';
import { LandingPageSettings } from 'ts/landing-page-settings';
import { UserDefaultSettings } from 'ts/user-default-settings';
import type { VoyagerSettingsItem } from 'ts/voyager-settings';

export type CustomSiteSettings_GraphQL = {
  layout: {
    item: {
      id: string;
      site: {
        defaultImages: {
          jsonValue: {
            fields: DefaultImagesModel | null;
          };
        };
        landingPageSettings: {
          jsonValue: { fields: LandingPageSettings | null };
        };
        voyagerSettings: {
          jsonValue: { fields: VoyagerSettingsItem | null };
        };
        userDefaultSettings: UserDefaultSettings | null;
        scriptingSettings: {
          jsonValue: { fields: ScriptSettings | null };
        };
      };
    };
  };
};
