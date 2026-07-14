import { ComponentProps } from 'lib/component-props';

import type { Field } from '@sitecore-content-sdk/nextjs';

export type FieldJsonValue<T> = { jsonValue: Field<T> };

export type MyNewsPreferenceSettingsFields = {
  newsPrefsSectionHeading: FieldJsonValue<string>;
  newsHomeSiteLabel: FieldJsonValue<string>;
  newsHomeSiteDescription: FieldJsonValue<string>;
  newsHomeSiteChangeLinkText: FieldJsonValue<string>;
  newsHomeSiteUnknownChangeLinkText: FieldJsonValue<string>;
  newsSupplementalSitesLabel: FieldJsonValue<string>;
  newsSupplementalSitesDescription: FieldJsonValue<string>;
  newsSupplementalSitesChangeLinkText: FieldJsonValue<string>;
  newsSupplementalSitesNoneChangeLinkText: FieldJsonValue<string>;
  maxSupplementalSites: FieldJsonValue<number>;
};

export type MyNewsPreferenceSettingsProps = ComponentProps & {
  fields: MyNewsPreferenceSettingsFields;
  /** Called when the user clicks the Homepage News change/select button. Wired up in IE-619 FE. */
  onOpenHomeSiteModal?: () => void;
  /** Called when the user clicks the My News Feed change/select button. Wired up in IE-619 FE. */
  onOpenSupplementalSitesModal?: () => void;
};

export const MyNewsPreferenceSettingsStatics = {
  settingsTitle: 'Personalization Settings',
  homepageNewsTitle: 'Homepage News',
  homepageNewsDescription: 'Customize the top of your homepage by selecting a topic.',
  homepageNewsChangeLinkText: 'Change Topic',
  homepageNewsUnknownChangeLinkText: 'Select Topic',
  myNewsFeedTitle: 'My News Feed',
  myNewsFeedDescription:
    'Customize My News Feed by selecting one or more topics. These will be shown lower on your personalized homepage.',
  myNewsFeedChangeLinkText: 'Change Topics',
  myNewsFeedNoneChangeLinkText: 'Select Topics',
  maxSupplementalSites: 5,

  homePageNewsModalTitle: 'Homepage News',
  homePageNewsModalDescription: 'Customize the top of your homepage by selecting a topic',
  homePageNewsModalWarning:
    'You have not selected a topic. You will see only System News on your Homepage until you select a topic below.',
  homePageNewsModalCancelButton: 'Cancel',
  homePageNewsModalSaveButton: 'Save',
  myNewsFeedModalTitle: 'My News Feed',
  myNewsFeedModalDescription:
    'Customize My News Feed by selecting one or more topics. These will be shown lower on your personalized homepage.',
  myNewsFeedModalCancelButton: 'Cancel',
  myNewsFeedModalSaveButton: 'Save',
  unknownSiteLabel: 'Unknown',
};
