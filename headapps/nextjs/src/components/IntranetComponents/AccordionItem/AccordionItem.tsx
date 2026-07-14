import { JSX } from 'react';
import { RichText, Text, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import React, { useEffect, useRef } from 'react';
import compose from 'lib/enhancers/compose';
import { AccordionItemProps } from './AccordionItem.types';
import styles from './AccordionItem.module.scss';
import MuiAccordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import withStyles from 'lib/enhancers/withStyles';
import { MaterialIcon } from 'components/common/Icon/MaterialIcon';

const cx = classNames.bind(styles);

const AccordionItem = (props: AccordionItemProps): JSX.Element => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const headerWrapRef = useRef<HTMLDivElement | null>(null);

  const handleHeaderClickCapture: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!isPageEditing) return;

    const target = event.target as HTMLElement | null;
    const isInEditable = target?.isContentEditable || !!target?.closest('[contenteditable="true"]');

    if (isInEditable) {
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
    }
  };

  useEffect(() => {
    if (!isPageEditing) return;
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const onKeyDownCapture = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Spacebar') return;

      const wrap = headerWrapRef.current;
      if (!wrap) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const anchorNode = sel.anchorNode;
      if (!anchorNode) return;

      const anchorEl =
        anchorNode.nodeType === Node.ELEMENT_NODE
          ? (anchorNode as Element)
          : anchorNode.parentElement;

      if (!anchorEl) return;

      if (!wrap.contains(anchorEl)) {
        return;
      }

      // If focus is in header/subheading, stop MUI toggling
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const NBSP = '\u00A0';
      const range = sel.getRangeAt(0);
      range.deleteContents();

      const textNode = document.createTextNode(NBSP);
      range.insertNode(textNode);

      range.setStartAfter(textNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    };

    document.addEventListener('keydown', onKeyDownCapture, true);
    return () => document.removeEventListener('keydown', onKeyDownCapture, true);
  }, [isPageEditing]);

  if (!isPageEditing) {
    return (
      <>
        {/* During live page rendering, the accordion items get rendered entirely by the parent component to manage open state */}
      </>
    );
  }

  return (
    <MuiAccordion id={rendering.params?.RenderingIdentifier}>
      <AccordionSummary
        aria-controls="panel1-content"
        id="panel1-header"
        expandIcon={<MaterialIcon name="ExpandMore" />}
      >
        {/*only header/subheading wrapped here */}
        <Box ref={headerWrapRef} onClickCapture={handleHeaderClickCapture}>
          <Text className={cx({ title: true })} field={fields.header} tag="h2" editable={true} />
          <Text
            className={cx('mb-0', { title: true })}
            field={fields.secondaryContent}
            tag="p"
            editable={true}
          />
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Box>
          <RichText className={cx('body rich-text')} field={fields.content} tag="div" />
        </Box>
      </AccordionDetails>
    </MuiAccordion>
  );
};

export default compose<AccordionItemProps>(withDatasourceCheck(), withStyles())(AccordionItem);
