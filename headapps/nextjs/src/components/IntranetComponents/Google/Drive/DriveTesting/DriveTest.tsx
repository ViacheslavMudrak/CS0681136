import React, { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import classNames from 'classnames';

import { DriveTestProps, DriveFile, DriveListResponse } from './DriveTest.types';

const DriveTest: React.FC<DriveTestProps> = ({ defaultDriveId = '', className }) => {
  const { data: session } = useSession();
  const [driveId, setDriveId] = useState(defaultDriveId);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFolder = useCallback(
    (mimeType: string) => mimeType === 'application/vnd.google-apps.folder',
    []
  );

  const fetchFiles = useCallback(async () => {
    if (!session?.googleAccessToken) {
      setError('No Google access token available. Please sign in.');
      return;
    }

    setLoading(true);
    setError(null);
    setFiles([]);

    try {
      const url = driveId
        ? `/api/google/drive/list?driveId=${encodeURIComponent(driveId)}`
        : '/api/google/drive/list';

      const response = await fetch(url);
      const data: DriveListResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch files');
      }

      setFiles(data.files || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching drive files:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.googleAccessToken, driveId]);

  return (
    <Box className={classNames('w-full', className)}>
      <Paper className="p-4">
        <Box className="flex gap-4 mb-4">
          <TextField
            value={driveId}
            onChange={(e) => setDriveId(e.target.value)}
            placeholder="Search files by drive ID"
            variant="outlined"
            size="small"
            className="flex-1"
            label="Shared Drive ID (optional)"
          />
          <Button variant="contained" color="primary" onClick={fetchFiles} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Get Files'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {files.length > 0 && (
          <List>
            {files.map((file) => (
              <ListItem
                key={file.id}
                component="a"
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-gray-100 rounded"
              >
                <ListItemIcon>
                  {isFolder(file.mimeType) ? (
                    <FolderIcon color="primary" />
                  ) : (
                    <InsertDriveFileIcon color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={
                    file.modifiedTime
                      ? `Modified: ${new Date(file.modifiedTime).toLocaleDateString()}`
                      : file.mimeType
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {!loading && !error && files.length === 0 && (
          <Typography variant="body2" color="textSecondary" className="text-center py-4">
            Click &quot;Get Files&quot; to list files from your Google Drive
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default DriveTest;
