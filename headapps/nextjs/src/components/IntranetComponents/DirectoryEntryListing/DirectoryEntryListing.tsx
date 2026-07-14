import DirectoryEntryListingSearchResultsWidget from 'components/search/widgets/DirectoryEntryListingSearchResults';
import compose from 'lib/enhancers/compose';
import { withJumplink } from 'lib/enhancers/withJumplink';
import withStyles from 'lib/enhancers/withStyles';
import { JSX } from 'react';

import { withDatasourceCheck } from '@sitecore-content-sdk/nextjs';

import { DirectoryEntryListingProps } from './DirectoryEntryListing.types';

const DirectoryEntryListing = (props: DirectoryEntryListingProps): JSX.Element => {
  // Extract folder path from the directory field if provided
  // The path is used to filter directory entries to a specific folder
  const folderPath =
    props.fields?.data?.datasource?.directoryEntries?.targetItems?.map((item) => {
      return item?.path;
    }) || [];

  return (
    <DirectoryEntryListingSearchResultsWidget
      {...props}
      folderPath={folderPath as string[]}
      rfkId="directory-entry-listing"
    />
  );
};

export default compose<DirectoryEntryListingProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(DirectoryEntryListing);
