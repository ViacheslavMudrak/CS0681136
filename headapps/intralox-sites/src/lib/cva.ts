import { cn, type ClassValue } from 'lib/utils';

type VariantSelection = string | number | boolean | null | undefined;

export interface CvaConfig {
  base?: ClassValue;
  variants: Record<string, Record<string, ClassValue>>;
  defaultVariants?: Record<string, VariantSelection>;
}

/**
 * Server-safe class-variance helper (clsx + tailwind-merge only).
 * Use in Server Components; client partials may use `@laitram-l-l-c/intralox-ui-components` `cva()`.
 */
export function cva(config: CvaConfig) {
  return (props?: Record<string, VariantSelection> & { className?: ClassValue }): string => {
    const { className, ...variantProps } = props ?? {};
    const resolved: Record<string, VariantSelection> = {
      ...config.defaultVariants,
      ...variantProps,
    };

    const classes: ClassValue[] = [];
    if (config.base) {
      classes.push(config.base);
    }

    for (const key of Object.keys(config.variants)) {
      const variantKey = resolved[key];
      if (variantKey == null) continue;
      const lookupKey = typeof variantKey === 'boolean' ? String(variantKey) : String(variantKey);
      const value = config.variants[key]?.[lookupKey];
      if (value != null) {
        classes.push(value);
      }
    }

    if (className != null) {
      classes.push(className);
    }

    return cn(...classes);
  };
}
