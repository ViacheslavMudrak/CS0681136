/**
 * Storybook-only fork of @sitecore-content-sdk/nextjs NextImage (CJS).
 * @see sitecore-nextjs-nextimage-storybook.esm.js
 */
'use strict';
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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.NextImage = void 0;
/* eslint-disable no-unused-vars */
const media_1 = require('@sitecore-content-sdk/core/media');
const react_1 = __importDefault(require('react'));
const react_2 = require('@sitecore-content-sdk/react');
const image_1 = __importDefault(require('next/image'));
const layout_1 = require('@sitecore-content-sdk/core/layout');

exports.NextImage = (0, react_2.withFieldMetadata)(
  (0, react_2.withEmptyFieldEditingComponent)((_a) => {
    var { editable = true, imageParams, field, mediaUrlPrefix, fill, priority } = _a,
      otherProps = __rest(_a, ['editable', 'imageParams', 'field', 'mediaUrlPrefix', 'fill', 'priority']);
    react_1.default.useContext(react_2.SitecoreProviderReactContext);
    if (otherProps.src) {
      throw new Error('Detected src prop. If you wish to use src, use next/image directly.');
    }
    const dynamicMedia = field;
    if ((0, layout_1.isFieldValueEmpty)(dynamicMedia)) {
      return null;
    }
    const img = dynamicMedia.src ? field : dynamicMedia.value;
    if (!img) {
      return null;
    }
    const unoptimized = true;
    const attrs = Object.assign(
      Object.assign(Object.assign({}, img), otherProps),
      {
        fill,
        priority,
        src: media_1.mediaApi.updateImageUrl(img.src, imageParams, mediaUrlPrefix),
        unoptimized,
      },
    );
    const imageProps = Object.assign(Object.assign({}, attrs), {
      src: media_1.mediaApi.replaceMediaUrlPrefix(attrs.src, mediaUrlPrefix),
    });
    if (imageProps.fill) {
      delete imageProps.width;
      delete imageProps.height;
    }
    if (attrs) {
      return react_1.default.createElement(
        image_1.default,
        Object.assign({ alt: '' }, imageProps, process.env.TEST ? { 'data-unoptimized': unoptimized } : {}),
      );
    }
    return null;
  }, { defaultEmptyFieldEditingComponent: react_2.DefaultEmptyFieldEditingComponentImage }),
);
exports.NextImage.displayName = 'NextImage';
