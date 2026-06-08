import React, { JSX } from 'react';
import { cn } from 'lib/utils';
import {
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
  ImageField,
  Field,
  LinkField,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

const PROMO_KNOWN_STYLE_TOKENS = [
  'absolute-bottom-link',
  'image-full-size',
  'promo-hero',
  'promo-hero-half',
  'promo-shadow',
  'main-promo-no-border',
] as const;

interface Fields {
  PromoIcon: ImageField;
  PromoText: Field<string>;
  PromoLink: LinkField;
  PromoText2: Field<string>;
}

type PromoProps = ComponentProps & {
  fields: Fields;
};

interface PromoContentProps extends PromoProps {
  renderText: (fields: Fields) => JSX.Element;
}

const PromoContent = (props: PromoContentProps): JSX.Element => {
  const { fields, params, renderText } = props;
  const { styles } = params;
  const tokens = (styles ?? '').trim().split(/\s+/).filter(Boolean);

  const Wrapper = ({ children }: { children: JSX.Element }): JSX.Element => (
    <div
      className={cn(
        'component promo box-border overflow-hidden bg-surface p-[15px]',
        tokens.includes('absolute-bottom-link') &&
          'absolute-bottom-link relative [&_.field-promolink]:absolute [&_.field-promolink]:bottom-[10px] [&_.field-promolink]:right-[10px]',
        tokens.includes('image-full-size') && '[&_img]:mb-[10px]',
        tokens.includes('promo-hero') &&
          'promo-hero relative text-center [&_.field-promotext]:absolute [&_.field-promotext]:top-1/2 [&_.field-promotext]:right-0 [&_.field-promotext]:left-0 [&_.field-promotext]:inline-block [&_.field-promotext]:-translate-y-1/2 [&_.field-promotext]:bg-promo-bg-hero [&_.field-promotext]:p-5 [&_.field-promotext]:text-ink-inverse max-desktop:[&_.field-promotext]:m-0 max-desktop:[&_.field-promotext]:w-full [&_.field-promotext>a]:text-inherit [&_.field-promotext>a]:no-underline max-desktop:[&_.field-promotext_h1]:text-[2.4rem] max-desktop:[&_.field-promotext_h1]:text-font-extrabig max-desktop:[&_.field-promotext_h2]:text-[2.0rem] max-desktop:[&_.field-promotext_h2]:text-font-big max-desktop:[&_.field-promotext_h3]:text-[2.0rem] max-desktop:[&_.field-promotext_h3]:text-font-big max-desktop:[&_.field-promotext_h4]:text-[2.0rem] max-desktop:[&_.field-promotext_h4]:text-font-big',
        tokens.includes('promo-hero-half') &&
          'float-left w-1/2 max-desktop:w-full max-desktop:float-none',
        tokens.includes('promo-shadow') &&
          'promo-shadow relative float-left max-w-[960px] overflow-visible border-solid border-t-[3px] border-t-accent-teal p-0',
        tokens.includes('main-promo-no-border') &&
          'main-promo-no-border mb-20 pl-0 pr-0 pb-0 max-mobile-large:mb-0 [&>.component-content]:mr-[50px] [&>.component-content]:max-w-[583px] [&>.component-content]:border-0 max-mobile-large:[&>.component-content]:mr-0 max-mobile-large:[&>.component-content]:max-w-full [&>.component-content>div]:pb-0 max-mobile-large:[&>.component-content>div]:p-0 [&_.promo-text_.field-promotext]:text-sm [&_.promo-text_.field-promotext_h3]:mx-0 [&_.promo-text_.field-promotext_h3]:my-[15px] [&_.promo-text_.field-promotext_h3]:text-lg max-mobile-large:[&_.promo-text_.field-promotext_h3]:my-[10px] [&_.promo-text_.field-promotext_p]:mx-0 [&_.promo-text_.field-promotext_p]:my-[10px] max-mobile-large:[&_.promo-text]:px-[30px] max-mobile-large:[&_.promo-text]:pt-[15px] max-mobile-large:[&_.promo-text]:pb-[5px]',
        ...tokens.filter((t) => !(PROMO_KNOWN_STYLE_TOKENS as readonly string[]).includes(t)),
      )}
      {...renderingAnchorIdProps(params.RenderingIdentifier)}
    >
      <div
        className={cn(
          'component-content relative border border-solid border-stroke-default after:table after:clear-both after:content-[\'\'] [&>div]:p-[5px]',
          tokens.includes('promo-shadow') &&
            'mt-0 mr-0 mb-[30px] ml-0 p-[15px] max-desktop:mt-0 max-desktop:mb-[30px] max-desktop:ml-[10px] max-desktop:mr-[10px] before:absolute before:bottom-[10px] before:left-[2%] before:-z-10 before:h-[20%] before:max-h-[100px] before:max-w-[460px] before:w-[47%] before:-rotate-3 before:opacity-70 before:shadow-[0_17px_10px_rgba(0,0,0,0.7)] before:content-[\'\'] after:absolute after:bottom-[10px] after:right-[2%] after:-z-10 after:h-[20%] after:max-h-[100px] after:max-w-[460px] after:w-[47%] after:rotate-3 after:opacity-70 after:shadow-[0_17px_10px_rgba(0,0,0,0.7)] after:content-[\'\']',
        )}
      >
        {children}
      </div>
    </div>
  );

  if (!fields) {
    return (
      <Wrapper>
        <span className="is-empty-hint">Promo</span>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <>
        <div className="field-promoicon overflow-hidden w-full [&_img]:h-auto [&_img]:w-full">
          <ContentSdkImage field={fields.PromoIcon} />
        </div>
        <div className="promo-text">{renderText(fields)}</div>
      </>
    </Wrapper>
  );
};

export const Default = (props: PromoProps): JSX.Element => {
  const renderText = (fields: Fields) => (
    <>
      <div className="field-promotext">
        <ContentSdkRichText field={fields.PromoText} />
      </div>
      <div className="field-promolink mt-[5px] pb-[10px]">
        <ContentSdkLink field={fields.PromoLink} />
      </div>
    </>
  );

  return <PromoContent {...props} renderText={renderText} />;
};

export const WithText = (props: PromoProps): JSX.Element => {
  const renderText = (fields: Fields) => (
    <>
      <div className="field-promotext">
        <ContentSdkRichText className="promo-text" field={fields.PromoText} />
      </div>
      <div className="field-promotext">
        <ContentSdkRichText className="promo-text" field={fields.PromoText2} />
      </div>
    </>
  );

  return <PromoContent {...props} renderText={renderText} />;
};
