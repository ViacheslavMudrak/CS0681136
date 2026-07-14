import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type IconField = {
  jsonValue: {
    id: string;
    url: string;
    name: string;
    displayName: string;
    fields: {
      value: {
        value: string;
      };
    };
  };
};

type ReflectionDetailBannerDatasourceFields = {
  reflectionThoughtLabel?: { jsonValue: Field<string> };
  reflectionThoughtIcon?: IconField;
  reflectionThoughtDescription?: { jsonValue: Field<string> };
  reflectionCallToActionLabel?: { jsonValue: Field<string> };
  reflectionCallToActionIcon?: IconField;
  reflectionCallToActionDescription?: { jsonValue: Field<string> };
  reflectionPrayerLabel?: { jsonValue: Field<string> };
  reflectionPrayerIcon?: IconField;
  reflectionPrayerDescription?: { jsonValue: Field<string> };
  reflectionDetails?: { jsonValue: Field<string> };
};

export type ReflectionDetailBannerProps = ComponentProps & {
  fields: {
    data: {
      datasource: ReflectionDetailBannerDatasourceFields;
    };
  };
};
