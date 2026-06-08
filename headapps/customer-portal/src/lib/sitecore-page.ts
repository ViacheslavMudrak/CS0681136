import { cache } from "react";
import client from "./sitecore-client";

export type GetCachedPageOptions = {
  site: string;
  locale: string;
};

export const getCachedPage = cache((path: string[], options: GetCachedPageOptions) =>
  client.getPage(path, options)
);
