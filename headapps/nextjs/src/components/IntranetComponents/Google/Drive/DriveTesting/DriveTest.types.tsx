export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

export interface DriveTestProps {
  /** Optional shared drive ID to pre-populate the input */
  defaultDriveId?: string;
  /** Optional CSS class name */
  className?: string;
}

export interface DriveListResponse {
  success: boolean;
  files: DriveFile[];
  count: number;
  nextPageToken?: string | null;
  error?: string;
}
