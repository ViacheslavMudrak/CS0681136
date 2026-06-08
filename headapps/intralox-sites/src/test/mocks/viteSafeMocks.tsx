import { type ReactNode } from "react";
import React from "react";
import { vi } from "vitest";

/** Mocks loaded via dynamic import so `vi.mock` factories stay JSX-free for Vite import-analysis (Windows-safe). */
export function mediaTileVideoMock() {
  return {
    default: ({ videoId, title }: { videoId: string; title?: string }) => (
      <div data-testid="media-tile-video-mock" data-video-id={videoId}>
        {title ?? "video"}
      </div>
    ),
  };
}

export function brightcoveVideoIdOnlyMock() {
  return {
    default: ({ videoId }: { videoId: string }) => (
      <div data-testid="brightcove-video">{videoId}</div>
    ),
  };
}

export function imageViewPlaceholderMock() {
  return {
    ImageView: () => <div data-testid="image-view" />,
  };
}

export function tabAccordionTabPlaceholderMock() {
  return {
    TabAccordionTabPlaceholder: ({ name }: { name?: string }) => (
      <div data-testid="sitecore-placeholder" data-placeholder-name={name} />
    ),
  };
}

/** Pass-through HOC used by ContentBlock and similar; partial SDK mocks must include it. */
export function sitecoreDatasourceCheckPassthrough() {
  return {
    withDatasourceCheck:
      () =>
      <P extends object>(Component: React.ComponentType<P>) =>
        Component,
  };
}

export function mediaTileSitecoreSdkMock() {
  return {
    ...sitecoreDatasourceCheckPassthrough(),
    Text: ({
      field,
      tag = "span",
      ...rest
    }: {
      field?: { value?: unknown };
      tag?: string;
    }) =>
      React.createElement(
        tag,
        { "data-testid": "text-field", ...rest },
        field?.value !== undefined && field?.value !== null
          ? String(field.value)
          : "",
      ),
    RichText: ({
      field,
      className,
    }: {
      field?: { value?: string };
      className?: string;
    }) => (
      <div data-testid="rich-text" className={className}>
        {field?.value ?? ""}
      </div>
    ),
    NextImage: () => <img data-testid="next-image" alt="" src="/mock.jpg" />,
    Link: ({
      field,
      className,
      children,
      showLinkTextWithChildrenPresent,
    }: {
      field?: { value?: { href?: string; text?: string } };
      className?: string;
      children?: React.ReactNode;
      showLinkTextWithChildrenPresent?: boolean;
    }) => (
      <a
        data-testid="content-link"
        className={className}
        href={field?.value?.href ?? "#"}
      >
        {showLinkTextWithChildrenPresent ? (
          <>
            {field?.value?.text}
            {children}
          </>
        ) : (
          (children ?? field?.value?.text)
        )}
      </a>
    ),
  };
}

export function testimonialSitecoreSdkMock() {
  return {
    ...sitecoreDatasourceCheckPassthrough(),
    Text: ({ field }: { field?: { value?: string }; tag?: string }) =>
      field?.value != null ? (
        <span data-testid="sdk-text">{field.value}</span>
      ) : null,
    RichText: ({ field }: { field?: { value?: string } }) =>
      field?.value != null ? (
        <blockquote data-testid="sdk-richtext">{field.value}</blockquote>
      ) : null,
    Link: ({
      field,
      children,
      ...rest
    }: {
      field?: { value?: { href?: string; text?: string } };
      children?: ReactNode;
      [key: string]: unknown;
    }) =>
      field?.value?.href != null ? (
        <a data-testid="sdk-link" href={field.value.href} {...rest}>
          {children ?? field.value.text}
        </a>
      ) : null,
    NextImage: ({
      field,
    }: {
      field?: { value?: { src?: string; alt?: string } };
    }) =>
      field?.value?.src != null ? (
        <img
          data-testid="sdk-image"
          src={field.value.src}
          alt={field.value.alt ?? ""}
        />
      ) : null,
  };
}

export function testimonialAttributionSitecoreSdkMock() {
  return {
    Text: ({ field }: { field?: { value?: string }; tag?: string }) =>
      field?.value != null ? (
        <span data-testid="sdk-text">{String(field.value)}</span>
      ) : null,
    NextImage: ({
      field,
    }: {
      field?: { value?: { src?: string; alt?: string } };
    }) =>
      field?.value?.src != null ? (
        <img
          data-testid="sdk-image"
          src={field.value.src}
          alt={field.value.alt ?? ""}
        />
      ) : null,
  };
}

export function testimonialCardSitecoreSdkMock() {
  return {
    Text: ({ field }: { field?: { value?: string }; tag?: string }) =>
      field?.value != null ? (
        <span data-testid="sdk-text">{field.value}</span>
      ) : null,
    RichText: ({ field }: { field?: { value?: string } }) =>
      field?.value != null ? (
        <blockquote data-testid="sdk-richtext">{field.value}</blockquote>
      ) : null,
    Link: ({
      field,
      children,
      ...rest
    }: {
      field?: { value?: { href?: string; text?: string; target?: string } };
      children?: ReactNode;
      [key: string]: unknown;
    }) =>
      field?.value?.href != null ? (
        <a data-testid="sdk-link" href={field.value.href} {...rest}>
          {children ?? field.value.text}
        </a>
      ) : null,
    NextImage: ({
      field,
    }: {
      field?: { value?: { src?: string; alt?: string } };
    }) =>
      field?.value?.src != null ? (
        <img
          data-testid="sdk-image"
          src={field.value.src}
          alt={field.value.alt ?? ""}
        />
      ) : null,
  };
}

export function quickLinkSitecoreSdkMock() {
  return {
    ...sitecoreDatasourceCheckPassthrough(),
    useSitecore: () => ({
      page: { mode: { isEditing: false, isPreview: false } },
    }),
    Text: ({
      field,
      tag = "span",
      ...rest
    }: {
      field?: { value?: string };
      tag?: string;
      [key: string]: unknown;
    }) =>
      React.createElement(
        tag,
        { "data-testid": "sdk-text", ...rest },
        field?.value != null ? String(field.value) : "",
      ),
    RichText: ({ field }: { field?: { value?: string } }) =>
      field?.value != null ? (
        <div data-testid="sdk-richtext">{field.value}</div>
      ) : null,
    Link: ({
      field,
      children,
      editable: _editable,
      showLinkTextWithChildrenPresent: _showLinkTextWithChildrenPresent,
      ...rest
    }: {
      field?: { value?: { href?: string; text?: string; target?: string } };
      children?: ReactNode;
      editable?: boolean;
      showLinkTextWithChildrenPresent?: boolean;
      [key: string]: unknown;
    }) => {
      const href = field?.value?.href;
      const text = field?.value?.text;
      const show =
        href != null && String(href).trim().length > 0 ?
          true
        : Boolean(_editable && (text != null || children != null));
      return show ?
          <a data-testid="sdk-link" href={href && String(href).trim() ? href : '#'} {...rest}>
            {children ?? text}
          </a>
        : null;
    },
    NextImage: ({
      field,
    }: {
      field?: { value?: { src?: string; alt?: string } };
    }) =>
      field?.value?.src != null ? (
        <img
          data-testid="sdk-image"
          src={field.value.src}
          alt={field.value.alt ?? ""}
        />
      ) : null,
  };
}

export function mergeContentSwitcherSitecoreSdk(
  actual: typeof import("@sitecore-content-sdk/nextjs"),
) {
  return {
    ...actual,
    RichText: ({
      field,
      className,
      tag: tagProp,
    }: {
      field?: { value?: string };
      className?: string;
      tag?: string;
    }) => (
      <div data-rich-text={tagProp ?? "div"} className={className}>
        {field?.value}
      </div>
    ),
    Placeholder: ({ name }: { name?: string }) => (
      <div data-testid="sitecore-placeholder" data-placeholder-name={name} />
    ),
  };
}

export function contentSwitcherClientViMock() {
  return {
    ContentSwitcherClient: vi.fn(
      ({ fields }: { fields: { Headline: { value: string } } }) => (
        <div data-testid="mock-content-switcher-client">
          {fields.Headline.value}
        </div>
      ),
    ),
  };
}

export function navigationDefaultViMock() {
  return {
    Default: vi.fn(() => <div data-testid="header-navigation-mock" />),
  };
}

/** Text + Link mocks for footer and layout FAB tests (editing mode + empty href). */
export function footerFloatingActionSitecoreSdkMock() {
  return {
    Text: ({
      field,
      tag = "span",
      className,
      ...rest
    }: {
      field?: { value?: unknown };
      tag?: string;
      className?: string;
    }) =>
      React.createElement(
        tag,
        { "data-testid": "sdk-text", className, ...rest },
        field?.value !== undefined && field?.value !== null
          ? String(field.value)
          : "",
      ),
    Link: ({
      field,
      children,
      editable,
      className,
      ...rest
    }: {
      field?: {
        value?: {
          href?: string;
          text?: string;
          title?: string;
          target?: string;
        };
      };
      children?: React.ReactNode;
      editable?: boolean;
      className?: string;
      [key: string]: unknown;
    }) => {
      const href = field?.value?.href;
      if (!href?.trim() && !editable) {
        return null;
      }
      return (
        <a
          data-testid="sdk-link"
          className={className}
          href={href?.trim() ? href : "#"}
          {...rest}
        >
          {children ?? field?.value?.text}
        </a>
      );
    },
  };
}
