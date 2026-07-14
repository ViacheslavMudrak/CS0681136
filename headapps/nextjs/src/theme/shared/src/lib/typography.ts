// src/theme/shared/src/lib/typography.ts
import { TypographyVariantsOptions } from '@mui/material/styles';

// This is what you pass into createTheme({ typography })
export const typography: TypographyVariantsOptions & Record<string, unknown> = {
  // fontFamily: 'Roboto, Arial, sans-serif',
  fontFamily: '"Whitney-Book", Arial, Helvetica, sans-serif',

  h1: { fontSize: 32, fontWeight: 700, lineHeight: 1.25 },
  h2: { fontSize: 28, fontWeight: 600, lineHeight: 1.3 },
  h3: { fontSize: 24, fontWeight: 600, lineHeight: 1.35 },
  h4: { fontSize: 20, fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: 18, fontWeight: 500, lineHeight: 1.4 },

  body1: { fontSize: 18, lineHeight: 1.5 },
  body2: { fontSize: 14, lineHeight: 1.5 },
  button: { fontWeight: 600, textTransform: 'uppercase' },
  overline: { fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' },

  // ✅ your custom variants (these will require module augmentation)
  body1Primary: { fontSize: 16, lineHeight: 1.5, color: '#000' },
  body1Emphasis: { fontSize: 16, fontWeight: 600, lineHeight: 1.5 },
  body1Link: { fontSize: 16, lineHeight: 1.5, color: '#1976d2' },
  body2Primary: { fontSize: 14, lineHeight: 1.5, color: '#000' },
  body2Emphasis: { fontSize: 14, fontWeight: 600, lineHeight: 1.5 },
  body2Link: { fontSize: 14, lineHeight: 1.5, color: '#1976d2' },
  // … continue with your custom keys
};
