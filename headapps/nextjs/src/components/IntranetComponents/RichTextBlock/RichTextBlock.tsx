import { JSX } from 'react';
import classNames from 'classnames/bind';
import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import { RichTextBlockProps, RichTextBlockVariant } from './RichTextBlock.types';
import styles from './RichTextBlock.module.scss';
import { RichText, useSitecore, withDatasourceCheck } from '@sitecore-content-sdk/nextjs';
import { withJumplink } from 'lib/enhancers/withJumplink';
import { matchesTemplate, TEMPLATE_ID_CONSTANTS } from 'src/constants/template-ids';

const cx = classNames.bind(styles);

const RichTextBlock = (
  props: RichTextBlockProps & {
    variant?: RichTextBlockVariant;
  }
): JSX.Element => {
  const { fields, variant = 'Default' } = props;
  const { page } = useSitecore();

  const isNewsDetailPage = matchesTemplate(
    page.layout.sitecore.route?.templateId,
    TEMPLATE_ID_CONSTANTS.NEWS_DETAIL_PAGE
  );

  // Full-width is the default; News Detail pages fall back to the smaller container
  const isFullWidth = !isNewsDetailPage;

  // APPROACH 1: get page.templateID in component, then conditionally apply styles based on templateID if news detail template

  // APPROACH 2: assign template-name to top-level layout (body tag), then use global CSS to apply styles based on if template-name = news-detail

  return (
    <div
      className={cx(
        'rich-text-block',
        (variant === 'IntroductionYellowGradient' || variant === 'IntroductionBlueGradient') &&
          'rich-text-block--introduction',
        variant === 'IntroductionBlueGradient' && 'blue',
        'component p-4',
        props.stylesSXA
      )}
    >
      <RichText
        className={`${cx('rich-text-block__container')} ${isFullWidth ? 'container' : 'container-sm'}`}
        field={fields.richContent}
        tag="div"
      />
    </div>
  );
};

export const Default = compose<RichTextBlockProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(RichTextBlock);

export const IntroductionYellowGradient = compose<RichTextBlockProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props: RichTextBlockProps) => <RichTextBlock {...props} variant="IntroductionYellowGradient" />);

export const IntroductionBlueGradient = compose<RichTextBlockProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)((props: RichTextBlockProps) => <RichTextBlock {...props} variant="IntroductionBlueGradient" />);

export default Default;
