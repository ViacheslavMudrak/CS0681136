import { ComponentProps } from 'lib/component-props';
import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { IconItemFields } from 'ts/custom-link';

type TextCardTile = {
  tileIcon: {
    targetItem: IconItemFields;
  };
  tileTitle: {
    jsonValue: Field<string>;
  };
  tileDescription: {
    jsonValue: Field<string>;
  };
  tileDestinationUrl: {
    jsonValue: LinkField;
  };
};

type TextCardGridFields = {
  data: {
    datasource: {
      optionalEyebrow: {
        jsonValue: Field<string>;
      };
      sectionHeadline: {
        jsonValue: Field<string>;
      };
      sectionSubtext: {
        jsonValue: Field<string>;
      };
      headlineButton: {
        jsonValue: LinkField;
      };
      children: {
        results: TextCardTile[];
      };
    };
  };
};

export type TextCardGridProps = ComponentProps & {
  fields: TextCardGridFields;
};
