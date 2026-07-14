/**
 * Helper function to check if URL is a media file
 * Checks for Sitecore media library paths and common file extensions
 * @param url - The URL to check
 * @returns true if the URL is a media file, false otherwise
 */
export const isMediaUrl = (url: string): boolean => {
  if (!url) return false;

  // Check if URL contains Sitecore media library path
  if (url.includes('/-/media/') || url.includes('/media/')) {
    return true;
  }

  // Check for common file extensions
  const mediaExtensions = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.svg',
    '.webp',
    '.mp4',
    '.mov',
    '.avi',
    '.mp3',
    '.wav',
    '.zip',
    '.rar',
    '.7z',
    '.tar',
    '.gz',
  ];

  const urlLower = url.toLowerCase();
  return mediaExtensions.some((ext) => urlLower.includes(ext));
};
