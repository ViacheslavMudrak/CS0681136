import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import type { VisibilitySettings, PageSecurityData } from 'lib/auth/page-security-service';
import type { AncestorWithVisibility } from 'src/util/helpers/visibility-helpers';

export type SearchSchemaProps = ComponentProps & {
  fields: SearchSchemaFields;
  pageSecurityData?: PageSecurityData | null;
};

type SearchSchemaFields = {
  data?: {
    contextItem?: {
      id?: string;
      name?: string;
      lastUpdated?: Field<string>;
      template?: {
        id?: string;
        name?: string;
        baseTemplates?: Array<{ id?: string; name?: string }>;
      };
      visibleBy?: { targetItems?: VisibilitySettings[] };
      ancestors?: AncestorWithVisibility[];
    };
  };
};
