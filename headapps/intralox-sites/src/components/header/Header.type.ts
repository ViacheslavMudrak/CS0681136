import type { ComponentProps } from 'lib/component-props';

import type { NavigationFields } from '../navigation/Navigation.type';

/**
 * Props for the Header component. Fields match the NavigationFields shape
 * since Sitecore delivers all navigation data on the Header rendering.
 */
export type HeaderProps = ComponentProps & {
  fields: NavigationFields;
};
