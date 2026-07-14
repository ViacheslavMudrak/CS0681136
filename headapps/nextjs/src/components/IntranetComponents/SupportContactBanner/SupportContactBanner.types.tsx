import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { IconItemFields } from 'ts/custom-link';

type SupportItem = {
  linkIcon: {
    targetItem: IconItemFields;
  };
  contactName: {
    jsonValue: Field<string>;
  };
  linkUrl: {
    jsonValue: LinkField;
  };
};

type SupportContactBannerFields = {
  data: {
    datasource: {
      optionalEyebrow: {
        jsonValue: Field<string>;
      };
      headlineText: {
        jsonValue: Field<string>;
      };
      children: {
        results: SupportItem[];
      };
    };
  };
};

export type SupportContactBannerProps = ComponentProps & {
  fields: SupportContactBannerFields;
};
