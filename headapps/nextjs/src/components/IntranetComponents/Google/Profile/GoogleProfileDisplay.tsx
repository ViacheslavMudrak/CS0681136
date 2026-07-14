import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Divider,
  Button,
} from '@mui/material';
import { Person, Email, Phone, Work, LocationOn, Refresh } from '@mui/icons-material';
import classNames from 'classnames';
import { GoogleProfileData } from 'ts/google';

interface GoogleProfileDisplayProps {
  className?: string;
}

const GoogleProfileDisplay: React.FC<GoogleProfileDisplayProps> = ({ className }) => {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<GoogleProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!session?.googleAccessToken) {
      setError('No Google access token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }
      setProfile(data.profile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching Google profile:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.googleAccessToken]);

  // Set profile from session if available, otherwise fetch from API
  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.googleProfile) {
        setProfile(session.googleProfile);
      } else {
        // Profile not available in session, fetch from API
        fetchProfile();
      }
    }
  }, [session?.googleProfile, status, fetchProfile]);

  if (status === 'loading') {
    return (
      <Box className={classNames('flex justify-center items-center p-8', className)}>
        <CircularProgress />
        <Typography variant="body2" className="ml-2">
          Loading profile...
        </Typography>
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Box className={classNames('w-full', className)}>
        <Alert severity="info">Please sign in to view your Google profile.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className={classNames('flex justify-center items-center p-8', className)}>
        <CircularProgress />
        <Typography variant="body2" className="ml-2">
          Fetching profile data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classNames('w-full', className)}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchProfile} startIcon={<Refresh />}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box className={classNames('w-full', className)}>
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={fetchProfile} startIcon={<Refresh />}>
              Load Profile
            </Button>
          }
        >
          Google profile data is not available.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={classNames('w-full', className)}>
      <Card className="shadow-lg">
        <CardContent className="p-6">
          {/* Header with avatar and name */}
          <Box className="flex items-center space-x-4 mb-6">
            {profile.photos?.[0]?.url ? (
              <Avatar
                src={profile.photos[0].url}
                alt={profile.name?.displayName || 'Profile'}
                className="w-16 h-16"
                imgProps={{ referrerPolicy: 'no-referrer' }}
              />
            ) : (
              <Avatar className="w-16 h-16">
                <Person />
              </Avatar>
            )}
            <Box>
              <Typography variant="h5" component="h2" className="font-semibold">
                {profile.name?.displayName || 'Unknown User'}
              </Typography>
              {profile.name?.givenName && profile.name?.familyName && (
                <Typography variant="body2" color="text.secondary">
                  {profile.name.givenName} {profile.name.familyName}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider className="my-4" />

          {/* Contact Information */}
          {(profile.emailAddresses?.length || profile.phoneNumbers?.length) && (
            <Box className="mb-6">
              <Typography variant="h6" className="mb-3 flex items-center">
                <Email className="mr-2" />
                Contact Information
              </Typography>
              <List dense>
                {profile.emailAddresses?.map((email, index) => (
                  <ListItem key={index} className="pl-0">
                    <ListItemIcon>
                      <Email fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={email.value}
                      secondary={email.type ? `Type: ${email.type}` : undefined}
                    />
                  </ListItem>
                ))}
                {profile.phoneNumbers?.map((phone, index) => (
                  <ListItem key={index} className="pl-0">
                    <ListItemIcon>
                      <Phone fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={phone.value}
                      secondary={phone.type ? `Type: ${phone.type}` : undefined}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Organizations */}
          {profile.organizations?.length && (
            <Box className="mb-6">
              <Typography variant="h6" className="mb-3 flex items-center">
                <Work className="mr-2" />
                Organizations
              </Typography>
              <List dense>
                {profile.organizations.map((org, index) => (
                  <ListItem key={index} className="pl-0">
                    <ListItemIcon>
                      <Work fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={org.name || 'Unknown Organization'}
                      secondary={
                        <Box>
                          {org.title && <Typography variant="body2">Title: {org.title}</Typography>}
                          {org.department && (
                            <Typography variant="body2">Department: {org.department}</Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Addresses */}
          {profile.addresses?.length && (
            <Box className="mb-6">
              <Typography variant="h6" className="mb-3 flex items-center">
                <LocationOn className="mr-2" />
                Addresses
              </Typography>
              <List dense>
                {profile.addresses.map((address, index) => (
                  <ListItem key={index} className="pl-0">
                    <ListItemIcon>
                      <LocationOn fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={address.formattedValue || 'No address'}
                      secondary={address.type ? `Type: ${address.type}` : undefined}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Profile ID */}
          <Box className="mt-6 pt-4 border-t">
            <Typography variant="caption" color="text.secondary">
              Profile ID: {profile.id}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GoogleProfileDisplay;
