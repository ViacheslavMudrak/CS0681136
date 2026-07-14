import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentWithContextProps } from 'lib/component-props';
import { CustomLinkItem } from 'ts/custom-link';

export type NonFeaturedResourceItem = {
  nonFeaturedResourceName: {
    jsonValue: Field<string>;
  };
  nonFeaturedResourceDescription: {
    jsonValue: Field<string>;
  };
  nonFeaturedResourceLink: {
    jsonValue: CustomLinkItem[];
  };
  nonFeaturedResourceLinkText: {
    jsonValue: Field<string>;
  };
};

type FeaturedResourcesFields = {
  data: {
    datasource: {
      headlineTitle: {
        jsonValue: Field<string>;
      };
      featuredResourceImage: {
        jsonValue: ImageField;
      };
      featuredResourceUrl: {
        jsonValue: CustomLinkItem[];
      };
      featuredResourceOptionalEyebrow: {
        jsonValue: Field<string>;
      };
      featuredResourceHeadlineText: {
        jsonValue: Field<string>;
      };
      featuredResourceSubtext: {
        jsonValue: Field<string>;
      };

      featuredResourceMobileCtaText: {
        jsonValue: Field<string>;
      };
      children: {
        results: NonFeaturedResourceItem[];
      };
    };
  };
};

export type FeaturedResourcesVariant = 'Light' | 'Dark';

export type FeaturedResourcesProps = ComponentWithContextProps & {
  fields: FeaturedResourcesFields;
};
