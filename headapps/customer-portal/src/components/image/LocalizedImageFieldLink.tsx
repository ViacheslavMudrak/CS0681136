"use client";

import type { LinkField } from "@sitecore-content-sdk/nextjs";
import Link from "next/link";
import type { FC, ReactElement, ReactNode } from "react";
import { useMemo } from "react";

import { useActiveLocale } from "@/hooks/use-active-locale";
import { localizeHref } from "@/lib/locale-path";

/**
 * Renders a Sitecore link field with `next/link` or `<a>` (no Sitecore SDK `Link`), so React 19
 * does not see invalid DOM props such as `locale={false}` on anchors.
 */
const ImageLinkFromField: FC<{
  field: LinkField;
  className?: string;
  children: ReactNode;
}> = ({ field, className, children }) => {
  const href = field.value?.href?.trim();
  if (!href) {
    return <>{children}</>;
  }

  const target = field.value?.target;
  const rel = target === "_blank" ? "noopener noreferrer" : undefined;
  const isNonRelative = /^[a-z][a-z0-9+.-]*:/i.test(href);

  if (isNonRelative) {
    return (
      <a href={href} className={className} target={target || undefined} rel={rel}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} target={target || undefined} rel={rel}>
      {children}
    </Link>
  );
};

export type LocalizedImageFieldLinkProps = {
  field: LinkField;
  className?: string;
  children: ReactNode;
};

/**
 * Image wrapper link with the same href localization as shared `LinkRender`, without Content SDK
 * `Link` (avoids `locale` on DOM under React 19).
 */
export function LocalizedImageFieldLink({
  field,
  className,
  children,
}: LocalizedImageFieldLinkProps): ReactElement {
  const activeLocale = useActiveLocale();

  const localizedField = useMemo(() => {
    const href = field.value?.href?.trim();
    if (!href) return field;
    const nextHref = localizeHref(href, activeLocale);
    if (nextHref === href) return field;
    return {
      ...field,
      value: field.value ? { ...field.value, href: nextHref } : field.value,
    };
  }, [field, activeLocale]);

  return (
    <ImageLinkFromField field={localizedField} className={className}>
      {children}
    </ImageLinkFromField>
  );
}
