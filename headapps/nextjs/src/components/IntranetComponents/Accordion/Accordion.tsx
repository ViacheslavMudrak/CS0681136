import { JSX } from 'react';
import {
  RichText,
  Text,
  Placeholder,
  withPlaceholder,
  useSitecore,
  RichTextField,
  TextField,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { PLACEHOLDER_CONSTANTS } from 'src/constants/placeholders';
import { AccordionProps } from './Accordion.types';
import styles from './Accordion.module.scss';
import { AccordionRenderingModeEnum } from 'ts/accordion-modes';
import MuiAccordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);
// For direct placeholder introspection using withPlaceholder, we need a constant key and cannot compute a dynamic key using props.
// This also corresponds with the key defined in placeholder settings and through layout information
const wildcardPlaceholderKey = `${PLACEHOLDER_CONSTANTS.ACCORDIONITEMS_BASEKEY}-{*}`;

const Accordion = (props: AccordionProps): JSX.Element => {
  const { rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const openMode = rendering.params?.openMode || 'Closed';

  const dynamicPlaceholderKey = `${PLACEHOLDER_CONSTANTS.ACCORDIONITEMS_BASEKEY}-${props.params.DynamicPlaceholderId}`;
  const itemsFromPlaceholder = rendering?.placeholders?.[wildcardPlaceholderKey] || [];

  return isPageEditing ? (
    <div className={cx('accordion', 'container component', props.stylesSXA)}>
      <Placeholder name={dynamicPlaceholderKey} rendering={rendering} />
    </div>
  ) : (
    <div className={cx('accordion', 'container component', props.stylesSXA)}>
      {itemsFromPlaceholder
        .filter(
          (accordionItem) =>
            accordionItem &&
            accordionItem.fields &&
            accordionItem.fields.header &&
            (accordionItem.fields.header as TextField).value &&
            accordionItem.fields.content &&
            (accordionItem.fields.content as RichTextField).value
        )
        .map((accordionItem, index) => {
          const defaultExpanded =
            openMode === AccordionRenderingModeEnum.OpenAll ||
            (openMode === AccordionRenderingModeEnum.OpenFirst && index === 0);

          return (
            <MuiAccordion
              key={accordionItem.uid}
              defaultExpanded={defaultExpanded}
              id={accordionItem.params?.RenderingIdentifier}
            >
              <AccordionSummary expandIcon={<MaterialIcon name="ExpandMore" />}>
                <Box>
                  <Text
                    className={cx({ title: true })}
                    field={accordionItem.fields?.header as TextField}
                    tag="h2"
                    editable={true}
                  />
                  <Text
                    className={cx('mb-0', { title: true })}
                    field={accordionItem.fields?.secondaryContent as TextField}
                    tag="p"
                    editable={true}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <RichText
                  className={cx('body rich-text')}
                  field={accordionItem.fields?.content as RichTextField}
                  tag="div"
                />
              </AccordionDetails>
            </MuiAccordion>
          );
        })}
    </div>
  );
};

export default compose(
  withStyles()<AccordionProps>,
  withJumplink()<AccordionProps>,
  withPlaceholder
)(Accordion);
