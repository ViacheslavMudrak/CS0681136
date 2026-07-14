import { ComponentParams, ComponentRendering } from '@sitecore-content-sdk/nextjs';

export type PlaceholderProps = {
  rendering: ComponentRendering;
  params?: ComponentParams;
};
