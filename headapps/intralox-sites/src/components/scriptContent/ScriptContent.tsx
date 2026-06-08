'use client';
import Script from "next/script";
import React, { useEffect, useState } from "react";
import type { IScriptContentFields } from "./ScriptContent.type";
import { LayoutServicePageState, SitecoreProviderReactContext } from "@sitecore-content-sdk/nextjs";

export const sanitizeScript = (scriptData: string) => {
  return scriptData.replace(/<script[^>]*>/gi, "").replace(/<\/script>/gi, "");
};

const useDelayedScript = (scriptText: string, delay: number = 2000) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && scriptText) {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, delay);

      return () => clearTimeout(timer);
    }

    return () => {};
  }, [scriptText, delay]);

  return shouldLoad;
};

const HeadTagBase = ({ fields }: IScriptContentFields) => {
  const { page } = React.useContext(SitecoreProviderReactContext);
  const { pageState } = page.layout.sitecore.context;
  const tagID = fields?.TagId?.value ?? "";
  const scriptText = sanitizeScript(fields?.Script?.value ?? "");
  const shouldLoadScript = useDelayedScript(scriptText, 5000);

  useEffect(() => {
    if (!scriptText || pageState !== LayoutServicePageState.Normal || !shouldLoadScript) {
      return;
    }

    if (tagID && document.getElementById(tagID)) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = tagID || '';
    script.innerHTML = scriptText;
    document.head.appendChild(script);

    return () => {
      const existingScript = tagID
        ? document.getElementById(tagID)
        : document.head.querySelector(`script[type="text/javascript"]:last-of-type`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [scriptText, tagID, pageState, shouldLoadScript]);

  if (!scriptText || pageState !== LayoutServicePageState.Normal || !shouldLoadScript) {
    return null;
  }

  return null;
};
export const HeadTag = React.memo(HeadTagBase);

const BodyTagBase = ({ fields }: IScriptContentFields) => {
  const tagID = fields?.TagId?.value ?? "";
  const scriptText = sanitizeScript(fields?.Script?.value ?? "");
  return !fields.IsNoScript?.value ? (
    <Script id={tagID} strategy="lazyOnload">{`${scriptText}`}</Script>
  ) : (
    <div
      id={fields.TagId?.value}
      dangerouslySetInnerHTML={{
        __html: fields.Script?.value ?? "",
      }}
      aria-hidden="true"
      role="presentation"
    />
  );
};
export const BodyTag = React.memo(BodyTagBase);
