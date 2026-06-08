"use client";

import { Link as ContentSdkLink, type LinkField } from "@sitecore-content-sdk/nextjs";
import NextLink from "next/link";
import type { ComponentProps, ReactElement } from "react";
import { useMemo } from "react";

import { useActiveLocale } from "@/hooks/use-active-locale";
import { localizeHref } from "@/lib/locale-path";

export type LinkRenderProps = ComponentProps<typeof ContentSdkLink>;

const FILE_EXTENSION_MATCHER = /^\/.*\.\w+$/;

type LinkValue = NonNullable<LinkField["value"]>;

type LinkFieldLike = LinkField & { href?: unknown; metadata?: unknown };

export function LinkRender({
  field,
  editable = true,
  children,
  internalLinkMatcher = /^\//g,
  showLinkTextWithChildrenPresent,
  ...rest
}: LinkRenderProps): ReactElement | null {
  const activeLocale = useActiveLocale();

  const localizedField = useMemo(() => {
    if (!field) return field;
    const linkField = field as LinkField;
    const href = linkField.value?.href?.trim();
    if (!href) return field;
    const nextHref = localizeHref(href, activeLocale);
    if (nextHref === href) return field;
    return {
      ...linkField,
      value: linkField.value ? { ...linkField.value, href: nextHref } : linkField.value,
    };
  }, [field, activeLocale]);

  const effectiveField = localizedField as LinkFieldLike | null | undefined;
  if (
    !effectiveField ||
    (!effectiveField.value && !effectiveField.href && !effectiveField.metadata)
  ) {
    return null;
  }

  const rawValue = (effectiveField.href ? effectiveField : effectiveField.value) as
    | LinkValue
    | undefined;
  const { href, querystring, anchor } = rawValue || {};
  const isEditing = Boolean(editable && effectiveField.metadata);

  if (href && !isEditing) {
    const isMatching = internalLinkMatcher.test(href);
    const isFileUrl = FILE_EXTENSION_MATCHER.test(href);
    if (isMatching && !isFileUrl) {
      const text =
        showLinkTextWithChildrenPresent || !children ? rawValue?.text || rawValue?.href : null;
      const { locale: _omitLocale, ...nextLinkRest } = rest as typeof rest & { locale?: unknown };
      return (
        <NextLink
          href={{ pathname: href, query: querystring, hash: anchor }}
          key="link"
          title={rawValue?.title}
          target={rawValue?.target}
          className={rawValue?.class}
          {...nextLinkRest}
        >
          {text}
          {children}
        </NextLink>
      );
    }
  }

  return (
    <ContentSdkLink
      field={localizedField}
      editable={editable}
      internalLinkMatcher={internalLinkMatcher}
      showLinkTextWithChildrenPresent={showLinkTextWithChildrenPresent}
      {...rest}
    >
      {children}
    </ContentSdkLink>
  );
}
