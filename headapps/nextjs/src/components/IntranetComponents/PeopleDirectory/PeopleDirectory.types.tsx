import { ComponentProps } from 'lib/component-props';
import { ControlSettingItem } from 'src/ts/control-setting';

import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

type PeopleDirectoryFields = {
  headline: Field<string>;
  placeholder: Field<string>;
  companyCode: ControlSettingItem[];
  commonFilterCTA1?: LinkField;
  commonFilterCTA2?: LinkField;
  commonFilterCTA3?: LinkField;
};

export type PeopleDirectoryProps = ComponentProps & {
  fields: PeopleDirectoryFields;
};

/** Dictionary keys and fallback values for static text in PeopleDirectory */
export const PeopleDirectoryDictionary = {
  FilterBy: 'Filter By:',
  Filter: 'Filter',
  Location: 'Location',
  Department: 'Department',
  ClearAll: 'Clear All',
  ApplyFilter: 'Apply Filter',
  Results: 'results',
  For: 'for',
  Clear: 'Clear',
  ErrorMessage: 'Unable to load directory. Please try again later.',
  NoMatchesTitle: 'No matches found',
  NoMatchesMessage: 'Try different search terms or adjust your filters.',
};
