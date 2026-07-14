import type { ScriptSettings } from 'src/lib/global-scripts/types';
import { DefaultImagesModel } from 'ts/default-images';
import { LandingPageSettings } from 'ts/landing-page-settings';
import { UserDefaultSettings } from 'ts/user-default-settings';

import '@sitecore-content-sdk/content/layout';

export type BasePageFields = {
  title?: { value: string };
  pageIntroduction?: { value: string };
  content?: { value: string };
};

declare module '@sitecore-content-sdk/content/layout' {
  interface LayoutServiceContext {
    // Adding the defaultImages property to the LayoutServiceContext interface
    defaultImages: DefaultImagesModel | null;
    landingPageSettings: LandingPageSettings | null;
    userDefaultSettings: UserDefaultSettings | null;
    scriptSettings: ScriptSettings | null;
    homePageId: string | null;
  }
}
