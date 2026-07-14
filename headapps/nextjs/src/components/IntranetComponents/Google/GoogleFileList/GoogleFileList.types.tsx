import { ComponentProps } from 'lib/component-props';
import { DriveFile } from 'lib/google/types';

import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

export type GoogleFileListFields = {
  optionalEyebrow: Field<string>;
  sectionHeader: Field<string>;
  sectionDescription: Field<string>;
  ctaLink: LinkField;
  buttonText: Field<string>;
  googleDriveID: Field<string>;
};

export type CurrentItem = {
  navTitle?: { jsonValue?: { value?: string } };
  title?: { jsonValue?: { value?: string } };
  breadcrumbItems?: BreadcrumbItem[];
};

export type BreadcrumbItem = {
  url: { path: string };
  navTitle?: { jsonValue?: { value?: string } };
  title?: { jsonValue?: { value?: string } };
  hideInBreadcrumbs?: { jsonValue?: { value?: boolean } };
};

export type GoogleFileListProps = ComponentProps & {
  fields: GoogleFileListFields;
};

export const GoogleFileListStatics = {
  unauthorizedGoogleDriveAccessDescription:
    'Access to this content is restricted. Your account does not have the required permissions. Please contact an administrator if you need access to this resource.',
  unauthorizedGoogleDriveAccessTitle: 'You do not have access to this content.',
  loading: 'Loading...',
  loadMore: 'Load More ...',
  copyLinkMessage: 'Download link copied for',
  noItemsMessage: 'No items found.',
  driveNameLabel: 'Shared Drive',
  files: [
    {
      id: '1',
      name: 'Demo Folder 1',
      mimeType: 'application/vnd.google-apps.folder',
      webViewLink: '/',
    },
    {
      id: '2',
      name: 'Demo_ExcelSheet.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      webContentLink: '/',
      webViewLink: '/',
      fullFileExtension: 'xlsx',
      size: '0',
    },
    {
      id: '3',
      name: 'DemoFile.pdf',
      mimeType: 'application/pdf',
      webContentLink: '/',
      webViewLink: '/',
      fullFileExtension: 'pdf',
      size: '0',
    },
    {
      id: '4',
      name: 'DemoWordDocument.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      webContentLink: '/',
      webViewLink: '/',
      fullFileExtension: 'docx',
      size: '0',
    },
  ] as DriveFile[],
};
