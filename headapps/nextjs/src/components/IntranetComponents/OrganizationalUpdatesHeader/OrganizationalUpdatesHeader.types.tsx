import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type OrganizationalUpdatesHeaderFields = {
  to: Field<string>;
  cc: Field<string>;
  from: Field<string>;
};

export type OrganizationalUpdatesHeaderProps = ComponentProps & {
  fields: OrganizationalUpdatesHeaderFields;
};

export const OrganizationalUpdatesHeaderStatics = {
  OrganizationalUpdatesHeaderTo: 'TO:',
  OrganizationalUpdatesHeaderCc: 'CC:',
  OrganizationalUpdatesHeaderFrom: 'FROM:',
};
