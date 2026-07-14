import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Box,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';

import { MaterialIcon } from '../Icon/MaterialIcon';

interface DebugDialogProps {
  open: boolean;
  onClose: () => void;
}

const DebugDialog = ({ open, onClose }: DebugDialogProps): JSX.Element => {
  const { data: session } = useSession();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Debug Panel</DialogTitle>
      <DialogContent dividers>
        {session && (
          <>
            <p>Signed in as {session.user?.email}</p>
            <Box sx={{ my: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="body1" color="text.primary">
                Google Profile Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>id: </b>
                {session.googleProfile?.id || '(empty)'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>name.displayName: </b>
                {session.googleProfile?.name?.displayName || '(empty)'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>name.givenName: </b>
                {session.googleProfile?.name?.givenName || '(empty)'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>name.familyName: </b>
                {session.googleProfile?.name?.familyName || '(empty)'}
              </Typography>
              {session.googleProfile?.emailAddresses?.map((email, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  <b>emailAddresses[{index}].value: </b>
                  {email.value || '(empty)'}
                  {email.type ? ` (Type: ${email.type})` : ''}
                </Typography>
              ))}
              {session.googleProfile?.phoneNumbers?.map((phone, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  <b>phoneNumbers[{index}].value: </b>
                  {phone.value || '(empty)'}
                  {phone.type ? ` (Type: ${phone.type})` : ''}
                </Typography>
              ))}
              {session.googleProfile?.photos?.map((photo, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  <b>photos[{index}].url: </b>
                  {photo.url || '(empty)'}
                </Typography>
              ))}
              {session.googleProfile?.organizations?.map((org, index) => (
                <Box key={index}>
                  <Typography variant="body2" color="text.secondary">
                    <b>organizations[{index}].name: </b>
                    {org.name || '(empty)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>organizations[{index}].title: </b>
                    {org.title || '(empty)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>organizations[{index}].department: </b>
                    {org.department || '(empty)'}
                  </Typography>
                </Box>
              ))}
              {session.googleProfile?.addresses?.map((address, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  <b>addresses[{index}]: </b>
                  {address.formattedValue || '(empty)'}
                  {address.type ? ` (Type: ${address.type})` : ''}
                </Typography>
              ))}
              {session.googleProfile?.userInfo && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <b>userInfo.companyCode: </b>
                    {session.googleProfile.userInfo.companyCode || '(empty)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>userInfo.businessUnit: </b>
                    {session.googleProfile.userInfo.businessUnit ?? '(empty)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>userInfo.employeeClass: </b>
                    {session.googleProfile.userInfo.employeeClass || '(empty)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>userInfo.employeeNumber: </b>
                    {session.googleProfile.userInfo.employeeNumber || '(empty)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>userInfo.isManager: </b>
                    {session.googleProfile.userInfo.isManager || '(empty)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>userInfo.managerLevel: </b>
                    {session.googleProfile.userInfo.managerLevel ?? '(empty)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>userInfo.workLocationCode: </b>
                    {session.googleProfile.userInfo.workLocationCode || '(empty)'}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ my: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="body1" color="text.primary">
                Home Site Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>itemId: </b>
                {session.newsHomeSite?.itemId || '(empty)'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>siteName: </b>
                {session.newsHomeSite?.siteName || '(empty)'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>isMarket: </b>
                {session.newsHomeSite?.isMarket !== undefined
                  ? String(session.newsHomeSite.isMarket)
                  : '(empty)'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <b>siteLevelAssociationTags: </b>
                {!session.newsHomeSite?.siteLevelAssociationTags?.length && '(empty)'}
              </Typography>
              {session.newsHomeSite?.siteLevelAssociationTags?.map((tag, index) => (
                <Box key={tag.id} sx={{ ml: 2, mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    <b>siteLevelAssociationTags[{index}].id: </b>
                    {tag.id || '(empty)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>siteLevelAssociationTags[{index}].name: </b>
                    {tag.name || '(empty)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>siteLevelAssociationTags[{index}].fields.title: </b>
                    {tag.title?.value || '(empty)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <b>siteLevelAssociationTags[{index}].fields.facetCategory: </b>
                    {tag.facetCategory?.value || '(empty)'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}

        <Accordion className="mt-2">
          <AccordionSummary
            expandIcon={<MaterialIcon name="ExpandMore" />}
            aria-controls="token-content"
            id="token-header"
          >
            <Typography>Session Token Data</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <code className="block wrap-break-word">{JSON.stringify(session)}</code>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DebugDialog;
