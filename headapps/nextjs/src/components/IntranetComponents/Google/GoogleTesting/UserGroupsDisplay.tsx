import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import classNames from 'classnames';

interface UserGroupsDisplayProps {
  className?: string;
}

interface GroupInfo {
  id: string;
  email: string;
  displayName: string;
  description?: string;
  type: 'MEMBER';
}

interface GetGroupsResponse {
  groups?: GroupInfo[];
  source?: 'user_token' | 'service_account';
  error?: string;
  details?: string;
}

const UserGroupsDisplay: React.FC<UserGroupsDisplayProps> = ({ className }) => {
  const { data: session } = useSession();
  const [response, setResponse] = useState<GetGroupsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetGroups = async () => {
    if (!session?.user?.email) {
      setError('No user email available. Please sign in.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/google/groups/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          useServiceAccount: true,
          forceRefresh: true,
        }),
      });

      const data: GetGroupsResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch groups');
      }

      setResponse(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching Google groups:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={classNames('w-full', className)}>
      <Typography variant="h5" component="h2" className="mb-4">
        Google Groups (Service Account)
      </Typography>

      <Paper className="p-4">
        <Box className="mb-4">
          <Button
            variant="contained"
            color="primary"
            onClick={handleGetGroups}
            disabled={loading || !session?.user?.email}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Get My Google Groups'}
          </Button>

          {!session?.user?.email && (
            <Typography variant="body2" color="textSecondary" className="mt-2">
              Please sign in to fetch your groups.
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
            {response.source && (
              <Chip
                label={`Source: ${response.source === 'service_account' ? 'Service Account' : 'User Token'}`}
                color="info"
                size="small"
                className="mb-3"
              />
            )}

            {response.groups && response.groups.length > 0 ? (
              <>
                <Typography variant="body2" color="textSecondary" className="mb-2">
                  Found {response.groups.length} group(s)
                </Typography>
                <List dense>
                  {response.groups.map((group) => (
                    <ListItem key={group.id} divider>
                      <ListItemText
                        primary={group.displayName || group.email}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textSecondary">
                              {group.email}
                            </Typography>
                            {group.description && (
                              <Typography
                                component="span"
                                variant="body2"
                                color="textSecondary"
                                display="block"
                              >
                                {group.description}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No groups found for this user.
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserGroupsDisplay;
