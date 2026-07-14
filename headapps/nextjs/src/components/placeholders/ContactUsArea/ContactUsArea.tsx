import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const ContactUsArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="contact-us-area" rendering={props.rendering} />
    </>
  );
};

export default ContactUsArea;
