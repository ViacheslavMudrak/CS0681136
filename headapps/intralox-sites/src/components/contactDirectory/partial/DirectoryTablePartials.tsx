import type { ReactNode } from 'react';

import LinkView from 'components/callToAction/partial/LinkVIew';

interface DirectoryTableRowProps {
  label?: string;
  children: ReactNode;
}

/**
 * Renders a label/value row in the contact directory table.
 */
export const DirectoryTableRow = ({ label, children }: DirectoryTableRowProps) => (
  <div className="flex justify-between">
    <div className="py-1 text-left font-medium whitespace-nowrap sm:whitespace-normal">{label}</div>
    <div className="text-right">{children}</div>
  </div>
);

interface DirectoryTableLinkProps {
  href: string;
  children: ReactNode;
}

export const DirectoryTableLink = ({ href, children }: DirectoryTableLinkProps) => (
  <LinkView
    className="underline hover:no-underline"
    link={{
      value: {
        href,
      },
    }}
  >
    {children}
  </LinkView>
);
