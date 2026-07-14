import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { CustomLinkItem } from 'ts/custom-link';

type LinkListFields = {
  optionalEyebrow: Field<string>;
  headlineText: Field<string>;
  subtext: Field<string>;
  links: CustomLinkItem[];
};

export type LinkListProps = ComponentProps & {
  fields: LinkListFields;
};

export type LinkListVariant =
  | 'HalfGrid'
  | 'FullGridFourColumn'
  | 'FullGridThreeColumn'
  | 'TilesWithDescriptions';

// Configuration for each variant of the LinkList component
export const VARIANT_CONFIG: Record<
  LinkListVariant,
  {
    desktopCols: number;
    gridColsClass: string;
    containerLayout: string;
    contentWrapperClass: string;
    wrapperClass: string;
    tileLinkClass: string;
    shouldRenderDescription: boolean;
  }
> = {
  HalfGrid: {
    desktopCols: 2,
    gridColsClass: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    containerLayout: 'flex-col md:flex-row items-center',
    contentWrapperClass: 'flex flex-col flex-[1_1_50%] justify-center',
    wrapperClass: 'w-full md:flex-[1_1_50%]',
    tileLinkClass: 'items-center justify-center gap-2',
    shouldRenderDescription: false,
  },
  FullGridFourColumn: {
    desktopCols: 4,
    gridColsClass: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    containerLayout: 'flex-col',
    contentWrapperClass: '',
    wrapperClass: '',
    tileLinkClass: 'items-center justify-center gap-2',
    shouldRenderDescription: false,
  },
  FullGridThreeColumn: {
    desktopCols: 3,
    gridColsClass: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    containerLayout: 'flex-col',
    contentWrapperClass: '',
    wrapperClass: '',
    tileLinkClass: 'items-center justify-center gap-2',
    shouldRenderDescription: false,
  },
  TilesWithDescriptions: {
    desktopCols: 4,
    gridColsClass: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    containerLayout: 'flex-col',
    contentWrapperClass: '',
    wrapperClass: '',
    tileLinkClass: 'flex-col items-start text-left gap-1',
    shouldRenderDescription: true,
  },
};
