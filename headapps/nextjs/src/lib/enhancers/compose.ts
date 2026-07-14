import React from 'react';
import { withGatedComponent } from './withGatedComponent';

export type EnhancerFunction<P> = (
  component: React.ComponentType<P>
) => (props: P) => React.JSX.Element | null;

export const compose =
  <P>(...enhancers: EnhancerFunction<P>[]) =>
  (component: React.ComponentType<P>) =>
    [withGatedComponent() as EnhancerFunction<P>, ...enhancers].reduceRight(
      (res, fn) => fn(res),
      component
    );

export default compose;
