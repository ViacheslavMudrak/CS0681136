import React from "react";

import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  LinkField,
  Text,
} from "@sitecore-content-sdk/nextjs";

import { LocalizedImageFieldLink } from "@/components/image/LocalizedImageFieldLink";
import { ComponentProps } from "lib/component-props";

/**
 * Header/default image links use {@link LocalizedImageFieldLink} so wrapped targets stay
 * locale-aware without Sitecore SDK `Link` (React 19 rejects `locale={false}` on anchors). Other
 * CMS links continue to use shared `LinkRender`.
 */

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
  <ImageWrapper className={`component image ${params.styles}`}>
    <span className="is-empty-hint">Image</span>
  </ImageWrapper>
);

export const Banner: React.FC<ImageProps> = ({ params, fields }) => {
  const { styles, RenderingIdentifier: id } = params;
  const imageField = fields.Image && {
    ...fields.Image,
    value: {
      ...fields.Image.value,
      style: { objectFit: "cover", width: "100%", height: "100%" },
    },
  };

  return (
    <div className={`component hero-banner ${styles}`.trim()} id={id}>
      <div className="component-content sc-sxa-image-hero-banner">
        <ContentSdkImage field={imageField} loading="eager" fetchPriority="high" />
      </div>
    </div>
  );
};

export const FavIcon: React.FC<ImageProps> = ({fields}) => {
  return <link rel="icon" href={fields.Image?.value?.src} sizes="32x32" type="image/png" />;
};

export const HeaderLogo: React.FC<ImageProps> = ({ params, fields, page }) => {
  const { styles, RenderingIdentifier: id } = params;
  const imageField = fields?.Image &&
    fields.Image.value && {
    ...fields.Image,
    value: {
      ...fields.Image.value,
      style: {
        objectFit: "cover",
        width: "100%",
        height: "100%",
      },
    },
  };

  if (!imageField) {
    return (
      <div className={`component image-header-logo ${styles ?? ""}`.trim()} id={id}>
        <div className="component-content sc-sxa-image-header-logo" />
      </div>
    );
  }

  const content = <ContentSdkImage field={imageField} loading="eager" fetchPriority="high" />;

  const shouldWrapWithLink = !page?.mode?.isEditing && Boolean(fields?.TargetUrl?.value?.href);
  return (
    <div className="component image-header-logo" id={id}>
      <div className="component-content sc-sxa-image-header-logo w-[88px] h-[60px] md:w-[120px] lg:h-[72px] shrink-0 items-center justify-center overflow-hidden">
        {shouldWrapWithLink && fields.TargetUrl ? (
          <LocalizedImageFieldLink field={fields.TargetUrl}>{content}</LocalizedImageFieldLink>
        ) : (
          content
        )}
      </div>
    </div>
  );
};

export const Default: React.FC<ImageProps> = (props) => {
  const { fields, params, page } = props;
  const { styles, RenderingIdentifier: id } = params;

  if (!fields) {
    return <ImageDefault {...props} />;
  }

  const Image = () => <ContentSdkImage field={fields.Image} />;
  const shouldWrapWithLink = !page.mode.isEditing && fields.TargetUrl?.value?.href;

  return (
    <ImageWrapper className={`component image ${styles}`} id={id}>
      {shouldWrapWithLink ? (
        <LocalizedImageFieldLink field={fields.TargetUrl}>
          <Image />
        </LocalizedImageFieldLink>
      ) : (
        <Image />
      )}
      <Text tag="span" className="image-caption field-imagecaption" field={fields.ImageCaption} />
    </ImageWrapper>
  );
};
