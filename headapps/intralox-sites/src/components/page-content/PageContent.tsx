import React, { JSX } from 'react';
import {
  RichText as ContentSdkRichText,
  RichTextField,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from 'lib/utils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

interface Fields {
  Content: RichTextField;
}

type PageContentProps = ComponentProps & {
  fields: Fields;
};

export const Default = ({ params, fields, page }: PageContentProps): JSX.Element => {
  const { styles } = params;

  const field = fields?.Content ?? (page.layout.sitecore.route?.fields?.Content as RichTextField);

  return (
    <div
      className={cn('component content', styles)}
      {...renderingAnchorIdProps(params.RenderingIdentifier)}
    >
      <div className="component-content">
        <div className="field-content">
          {field ? <ContentSdkRichText field={field} /> : '[Content]'}
        </div>
      </div>
    </div>
  );
};
