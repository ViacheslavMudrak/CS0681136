// Normalizes a Sitecore GUID to comparable format. To Lowercases Removes hyphens, braces, and non-hex characters

export const normalizeGuid = (id?: string): string => {
  return (id ?? '').toLowerCase().replace(/[^a-f0-9]/g, '');
};
