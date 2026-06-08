import React, { JSX } from 'react';
import { ComponentProps } from 'lib/component-props';
import { cn } from 'lib/utils';
import componentMap from '.sitecore/component-map';
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";

import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";

interface ContainerProps extends ComponentProps {
  params: ComponentProps["params"] & {
    BackgroundImage?: string;
    DynamicPlaceholderId: string;
  };
}

const Container = ({
  params,
  rendering,
  page,
}: ContainerProps): JSX.Element => {
  const {
    styles,
    RenderingIdentifier,
    BackgroundImage: backgroundImage,
    DynamicPlaceholderId,
  } = params;
  const phKey = `container-${DynamicPlaceholderId}`;

  const mediaUrlPattern = new RegExp(/mediaurl=\"([^"]*)\"/, "i");

  let backgroundStyle: { [key: string]: string } = {};

  if (backgroundImage && backgroundImage.match(mediaUrlPattern)) {
    const mediaUrl = backgroundImage.match(mediaUrlPattern)?.[1] || "";

    backgroundStyle = {
      backgroundImage: `url('${mediaUrl}')`,
    };
  }

  return (
    <div
      className={cn(
        'component container-default',
        styles,
        (styles ?? '').split(/\s+/).includes('fullwidth-container') && 'max-w-none',
      )}
      {...renderingAnchorIdProps(RenderingIdentifier)}
    >
      <div
        className={"component-content after:content-[''] after:table after:clear-both"}
        style={backgroundStyle}
      >
        <div className="row">
          <AppPlaceholder
            name={phKey}
            rendering={rendering}
            page={page}
            componentMap={componentMap}
            disableSuspense
          />
        </div>
      </div>
    </div>
  );
};

export const Default = ({ params, rendering, page }: ContainerProps): JSX.Element => {
  const styles = params?.styles?.split(' ');

  return styles?.includes('container') ? (
    <div className="w-full">
      <Container params={params} rendering={rendering} page={page} />
    </div>
  ) : (
    <Container params={params} rendering={rendering} page={page} />
  );
};
