import React, { JSX } from 'react';
import { Link, LinkField, Text, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from 'lib/utils';

import { renderingAnchorId } from 'src/utils/renderingAnchorProps';

interface Item {
  url: {
    path: string;
    siteName: string;
  };
  field: {
    jsonValue: {
      value: string;
    };
  };
}

interface TitleProps extends ComponentProps {
  fields: {
    /**
     * The Integrated graphQL query result. This illustrates the way to access the context item datasource information.
     */
    data?: {
      datasource?: Item;
      contextItem?: Item;
    };
  };
}

interface ComponentContentProps {
  id?: string;
  styles?: string;
  children: React.ReactNode;
}

const ComponentContent = ({ id, styles = '', children }: ComponentContentProps): JSX.Element => (
  <div className={cn('component title bg-transparent', styles)} id={id}>
    <div className="component-content">
      <div className="field-title border-b border-solid border-accent-teal text-font-extrabig mb-[10px] pb-[10px] text-ink-secondary leading-normal block no-underline cursor-pointer hover:text-ink-subtle [&_a]:no-underline [&_span]:no-underline">
        {children}
      </div>
    </div>
  </div>
);

export const Default = ({ params, fields, page }: TitleProps): JSX.Element => {
  const { styles } = params;
  const datasource = fields?.data?.datasource || fields?.data?.contextItem;
  const datasourceField: TextField = datasource?.field?.jsonValue as TextField;
  const contextField: TextField = page.layout.sitecore.route?.fields?.Title as TextField;
  const titleField: TextField = datasourceField || contextField;

  const link: LinkField = {
    value: {
      href: datasource?.url?.path,
      title:
        (titleField?.value ? String(titleField.value) : undefined) ||
        datasource?.field?.jsonValue?.value,
    },
  };

  return (
    <ComponentContent styles={styles} id={renderingAnchorId(params.RenderingIdentifier)}>
      {page.mode.isEditing ? (
        <Text field={titleField} />
      ) : (
        <Link field={link}>
          <Text field={titleField} />
        </Link>
      )}
    </ComponentContent>
  );
};
