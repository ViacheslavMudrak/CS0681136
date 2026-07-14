import React from 'react';
import { ComponentProps } from 'lib/component-props';

export type AccordionProps = ComponentProps & {
  placeholders: Record<string, React.ReactNode>;
};
