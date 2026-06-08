import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Minimal shape for account list ordering (e.g. profile company accounts). */
export interface CompanyAccountSortable {
  isActive: boolean;
  companyName: string;
}

/**
 * Active accounts first (original order preserved), then inactive accounts sorted A–Z by company name.
 */
export function sortCompanyAccountsByActiveThenName<T extends CompanyAccountSortable>(
  accounts: T[]
): T[] {
  const active = accounts.filter((a) => a.isActive);
  const inactive = accounts.filter((a) => !a.isActive);
  inactive.sort((a, b) =>
    a.companyName.localeCompare(b.companyName, undefined, { sensitivity: "base" })
  );
  return [...active, ...inactive];
}
