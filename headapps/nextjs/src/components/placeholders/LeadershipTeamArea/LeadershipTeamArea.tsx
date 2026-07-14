import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const LeadershipTeamArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="leadership-team-area" rendering={props.rendering} />
    </>
  );
};

export default LeadershipTeamArea;
