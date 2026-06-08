import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  LinkField,
  Text,
} from '@sitecore-content-sdk/nextjs';
import React from 'react';
import { cn } from 'lib/utils';
import { ComponentProps } from 'lib/component-props';

import { renderingAnchorId, renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

interface ImageFields {
  Image: ImageField;
  ImageCaption: Field<string>;
  TargetUrl: LinkField;
}

interface ImageProps extends ComponentProps {
  fields: ImageFields;
}

const ImageWrapper: React.FC<{
  className: string;
  id?: string;
  children: React.ReactNode;
}> = ({ className, id, children }) => (
  <div className={className.trim()} id={id}>
    <div className="component-content">{children}</div>
  </div>
);

const ImageDefault: React.FC<ImageProps> = ({ params }) => (
  <ImageWrapper
    className={cn(
      'component image [&_img]:h-auto [&_img]:w-full [&_a]:inline-block [&_a]:max-w-full',
      params.styles,
    )}
  >
    <span className="is-empty-hint">Image</span>
  </ImageWrapper>
);

export const Banner: React.FC<ImageProps> = ({ params, fields }) => {
  const { styles } = params;
  const imageField = fields.Image && {
    ...fields.Image,
    value: {
      ...fields.Image.value,
      style: { objectFit: 'cover', width: '100%', height: '100%' },
    },
  };

  return (
    <div
      className={cn('component hero-banner', styles)}
      {...renderingAnchorIdProps(params.RenderingIdentifier)}
    >
      <div className="component-content sc-sxa-image-hero-banner">
        <ContentSdkImage field={imageField} loading="eager" fetchPriority="high" />
      </div>
    </div>
  );
};

export const Default: React.FC<ImageProps> = (props) => {
  const { fields, params, page } = props;
  const { styles } = params;

  if (!fields) {
    return <ImageDefault {...props} />;
  }

  const Image = () => <ContentSdkImage field={fields.Image} />;
  const shouldWrapWithLink =
    !page.mode.isEditing && fields.TargetUrl?.value?.href;

  return (
    <ImageWrapper
      className={cn(
        'component image [&_img]:h-auto [&_img]:w-full [&_a]:inline-block [&_a]:max-w-full',
        styles,
      )}
      id={renderingAnchorId(params.RenderingIdentifier)}
    >
      {shouldWrapWithLink ? (
        <ContentSdkLink field={fields.TargetUrl}>
          <Image />
        </ContentSdkLink>
      ) : (
        <Image />
      )}
      <Text
        tag="span"
        className="block italic text-font-small text-ink-secondary field-imagecaption"
        field={fields.ImageCaption}
      />
    </ImageWrapper>
  );
};
