/**
 * Fork of @sitecore-content-sdk/nextjs Link (ESM) for Next.js App Router.
 * Upstream passes `locale: false` to next/link, which React 19 forwards to the DOM as invalid.
 * React 19 warns if `locale={false}` is forwarded to a DOM node from next/link.
 */
'use client';
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { forwardRef } from 'react';
import NextLink from 'next/link';
import { Link as ReactLink, } from '@sitecore-content-sdk/react';
/**
 * The list of NextLink props to be supported by the Link component.
 */
const supportedNextLinkProps = [
    'as',
    'onNavigate',
    'passHref',
    'prefetch',
    'replace',
    'scroll',
    'shallow',
];
/**
 * Matches relative URLs that end with a file extension.
 */
const FILE_EXTENSION_MATCHER = /^\/.*\.\w+$/;
/**
 * Next.js specific Link component implementation.
 * @public
 */
export const Link = forwardRef((props, ref) => {
    const { field, editable = true, children, internalLinkMatcher = /^\//g, showLinkTextWithChildrenPresent } = props, rest = __rest(props, ["field", "editable", "children", "internalLinkMatcher", "showLinkTextWithChildrenPresent"]);
    if (!field || (!field.value && !field.href && !field.metadata)) {
        return null;
    }
    const value = (field.href ? field : field.value);
    // fallback to {} if value is undefined; could happen if field is LinkFieldValue, href is empty in metadata mode
    const { href, querystring, anchor } = value || {};
    const isEditing = editable && field.metadata;
    if (href && !isEditing) {
        const text = showLinkTextWithChildrenPresent || !children ? value.text || value.href : null;
        const isMatching = internalLinkMatcher.test(href);
        const isFileUrl = FILE_EXTENSION_MATCHER.test(href);
        // determine if a link is a route or not. File extensions are not routes and should not be pre-fetched.
        if (isMatching && !isFileUrl) {
            return (React.createElement(NextLink, Object.assign({ href: { pathname: href, query: querystring, hash: anchor }, key: "link", title: value.title, target: value.target, className: value.class }, rest, { ref: ref }, (process.env.TEST
                ? {
                    'data-nextjs-link': true,
                    'data-nextjs-prefetch': props.prefetch,
                }
                : {})),
                text,
                children));
        }
    }
    const reactLinkProps = sanitizeLinkProps(props);
    return (React.createElement(ReactLink, Object.assign({}, reactLinkProps, { ref: ref }, (process.env.TEST ? { 'data-react-link': true } : {}))));
});
Link.displayName = 'NextLink';
/**
 * Sanitize props for ReactLink by removing Next.js and internal props to prevent invalid DOM attributes.
 * @param {LinkProps} props - The props the Link component received.
 * @returns sanitized props for ReactLink.
 * @internal
 */
function sanitizeLinkProps(props) {
    const internalProps = ['internalLinkMatcher'];
    const sanitizedProps = Object.assign({}, props);
    for (const prop of [...supportedNextLinkProps, ...internalProps]) {
        delete sanitizedProps[prop];
    }
    return sanitizedProps;
}
