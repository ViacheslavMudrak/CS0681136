import { Field, ImageFieldValue, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type ImageFieldWithDescription = {
  value: ImageFieldValue;
  description?: Field<string>;
};

type PhotoGalleryFields = {
  datasource: {
    optionalEyebrow: Field<string>;
    headlineText: Field<string>;
    subtext: Field<string>;
    buttonLinkOne: LinkField;
    buttonLinkTwo: LinkField;
  };
  mediaItems: ImageFieldWithDescription[];
};

export type PhotoGalleryProps = ComponentProps & {
  fields: PhotoGalleryFields;
};

export type PhotoGalleryVariant = 'SingleImageDisplay' | 'CarouselDisplay' | 'FourImageDisplay';

export type LightboxProps = {
  images: { src: string; caption?: string }[];
  startIndex?: number;
  onClose: () => void;
};

export const PhotoGalleryStatics = {
  noImagesNote:
    'Authoring note: No images are selected to be displayed. This component will be hidden on the live site with no images.',
};
