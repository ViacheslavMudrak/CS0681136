import { Box, Typography, Container } from '@mui/material';
import { JSX } from 'react';

import GoogleCalendarEventList from 'components/IntranetComponents/Google/Events/GoogleCalendarEventList';
import GoogleProfileDisplay from 'components/IntranetComponents/Google/Profile/GoogleProfileDisplay';
import DriveTest from 'components/IntranetComponents/Google/Drive/DriveTesting/DriveTest';
import UserCustomDataDisplay from 'components/IntranetComponents/Google/GoogleTesting/UserCustomDataDisplay';
import UserGroupsDisplay from 'components/IntranetComponents/Google/GoogleTesting/UserGroupsDisplay';
import PersonOrgStructure from 'components/IntranetComponents/Google/PersonOrgStructure/PersonOrgStructure';
import { SitecorePageProps } from '@sitecore-content-sdk/nextjs';
import Providers from 'src/Providers';
// @ts-ignore - import is auto generated on build
import components from '.sitecore/component-map';
import Layout from 'src/Layout';
import client from 'lib/sitecore-client';
import { GetServerSideProps } from 'next';
import { extractPath } from '@sitecore-content-sdk/nextjs/utils';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';

const GoogleTestPage = ({ page, componentProps }: SitecorePageProps): JSX.Element => {
  const currentDate = new Date();

  if (!page) {
    return <div>No page data</div>;
  }

  const pageContent = (
    <Container maxWidth="lg">
      <Box className="py-8">
        <Box className="space-y-8">
          {/* Google Profile */}
          <Box>
            <Typography variant="h5" component="h2" className="mb-4">
              Google Profile Information
            </Typography>
            <GoogleProfileDisplay className="bg-white rounded-lg shadow-sm" />
          </Box>

          {/* Google Custom Schema Data */}
          <Box>
            <UserCustomDataDisplay className="bg-white rounded-lg shadow-sm" />
          </Box>

          {/* Google Groups */}
          <Box>
            <UserGroupsDisplay className="bg-white rounded-lg shadow-sm" />
          </Box>

          <Typography variant="h4" component="h1" className="mb-6">
            Google Calendar Events Demo
          </Typography>

          {/* Primary Calendar */}
          <Box>
            <Typography variant="h5" component="h2" className="mb-4">
              Primary Calendar (3 months)
            </Typography>
            <GoogleCalendarEventList
              startDate={currentDate}
              timespan={3}
              className="bg-white rounded-lg shadow-sm p-4"
            />
          </Box>

          {/* Specific Calendar by Email */}
          {/* <Box>
            <Typography variant="h5" component="h2" className="mb-4">
              Specific Calendar by Email (1 month)
            </Typography>
            <GoogleCalendarEventList
              calendarEmail="example@company.com"
              startDate={currentDate}
              timespan={1}
              className="bg-white rounded-lg shadow-sm p-4"
            />
          </Box> */}

          {/* Calendar by ID */}
          <Box>
            <Typography variant="h5" component="h2" className="mb-4">
              Calendar by ID (6 months)
            </Typography>
            <GoogleCalendarEventList
              calendarId="c_88a576b57cf970e8e5dcdd50c8dc80ab8e40a0a5426a2b9d8afe64db3edd1756@group.calendar.google.com"
              startDate={currentDate}
              timespan={6}
              className="bg-white rounded-lg shadow-sm p-4"
            />
          </Box>

          {/* Org Structure */}
          <Box>
            <Typography variant="h5" component="h2" className="mb-4">
              Person Org Structure
            </Typography>
            <PersonOrgStructure className="bg-white rounded-lg shadow-sm p-4" />
          </Box>

          {/* Google Drive Files */}
          <Box>
            <Typography variant="h5" component="h2" className="mb-4">
              Google Drive Files
            </Typography>
            <DriveTest className="bg-white rounded-lg shadow-sm" />
          </Box>

          <Box>
            <Typography variant="h5" component="h2" className="mb-4">
              Google Embed Files (IFrame Embed Code)
            </Typography>
            {/* TESTING GOOGLE EMBED CODE FOR RESTRICTED - NOTE THAT FOR OUTSIDE ASC NETWORK REQUIRES mcas.ms post-fixed to hostname */}
            {/* <GoogleDocsIframe
                    src="https://docs.google.com.mcas.ms/document/d/e/2PACX-1vSq9_cXbLEdO4szIBdAlyubd03ubKoWezST3k2ooyJgY7sh9-WvoUMqxXRcBTHyq4ayVzVo4VbVG3_W/pub?embedded=true"
                    style={{ width: '100%', minHeight: '600px' }}
                  /> */}
            {/* state: permission allowed (off network requires .mcas.ms in url) */}
            <iframe
              src="https://docs.google.com/document/d/e/2PACX-1vSq9_cXbLEdO4szIBdAlyubd03ubKoWezST3k2ooyJgY7sh9-WvoUMqxXRcBTHyq4ayVzVo4VbVG3_W/pub?embedded=true"
              style={{ width: '100%', minHeight: '600px' }}
            ></iframe>
            {/* state: permission denied */}
            <iframe
              src="https://docs.google.com/document/d/e/2PACX-1vQlLoDMGQrMyzC60_fEc_cpZA_kKZ_js4oW8VVKKpGOcdCbdo3wVQ_SySueAFNhBgsyZ3FJVJyFFGC0/pub?embedded=true"
              style={{ width: '100%', minHeight: '600px' }}
            ></iframe>
          </Box>
        </Box>
      </Box>
    </Container>
  );

  return (
    <Providers page={page} componentProps={componentProps}>
      <Layout page={page} mainReplacementChildren={pageContent} />
    </Providers>
  );
};

export default GoogleTestPage;
// This function gets called at request time on server-side.
export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};
  const path = extractPath(context);

  let page;

  if (context.preview && isDesignLibraryPreviewData(context.previewData)) {
    page = await client.getDesignLibraryData(context.previewData);
  } else {
    page = context.preview
      ? await client.getPreview(context.previewData)
      : await client.getPage(path, { locale: context.locale });
  }
  if (page) {
    props = {
      page,
      dictionary: await client.getDictionary({
        site: page.siteName,
        locale: page.locale,
      }),
      componentProps: await client.getComponentData(page.layout, context, components),
    };
  }
  return {
    props,
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 5 seconds
    notFound: !page,
  };
};
