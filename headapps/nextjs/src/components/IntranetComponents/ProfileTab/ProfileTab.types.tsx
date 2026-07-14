import { ComponentProps } from 'lib/component-props';
import type { FieldJsonValue } from '../MyNewsPreferenceSettings/MyNewsPreferenceSettings.types';

/**
 * ProfileTab content values (title, department, etc.) come at runtime from
 * the authenticated user's Google Workspace profile via `useSession()`.
 * Field labels are authored on the Account Detail datasource under the
 * `My Profile Settings` template section, and fall back to `ProfileTabStatics`
 * if a field is missing.
 */
export type ProfileTabFields = {
  profileContentTitle?: FieldJsonValue<string>;
  profileTitle?: FieldJsonValue<string>;
  profileDepartment?: FieldJsonValue<string>;
  profileAssociateId?: FieldJsonValue<string>;
  profileBusinessUnit?: FieldJsonValue<string>;
  profileCompanyCode?: FieldJsonValue<string>;
  profileManager?: FieldJsonValue<string>;
  profileEmail?: FieldJsonValue<string>;
  profileLocationTitle?: FieldJsonValue<string>;
  profileWorkplace?: FieldJsonValue<string>;
  profileCity?: FieldJsonValue<string>;
  profileState?: FieldJsonValue<string>;
};

export type ProfileTabProps = ComponentProps & {
  fields?: ProfileTabFields;
};

export const ProfileTabStatics = {
  profileContentTitle: 'Contact & Role',
  profileTitle: 'Title',
  profileDepartment: 'Department',
  profileAssociateId: 'Associate Id',
  profileBusinessUnit: 'Business Unit',
  profileCompanyCode: 'Company Code',
  profileManager: 'Manager',
  profileEmail: 'Email',
  profileLocationTitle: 'Location',
  profileWorkplace: 'Workplace',
  profileCity: 'City',
  profileState: 'State',
};
