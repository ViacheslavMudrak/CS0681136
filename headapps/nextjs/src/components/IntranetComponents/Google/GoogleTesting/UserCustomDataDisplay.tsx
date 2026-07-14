import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Typography, Button, CircularProgress, Alert, Paper, TextField } from '@mui/material';
import classNames from 'classnames';
import type { GoogleProfileData } from 'ts/google';

interface UserCustomDataDisplayProps {
  className?: string;
}

interface DirectoryUserResponse {
  user?: GoogleProfileData;
  error?: string;
  details?: string;
  code?: number;
}

const UserCustomDataDisplay: React.FC<UserCustomDataDisplayProps> = ({ className }) => {
  const { data: session } = useSession();
  const [lookupEmail, setLookupEmail] = useState('');
  const [response, setResponse] = useState<DirectoryUserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetCustomData = async () => {
    if (!session?.user?.email) {
      setError('No user email available. Please sign in.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const userEmail = lookupEmail.trim() || session.user.email;
      const url = `/api/google/admin/directory/users/${encodeURIComponent(userEmail)}`;

      const res = await fetch(url);
      const data: DirectoryUserResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch user data');
      }

      setResponse(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching custom directory data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={classNames('w-full', className)}>
      <Typography variant="h5" component="h2" className="mb-4">
        Google Custom Schema Data
      </Typography>

      <Paper className="p-4">
        <Box className="mb-4">
          <TextField
            type="email"
            label="User email (optional)"
            placeholder={session?.user?.email || 'Current user'}
            value={lookupEmail}
            onChange={(e) => setLookupEmail(e.target.value)}
            fullWidth
            size="small"
            helperText="Leave empty to use your own email"
            className="mb-2"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleGetCustomData}
            disabled={loading || !session?.user?.email}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Get Custom Directory Data'}
          </Button>

          {!session?.user?.email && (
            <Typography variant="body2" color="textSecondary" className="mt-2">
              Please sign in to fetch your directory data.
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {response && (
          <Box className="mt-4">
            <Typography variant="subtitle2" className="mb-2">
              Response:
            </Typography>
            <Paper
              variant="outlined"
              className="p-4 bg-gray-50 overflow-auto"
              sx={{ maxHeight: 400 }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {response.error
                  ? `Error: ${response.error}\nDetails: ${response.details || 'N/A'}`
                  : response.user
                    ? JSON.stringify(response.user, null, 2)
                    : 'No data available'}
              </pre>
            </Paper>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserCustomDataDisplay;
