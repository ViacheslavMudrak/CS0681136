import * as FEAAS from '@sitecore-feaas/clientside/react';
/**
 * You can import your own client components here
 * @example
 * import './MyClientComponent';
 * @example
 * import 'src/otherFolder/MyOtherComponent';
 */

// An important boilerplate component that prevents BYOC components from being optimized away and allows then. Should be kept in this file.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ClientsideComponent = (props: FEAAS.ComponentProps) => FEAAS.ExternalComponent(props as any);
/**
 * Clientside BYOC component will be rendered in the browser, so that external components:
 * - Can have access to DOM apis, including network requests
 * - Use clientside react hooks like useEffect.
 * - Be implemented as web components.
 */

export default ClientsideComponent;
