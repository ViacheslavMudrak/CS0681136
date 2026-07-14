import { ComponentProps } from 'lib/component-props';
import type { Field } from '@sitecore-content-sdk/nextjs';
import type {
  FieldJsonValue,
  MyNewsPreferenceSettingsFields,
} from '../MyNewsPreferenceSettings/MyNewsPreferenceSettings.types';
import type { ProfileTabFields } from '../ProfileTab/ProfileTab.types';

export type AccountDetailDatasourceFields = MyNewsPreferenceSettingsFields &
  ProfileTabFields & {
    profileTabLabel: FieldJsonValue<string>;
    collaborationTabLabel: FieldJsonValue<string>;
    settingsTabLabel: FieldJsonValue<string>;
  };

/**
 * Raw shape returned by the rendering's ComponentQuery. The query uses
 * `fields(ownFields: true)` (a single batched resolver) instead of many
 * `field(name: "X")` calls so we stay under the Edge GraphQL per-query
 * cost limit. AccountDetail transforms this array into a keyed
 * `AccountDetailDatasourceFields` object before forwarding it downstream.
 */
export type AccountDetailRawDatasourceFieldEntry = {
  name: string;
  jsonValue: Field<unknown> | null;
};

export type AccountDetailFields = {
  data: {
    datasource: {
      fields: AccountDetailRawDatasourceFieldEntry[];
    } | null;
  };
};

export type AccountDetailProps = ComponentProps & {
  fields: AccountDetailFields;
};
