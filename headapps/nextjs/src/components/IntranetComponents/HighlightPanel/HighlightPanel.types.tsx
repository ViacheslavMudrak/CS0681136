import { ComponentProps } from 'lib/component-props';
import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { IconItemFields } from 'ts/custom-link';

type HighlightItem = {
  itemIcon: {
    targetItem: IconItemFields;
  };
  itemName: {
    jsonValue: Field<string>;
  };
  itemDescription: {
    jsonValue: Field<string>;
  };
  textLink: {
    jsonValue: LinkField;
  };
};

type HighlightPanelFields = {
  data: {
    datasource: {
      headlineText: {
        jsonValue: Field<string>;
      };
      headlineSubtext: {
        jsonValue: Field<string>;
      };
      headlineButton: {
        jsonValue: LinkField;
      };
      mainImageOne: {
        jsonValue: ImageField;
      };
      mainImageTwo: {
        jsonValue: ImageField;
      };
      children: {
        results: HighlightItem[];
      };
    };
  };
};

export type HighlightPanelProps = ComponentProps & {
  fields: HighlightPanelFields;
};
