/**
 * Type declarations for CSS Modules
 * This allows TypeScript and codegen tools to understand CSS module imports
 */
declare module "*.css";
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "@sitecore-feaas/clientside/react";
