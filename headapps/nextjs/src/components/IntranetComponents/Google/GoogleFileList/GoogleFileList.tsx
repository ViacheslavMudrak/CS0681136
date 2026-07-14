import {
  RichText,
  Link as JssLink,
  Text,
  withDatasourceCheck,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { mimeTypeOutlinedIcons, mimeTypes } from 'lib/google/constants';
import { useGoogleDrive } from 'lib/google/hooks/use-google-drive';
import { useSession } from 'next-auth/react';
import { useI18n } from 'next-localization';
import { JSX, useEffect, useState } from 'react';
import { MediaQueryConstants } from 'src/util/const/material';

import { Breadcrumbs, useMediaQuery, Link as MuiLink, Typography, Skeleton } from '@mui/material';

import styles from './GoogleFileList.module.scss';
import { GoogleFileListProps, GoogleFileListStatics } from './GoogleFileList.types';

const cx = classNames.bind(styles);

const GoogleFileList = (props: GoogleFileListProps): JSX.Element => {
  const { fields } = props;
  const { data: session } = useSession();
  const { page } = useSitecore();
  const { t } = useI18n();
  const isEditing = page.mode.isEditing;
  const noAccessTitle =
    t('UnauthorizedGoogleDriveAccessTitle') ||
    GoogleFileListStatics.unauthorizedGoogleDriveAccessTitle;
  const noAccessDescription =
    t('UnauthorizedGoogleDriveAccessDescription') ||
    GoogleFileListStatics.unauthorizedGoogleDriveAccessDescription;
  const loadingText = t('Loading') || GoogleFileListStatics.loading;
  const loadMoreText = t('LoadMore') || GoogleFileListStatics.loadMore;
  const copyLinkMessage = t('CopyLinkMessage') || GoogleFileListStatics.copyLinkMessage;
  const noItemsMessage = t('NoItemsMessage') || GoogleFileListStatics.noItemsMessage;
  const driveNameLabel = t('DriveNameLabel') || GoogleFileListStatics.driveNameLabel;

  const hasRequiredFields = fields?.ctaLink?.value?.href && fields?.googleDriveID?.value;
  const driveId = fields?.googleDriveID?.value;
  const driveUrl = `https://drive.google.com/drive/folders/${driveId}`;

  const isMobile = useMediaQuery(MediaQueryConstants.Mobile, { noSsr: true });
  const [userid, setuserId] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [copiedFileName, setCopiedFileName] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);

  let { files, loading } = useGoogleDrive(driveId, currentFolderId, !isEditing);
  const { loadingMore, hasNext, fetchNextPage, totalCount, isForbidden, driveName } =
    useGoogleDrive(driveId, currentFolderId, !isEditing);

  const [driveDisplayName, setDriveDisplayName] = useState<string>(driveName ?? driveNameLabel);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id?: string; name: string }>>([
    { id: undefined, name: driveDisplayName },
  ]);

  useEffect(() => {
    if (!isEditing && session && session.user) {
      setuserId(session.user.email || (session.user.name as string));
      if (!loading && isForbidden) {
        setHasAccess(false);
        return;
      }
      if (!loading && files && files.length > 0) {
        setHasAccess(true);
      }
    } else if (isEditing) {
      setHasAccess(true);
    }

    if (hasAccess && driveName && !currentFolderId) {
      setDriveDisplayName(driveName);
      setBreadcrumbs([{ id: undefined, name: driveDisplayName }]);
    }
  }, [
    files,
    loading,
    session,
    totalCount,
    isForbidden,
    isEditing,
    hasAccess,
    driveName,
    currentFolderId,
    driveDisplayName,
  ]);

  if ((!hasRequiredFields && !isEditing) || (!isEditing && !userid)) {
    return <></>;
  }

  const handleCopyClick = async (fileUrl?: string, fileName?: string) => {
    if (fileUrl && fileName) {
      try {
        await navigator.clipboard.writeText(fileUrl);
        setCopiedFileName(fileName);
      } catch {
        setCopiedFileName('');
      }
    }
  };

  const handleLoadMore = () => {
    if (hasNext) {
      fetchNextPage();
    }
  };

  const handleFolderClick = (fileId?: string, fileName?: string) => {
    if (!fileId) return;
    // navigate into folder
    setCurrentFolderId(fileId);
    setBreadcrumbs((prev) => [...prev, { id: fileId, name: fileName ?? 'Folder' }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const crumb = breadcrumbs[index];
    const newCrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newCrumbs);
    setCurrentFolderId(crumb.id);
  };

  //Mock files for editor mode to make the component visible
  if (isEditing) {
    loading = false;
    files = GoogleFileListStatics.files;
  }

  return (
    <div
      className={cx(
        'google-file-list',
        'component flex flex-col container gap-8',
        `${loading ? 'cursor-not-allowed pointer-events-none' : ''}`,
        props.stylesSXA
      )}
    >
      <div className={cx('google-file-list__header', 'flex flex-col md:flex-row gap-4')}>
        <div className={cx('google-file-list__header-content', 'flex flex-col gap-4')}>
          <Text
            className={cx('google-file-list__eyebrow', 'eyebrow eyebrow-font-size text-eyebrow')}
            field={fields?.optionalEyebrow}
            tag="span"
          />
          <Text className={cx('google-file-list__title')} tag="h2" field={fields?.sectionHeader} />
          <RichText
            className={cx('google-file-list__description')}
            tag="div"
            field={fields?.sectionDescription}
          />
        </div>
        <div className={cx('google-file-list__google-drive', 'flex items-end')}>
          <div className="flex items-center gap-2">
            <img src="/assets/google-drive-logo.png" alt="drive-logo" />
            <a
              href={driveUrl}
              target="_blank"
              className={cx('google-file-list__google-drive-link', 'flex uppercase w-max')}
              aria-label={fields?.buttonText.value}
            >
              {fields?.buttonText.value}
            </a>
          </div>
        </div>
      </div>
      <div aria-live="polite" className={cx('google-file-list__description')}>
        {copiedFileName ? `${copyLinkMessage} ${copiedFileName}` : ''}
      </div>

      {loading ? (
        <div className={cx('google-file-list__content', 'flex flex-col')}>
          <ul className={cx('google-file-list__link-list', 'flex flex-col')} aria-label="File list">
            {[...Array(8)].map((index) => {
              return (
                <li
                  key={index}
                  className={cx(
                    'google-file-list__link-content',
                    'flex justify-between items-center'
                  )}
                >
                  <div className={cx('google-file-list__skeleton', 'flex gap-2 items-center')}>
                    <Skeleton variant="rectangular" width="100%" height={24} />
                  </div>
                </li>
              );
            })}
          </ul>{' '}
        </div>
      ) : hasAccess ? (
        <>
          <div className={cx('google-file-list__content', 'flex flex-col')}>
            <div className={cx('google-file-list__breadcrumbs', 'flex items-center')}>
              {/* back button to navigate to previous breadcrumb/folder */}
              <button
                type="button"
                aria-label={t('GoBack') || 'Back'}
                className={cx('google-file-list__back-button', 'mr-2')}
                onClick={() => {
                  if (breadcrumbs.length <= 1) return;
                  const newCrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1);
                  setBreadcrumbs(newCrumbs);
                  const newCurrent = newCrumbs[newCrumbs.length - 1];
                  setCurrentFolderId(newCurrent.id);
                }}
                disabled={breadcrumbs.length <= 1}
              >
                <MaterialIcon name="ChevronLeft" />
              </button>

              <div className={cx('google-file-list__breadcrumb-separator')} aria-hidden="true" />

              <Breadcrumbs
                component="nav"
                maxItems={isMobile ? 1 : 3}
                itemsBeforeCollapse={0}
                itemsAfterCollapse={isMobile ? 1 : 2}
                aria-label="Breadcrumb"
                separator={
                  <MaterialIcon name="ChevronRight" className={cx('breadcrumb__chevron')} />
                }
              >
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return isLast ? (
                    <Typography key={idx} component="span" aria-current="page">
                      {crumb.name}
                    </Typography>
                  ) : (
                    <MuiLink
                      key={idx}
                      component="button"
                      onClick={() => handleBreadcrumbClick(idx)}
                      className={cx('google-file-list__breadcrumb-link')}
                    >
                      {crumb.name}
                    </MuiLink>
                  );
                })}
              </Breadcrumbs>
            </div>

            {files && files.length > 0 ? (
              <>
                <ul
                  className={cx('google-file-list__link-list', 'flex flex-col')}
                  aria-label="File list"
                >
                  {[...files]
                    .sort((a, b) => {
                      const aIsFolder = a.mimeType === 'application/vnd.google-apps.folder';
                      const bIsFolder = b.mimeType === 'application/vnd.google-apps.folder';
                      if (aIsFolder !== bIsFolder) {
                        return aIsFolder ? -1 : 1;
                      }
                      return (a.name ?? '').localeCompare(b.name ?? '');
                    })
                    .map((file) => {
                      const fileType = file?.mimeType ? mimeTypes[file?.mimeType] : '';
                      const fileIcon = file?.mimeType
                        ? mimeTypeOutlinedIcons[file?.mimeType]
                        : 'insert_drive_file';
                      const isFolderType = file.mimeType === 'application/vnd.google-apps.folder';
                      let downloadLink = '';
                      switch (fileType) {
                        case 'Doc': // Google Doc
                          downloadLink =
                            file?.exportLinks?.[
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ] || '';
                          break;
                        case 'Slide': // Google Slide
                          downloadLink =
                            file.exportLinks?.[
                              'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                            ] || '';
                          break;
                        case 'Sheet': // Google Sheet
                          downloadLink =
                            file.exportLinks?.[
                              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            ] || '';
                          break;
                        default:
                          // 2. Fallback for binary files (PDFs, Images, or already uploaded .docx/.pptx)
                          downloadLink = file?.webContentLink || '';
                      }

                      return (
                        <li
                          className={cx(
                            `${isFolderType ? 'google-file-list__link-content' : 'google-file-list__link-content-file'}`,
                            'flex justify-between items-center'
                          )}
                          key={file.id}
                        >
                          <div
                            className={cx('google-file-list__link-name', 'flex gap-2 items-center')}
                          >
                            <MaterialIcon name={fileIcon} />
                            {isFolderType ? (
                              <button
                                type="button"
                                className={cx('google-file-list__folder-link', 'line-clamp-1')}
                                onClick={() => handleFolderClick(file.id, file.name)}
                              >
                                {file.name}
                              </button>
                            ) : (
                              <a className="line-clamp-1" target="_blank" href={file?.webViewLink}>
                                {file.name}
                              </a>
                            )}
                          </div>
                          <div
                            className={cx('google-file-list__link-nav', 'flex gap-4 items-center')}
                          >
                            {fileType && (
                              <span className={cx('google-file-list__doctype')}>{fileType}</span>
                            )}
                            {fileType && (
                              <>
                                {file?.webViewLink ? (
                                  <button
                                    type="button"
                                    className={cx('google-file-list__copy-link-button')}
                                    onClick={() => handleCopyClick(file?.webViewLink, file?.name)}
                                    aria-label={`Copy download link for ${file.name}`}
                                  >
                                    <MaterialIcon name="LinkOutlined" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className={cx(
                                      'google-file-list__copy-link-button',
                                      'cursor-not-allowed opacity-0 pointer-events-none'
                                    )}
                                    disabled={true}
                                  >
                                    <MaterialIcon name="LinkOutlined" />
                                  </button>
                                )}

                                {fileType && downloadLink ? (
                                  <MuiLink
                                    href={downloadLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Download ${file.name}`}
                                  >
                                    <MaterialIcon name="FileDownloadOutlined" />
                                  </MuiLink>
                                ) : (
                                  <MuiLink
                                    href="#"
                                    className="cursor-not-allowed opacity-0 pointer-events-none"
                                  >
                                    <MaterialIcon name="FileDownloadOutlined" />
                                  </MuiLink>
                                )}
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}

                  {loadingMore ? (
                    [...Array(5)].map((index) => {
                      return (
                        <li
                          key={index}
                          className={cx(
                            'google-file-list__link-content',
                            'flex justify-between items-center'
                          )}
                        >
                          <div
                            className={cx('google-file-list__skeleton', 'flex gap-2 items-center')}
                          >
                            <Skeleton variant="rectangular" width="100%" height={24} />
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </ul>

                {hasNext && (
                  <div className={cx('google-file-list__pagination', 'flex w-full justify-center')}>
                    <button
                      type="button"
                      className={cx('google-file-list__pagination-btn-load-more')}
                      onClick={() => handleLoadMore()}
                      disabled={loading || loadingMore}
                    >
                      {loading || loadingMore ? loadingText : loadMoreText}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <ul
                  className={cx('google-file-list__link-list', 'flex flex-col')}
                  aria-label="File list"
                >
                  <li className={cx('google-file-list__link-no-content', 'flex gap-2')}>
                    {noItemsMessage}
                  </li>
                </ul>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <div className={cx('google-file-list__unauthorized', 'flex')}>
            <div
              className={cx(
                'google-file-list__unauthorized-content',
                'flex flex-col gap-4 items-center justify-center m-auto text-center'
              )}
            >
              <MaterialIcon name="LockOutlined" />
              <h3>{noAccessTitle}</h3>
              <div>{noAccessDescription}</div>
              <JssLink field={fields?.ctaLink} className={cx('asc-btn asc-btn--outline')} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default compose<GoogleFileListProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(GoogleFileList);
