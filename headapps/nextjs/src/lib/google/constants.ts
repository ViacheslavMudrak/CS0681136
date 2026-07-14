export const pageSize = 20;

export const mimeTypes: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.google-apps.folder': '',
  'application/vnd.google-apps.spreadsheet': 'Sheet',
  'application/vnd.google-apps.presentation': 'Slide',
  'application/vnd.google-apps.document': 'Doc',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/x-zip-compressed': 'Zip',
  'text/plain': 'Text',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'text/csv': 'csv',
  'video/mp4': 'mp4',
};

export const mimeTypeOutlinedIcons: Record<string, string> = {
  'application/pdf': 'picture_as_pdf',
  'application/vnd.google-apps.folder': 'folder',
  'application/vnd.google-apps.spreadsheet': 'table_chart',
  'application/vnd.google-apps.presentation': 'slideshow',
  'application/vnd.google-apps.document': 'description',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'grid_on',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'description',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'slideshow',
  'application/x-zip-compressed': 'folder_zip',
  'text/plain': 'article',
  'image/jpeg': 'image',
  'image/png': 'image',
  'text/csv': 'table_rows',
  'video/mp4': 'movie',
};
