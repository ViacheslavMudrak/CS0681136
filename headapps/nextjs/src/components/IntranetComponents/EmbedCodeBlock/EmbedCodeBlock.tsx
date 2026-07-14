import { JSX } from 'react';
import { Link, RichText, Text, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import styles from './EmbedCodeBlock.module.scss';

import { EmbedCodeBlockProps, EmbedCodeBlockVariant } from './EmbedCodeBlock.types';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const EmbedCodeBlock = (
  props: EmbedCodeBlockProps & { variant?: EmbedCodeBlockVariant }
): JSX.Element => {
  const { fields, rendering } = props;
  const embedCodeOnRight = rendering.params?.embedCodeOnRight === '1';
  const hasButtonOne = !!fields.buttonLinkOne?.value?.href;
  const hasButtonTwo = !!fields.buttonLinkTwo?.value?.href;
  const hasButtons = hasButtonOne || hasButtonTwo;

  const decodeHtml = (html: string) => {
    return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  };

  const rawCode = fields.code?.value || '';
  const safeEmbedCode = decodeHtml(rawCode);

  return (
    <div
      className={cx(
        'embed-code-block',
        'component container flex',
        props.variant === 'Full' && 'embed-code-block--full',
        props.variant === 'FiftyFifty' && 'embed-code-block--fifty-fifty',
        props.variant === 'FiftyFifty' && embedCodeOnRight && 'embed-code-block--embed-right',
        props.stylesSXA
      )}
    >
      <div className={cx('embed-code-block__content', 'flex flex-col')}>
        <div className={cx('embed-code-block__text', 'flex flex-col')}>
          <Text
            tag="span"
            className={cx('embed-code-block__eyebrow', 'text-eyebrow eyebrow eyebrow-font-size')}
            field={props.fields.optionalEyebrow}
          />
          <Text tag="h2" field={props.fields.headlineText} />
          <RichText tag="div" className={cx('rich-text')} field={props.fields.subtext} />
        </div>
        {hasButtons && (
          <div className={cx('embed-code-block__buttons', '')}>
            <Link
              field={props.fields.buttonLinkOne}
              className={cx('asc-btn', 'asc-btn--primary')}
            />
            <Link
              field={props.fields.buttonLinkTwo}
              className={cx('asc-btn', 'asc-btn--outline')}
            />
          </div>
        )}
      </div>

      <div className={cx('embed-code-block__embed-container')}>
        <div dangerouslySetInnerHTML={{ __html: safeEmbedCode }}></div>
      </div>
    </div>
  );
};

export const Full = compose<EmbedCodeBlockProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <EmbedCodeBlock {...props} variant="Full" />);

export const FiftyFifty = compose<EmbedCodeBlockProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props) => <EmbedCodeBlock {...props} variant="FiftyFifty" />);

export default Full;
