import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const UpcomingEventsArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="upcoming-events-area" rendering={props.rendering} />
    </>
  );
};

export default UpcomingEventsArea;
