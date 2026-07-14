import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import type { GoogleProfileData } from 'ts/google';

type KeyPerson = {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: {
    description: Field<string>;
    emailAccount: Field<string>;
    overrideLocation: Field<string>;
    overridePhoneNumber: Field<string>;
    overrideEmail: Field<string>;
    overrideJobTitle: Field<string>;
    overrideName: Field<string>;
    overrideProfileImage: ImageField;
  };
};

type KeyPeopleComponentFields = {
  headlineText: Field<string>;
  peopleSelection: KeyPerson[];
};

export type KeyPeopleComponentProps = ComponentProps & {
  fields: KeyPeopleComponentFields;
  googleProfiles?: Record<string, GoogleProfileData | null>;
};

export type KeyPeopleComponentVariant = 'LightTheme' | 'DarkTheme';
