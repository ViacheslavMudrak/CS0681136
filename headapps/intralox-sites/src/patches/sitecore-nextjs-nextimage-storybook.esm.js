/**
 * Storybook-only fork of @sitecore-content-sdk/nextjs NextImage (ESM).
 *
 * Upstream sets `unoptimized = otherProps.unoptimized || !page.mode.isNormal`. In Storybook
 * `isNormal` is true, so `unoptimized` becomes false and next/image requests `/_next/image`,
 * which the Storybook dev server does not implement → 404 for `/storybook/*` and broken Edge URLs.
 *
 * Wired via `NormalModuleReplacementPlugin` in `.storybook/main.ts` (not used by `next build`).
 *
 * @see https://storybook.js.org/docs/get-started/frameworks/nextjs#parameters (`nextjs.image.unoptimized`)
 */
'use client';
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
/* eslint-disable no-unused-vars */
import { mediaApi } from '@sitecore-content-sdk/core/media';
import React from 'react';
import {
  withFieldMetadata,
  SitecoreProviderReactContext,
  DefaultEmptyFieldEditingComponentImage,
  withEmptyFieldEditingComponent,
} from '@sitecore-content-sdk/react';
import Image from 'next/image';
import { isFieldValueEmpty } from '@sitecore-content-sdk/core/layout';

export const NextImage = withFieldMetadata(
  withEmptyFieldEditingComponent((_a) => {
    var { editable = true, imageParams, field, mediaUrlPrefix, fill, priority } = _a,
      otherProps = __rest(_a, ['editable', 'imageParams', 'field', 'mediaUrlPrefix', 'fill', 'priority']);
    React.useContext(SitecoreProviderReactContext);
    if (otherProps.src) {
      throw new Error('Detected src prop. If you wish to use src, use next/image directly.');
    }
    const dynamicMedia = field;
    if (isFieldValueEmpty(dynamicMedia)) {
      return null;
    }
    const img = dynamicMedia.src ? field : dynamicMedia.value;
    if (!img) {
      return null;
    }
    const unoptimized = true;
    const attrs = Object.assign(
      Object.assign(Object.assign({}, img), otherProps),
      { fill, priority, src: mediaApi.updateImageUrl(img.src, imageParams, mediaUrlPrefix), unoptimized },
    );
    const imageProps = Object.assign(Object.assign({}, attrs), {
      src: mediaApi.replaceMediaUrlPrefix(attrs.src, mediaUrlPrefix),
    });
    if (imageProps.fill) {
      delete imageProps.width;
      delete imageProps.height;
    }
    if (attrs) {
      return React.createElement(
        Image,
        Object.assign({ alt: '' }, imageProps, process.env.TEST ? { 'data-unoptimized': unoptimized } : {}),
      );
    }
    return null;
  }, { defaultEmptyFieldEditingComponent: DefaultEmptyFieldEditingComponentImage }),
);
NextImage.displayName = 'NextImage';
