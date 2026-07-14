export interface DriveFile {
  id?: string;
  name?: string;
  mimeType?: string;
  webViewLink?: string;
  webContentLink?: string;
  exportLinks?: { [key: string]: string | undefined };
  fullFileExtension?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: number;
}

export interface DriveFileListResponse {
  success?: boolean;
  files?: DriveFile[];
  count: number;
  nextPageToken?: string | null;
  driveName?: string | null;
}
