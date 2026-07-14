import React from 'react';
import { resolveLinkAndIcon } from 'src/util/helpers/customLinkHelpers';
import { CustomLinkItem, IconItem } from 'ts/custom-link';

import { Link as SitecoreLink, LinkField } from '@sitecore-content-sdk/nextjs';

import { MaterialIcon } from './Icon/MaterialIcon';

export type CustomLinkContext = {
  linkField: LinkField;
  iconField: IconItem;
};

export type CustomLinkProps = {
  item: CustomLinkItem | null;
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
  customLinkContent?: (ctx: CustomLinkContext) => React.ReactNode;
  isPageEditing?: boolean;
  showIcon?: boolean;
};

export const CustomLink: React.FC<CustomLinkProps> = ({
  item,
  className,
  linkClassName,
  iconClassName,
  customLinkContent,
  isPageEditing = false,
  showIcon = true,
}) => {
  const nullLinkFallback = {
    linkField: { value: { text: '' } },
    iconField: {
      value: '',
      fields: {
        value: { value: '' },
      },
    },
  };

  const resolvedLinkAndIcon = item ? resolveLinkAndIcon(item) : null;
  const linkAndIcon = resolvedLinkAndIcon ?? nullLinkFallback;
  const isNullFallback = !item || !resolvedLinkAndIcon;
  const { linkField, iconField } = linkAndIcon;

  const ctx: CustomLinkContext = { linkField, iconField };

  return (
    <span className={`${className ?? ''}`}>
      {isPageEditing && isNullFallback ? (
        <a href="" className={linkClassName}>
          {customLinkContent ? (
            customLinkContent(ctx)
          ) : (
            <>
              {showIcon && <MaterialIcon iconItem={iconField} className={iconClassName} />}
              <span>{linkField.value?.text}</span>
            </>
          )}
        </a>
      ) : (
        <SitecoreLink field={linkField} className={linkClassName}>
          {customLinkContent ? (
            customLinkContent(ctx)
          ) : (
            <>
              {showIcon && <MaterialIcon iconItem={iconField} className={iconClassName} />}
              <span>{linkField.value?.text}</span>
            </>
          )}
        </SitecoreLink>
      )}
    </span>
  );
};
