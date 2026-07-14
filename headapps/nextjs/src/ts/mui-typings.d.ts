import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    body1Primary: React.CSSProperties;
    body1Emphasis: React.CSSProperties;
    body1Link: React.CSSProperties;
    body2Primary: React.CSSProperties;
    body2Emphasis: React.CSSProperties;
    body2Link: React.CSSProperties;
    body3Primary: React.CSSProperties;
    body3Emphasis: React.CSSProperties;
    body3Link: React.CSSProperties;
    hero1: React.CSSProperties;
    xSmall: React.CSSProperties;
    tabProfileFont: React.CSSProperties;
    // … add the rest of your custom keys if you want full typing
  }

  interface TypographyVariantsOptions {
    body1Primary?: React.CSSProperties;
    body1Emphasis?: React.CSSProperties;
    body1Link?: React.CSSProperties;
    body2Primary?: React.CSSProperties;
    body2Emphasis?: React.CSSProperties;
    body2Link?: React.CSSProperties;
    body3Primary?: React.CSSProperties;
    body3Emphasis?: React.CSSProperties;
    body3Link?: React.CSSProperties;
    hero1?: React.CSSProperties;
    xSmall?: React.CSSProperties;
    tabProfileFont?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body1Primary: true;
    body1Emphasis: true;
    body1Link: true;
    body2Primary: true;
    body2Emphasis: true;
    body2Link: true;
    body3Primary: true;
    body3Emphasis: true;
    body3Link: true;
    hero1: true;
    xSmall: true;
    tabProfileFont: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    plainText: true;
    noBorderOutline: true;
  }
}
