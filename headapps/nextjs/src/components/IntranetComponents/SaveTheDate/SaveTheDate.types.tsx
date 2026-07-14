import { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type EventHighlightFields = {
  date: {
    jsonValue: Field<string>;
  };
  eventTitle: {
    jsonValue: Field<string>;
  };
  time: {
    jsonValue: Field<string>;
  };
  eventDescription: {
    jsonValue: Field<string>;
  };
  buttonLink: {
    jsonValue: LinkField;
  };
};

type SaveTheDateFields = {
  data: {
    datasource: {
      headline: {
        jsonValue: Field<string>;
      };
      children: {
        results: EventHighlightFields[];
      };
    };
  };
};

export type SaveTheDateProps = ComponentProps & {
  fields: SaveTheDateFields;
};

export type EventCardProps = {
  event: EventHighlightFields;
  isPageEditing: boolean;
};
