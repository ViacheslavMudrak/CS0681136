import { ComponentProps } from 'lib/component-props';
import { Icon } from 'ts/common-sitecore-field-types';
import type { IconItem } from 'ts/custom-link';

import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

export type GqlField<T> = { jsonValue?: Field<T> };
export type GqlBooleanLike = boolean | number | string;

export type LinkedSystemItem = {
  id: string;
  name: string;
  generalLink?: { jsonValue?: LinkField };
};

export type GqlTile = {
  id: string;
  name: string;
  tileIcon?: { jsonValue?: IconItem };
  tileName?: GqlField<string>;
  tileDescription?: GqlField<string>;
  buttonLink?: { jsonValue?: LinkField };
  showAsDefaultTile?: GqlField<GqlBooleanLike>;
  linkedSystems?: {
    targetItems?: LinkedSystemItem[];
  };
};

export type GqlDatasource = {
  headline?: GqlField<string>;
  modalTitle?: GqlField<string>;
  modalDirections?: GqlField<string>;
  selectTwoModulesErrorMessage?: GqlField<string>;
  selectOneMoreModulesErrorMessage?: GqlField<string>;
  informationalNoteHeadline?: GqlField<string>;
  informationalNoteContent?: GqlField<string>;
  children?: {
    results?: GqlTile[];
  };
};

type DfdTilesFields = {
  title: Field<string>;
};

export type BasedfdTileFields = {
  tileIcon?: Icon;
  tileName?: Field<string>;
  tileDescription?: Field<string>;
  buttonLink?: LinkField;
  linkedSystems?: {
    targetItems?: LinkedSystemItem[];
  };
  showAsDefaultTile?: Field<boolean>;
};

export type DfdTilesProps = ComponentProps & {
  fields: DfdTilesFields;
  rendering?: {
    fields?: {
      data?: {
        datasource?: GqlDatasource;
      };
    };
    params?: {
      RenderingIdentifier?: string;
    };
  };
  stylesSXA?: string;
};

export type CardItem = {
  id: string;
  raw: GqlTile;
};

export type ColumnsState = Record<'col1' | 'col2' | 'col3', CardItem[]>;

export type ModalTileItem = {
  id: string;
  name: string;
  isVisible: boolean;
  order?: number;
};

export const DFDTileDictionary = {
  Expand: 'Expand',
  Collapse: 'Collapse',
  Saving: 'SAVING...',
  SaveChanges: 'SAVE CHANGES',
  Cancel: 'Cancel',
};
