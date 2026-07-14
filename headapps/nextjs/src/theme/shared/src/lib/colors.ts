// import React from 'react';
// import { ThemeOptions } from '@mui/material/styles';

export const brandBlue = {
  10: '#FAFDFF',
  50: '#E8F5FE',
  100: '#D1EAFC',
  200: '#A4D3FA',
  300: '#75B3F1',
  400: '#5194E3',
  500: '#1E69D2',
  600: '#1551B4',
  700: '#0F3C97',
  800: '#092A79',
  900: '#051D64',
  901: '#F2F9FF',
  '4%': 'rgba(30, 105, 210, 0.04)',
  '8%': 'rgba(30, 105, 210, 0.08)',
  '12%': 'rgba(164, 211, 250, 0.12)',
  '20%': 'rgba(30, 105, 210, 0.20)',
  '100%': 'rgb(30, 105, 210)',
};

export const brandViolet = {
  50: '#FDE6EE',
  100: '#FBCDDC',
  200: '#F79CC4',
  300: '#E868AC',
  400: '#D2419C',
  500: '#B40F87',
  600: '#9A0A81',
  700: '#810778',
  800: '#660468',
  900: '#4C0256',
  '4%': 'rgba(129, 7, 120, 0.04)',
  '8%': 'rgba(129, 7, 120, 0.08)',
  '12%': 'rgba(247, 156, 196, 0.12)',
  '20%': 'rgba(129, 7, 120, 0.2)',
};

export const brandGreen = {
  50: '#E6FFFB',
  100: '#C4FFF6',
  200: '#A2FFF1',
  300: '#00D5B5',
  400: '#00C4A7',
  500: '#00A28A',
  600: '#009176',
  700: '#00806D',
  800: '#006F5F',
  900: '#005E50',
};

export const brandGold = {
  50: '#FFFAEE',
  100: '#FFF0CC',
  200: '#FFE199',
  300: '#FFD266',
  400: '#FFC844',
  500: '#FFC333',
  600: '#FFBE22',
  700: '#FFB400',
  800: '#EEA900',
  900: '#DD9C00',
};

export const error = {
  50: '#FEEBE5',
  100: '#FDD7CA',
  200: '#FBA797',
  300: '#F56C62',
  400: '#EC3B3E',
  500: '#E00019',
  600: '#C00027',
  700: '#A1002F',
  800: '#810032',
  900: '#6B0033',
  '4%': 'rgba(161, 0, 47, 0.04)',
  '8%': 'rgba(224, 0, 25, 0.08)',
  '12%': 'rgba(249, 150, 151, 0.12)',
  '20%': 'rgba(224, 0, 25, 0.2)',
  '100%': 'rgb(161, 0, 47)',
};

export const warning = {
  50: '#FFF7E6',
  100: '#FFEFCC',
  200: '#FFDB99',
  300: '#FFC166',
  400: '#FFA83F',
  500: '#FF7F00',
  600: '#DB6200',
  700: '#B74900',
  800: '#933300',
  900: '#7A2400',
  950: '#d32f2f',
  '4%': 'rgba(183, 73, 0, 0.04)',
  '8%': 'rgba(183, 73, 0, 0.08)',
  '12%': 'rgba(255, 167, 38, 0.12)',
  '20%': 'rgba(183, 73, 0, 0.2)',
};

export const success = {
  50: '#E9FBE7',
  100: '#D4F8D0',
  200: '#A4F2A4',
  300: '#70D87B',
  400: '#46B25C',
  500: '#198038',
  600: '#126E36',
  700: '#0C5C34',
  800: '#074A2F',
  900: '#043D2C',
  901: '#00A28A',
  '4%': 'rgba(12, 92, 52, 0.04)',
  '8%': 'rgba(12, 92, 52, 0.08)',
  '20%': 'rgba(12, 92, 52, 0.2)',
  '100%': 'rgb(12, 92, 52)',
};

export const info = {
  50: '#E8F5FE',
  100: '#D1EAFC',
  200: '#A4D3FA',
  300: '#75B3F1',
  400: '#5194E3',
  500: '#1E69D2',
  600: '#1551B4',
  700: '#0F3C97',
  800: '#092A79',
  900: '#051D64',
  '4%': 'rgba(66, 66, 66, 0.04)',
  '8%': 'rgba(66, 66, 66, 0.08)',
  '12%': 'rgba(2, 136, 209, 0.12)',
  '20%': 'rgba(66, 66, 66, 0.2)',
};

export const gray = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  150: '#E5E5E5',
  200: '#EEEEEE',
  250: '#F4F4F4',
  300: '#E0E0E0',
  400: '#BDBDBD',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

export const white = {
  100: '#FFFFFF',
  70: 'rgba(255, 255, 255, 0.7)',
  50: 'rgba(255, 255, 255, 0.5)',
  30: 'rgba(255, 255, 255, 0.3)',
  23: 'rgba(255, 255, 255, 0.23)',
  20: 'rgba(255, 255, 255, 0.20)',
  12: 'rgba(255, 255, 255, 0.12)',
};

export const black = {
  100: '#000000',
  87: 'rgba(0, 0, 0, 0.87)',
  60: 'rgba(0, 0, 0, 0.6)',
  50: 'rgba(0, 0, 0, 0.5)',
  38: 'rgba(0, 0, 0, 0.38)',
  23: 'rgba(0, 0, 0, 0.23)',
  20: 'rgba(0, 0, 0, 0.20)',
  12: 'rgba(0, 0, 0, 0.12)',
};

export const contentPalette = {
  light: {
    primary: black['87'],
    secondary: black['60'],
    disabled: black['38'],
    inverse: white['100'],
    divider: black['12'],
  },
  dark: {
    primary: white['100'],
    secondary: white['70'],
    disabled: white['50'],
    inverse: black['87'],
    divider: white['12'],
  },
};

export const primaryPalette = {
  light: {
    main: brandBlue['500'],
    auxiliary: brandBlue['800'],
    mainBackground: brandBlue['50'],
    auxiliaryBackground: brandBlue['100'],
  },
  dark: {
    main: brandBlue['200'],
    auxiliary: brandBlue['400'],
    mainBackground: brandBlue['50'],
    auxiliaryBackground: brandBlue['100'],
  },
};

export const primaryStateOverlay = {
  light: {
    hovered: brandBlue['4%'],
    focused: brandBlue['8%'],
    focusedRipple: brandBlue['20%'],
    selected: brandBlue['8%'],
  },
  dark: {
    hovered: brandBlue['8%'],
    focused: brandBlue['12%'],
    focusedRipple: brandBlue['20%'],
    selected: brandBlue['12%'],
  },
};

export const secondaryPalette = {
  light: {
    main: brandViolet['600'],
    auxiliary: brandViolet['800'],
    mainBackground: brandViolet['50'],
    auxiliaryBackground: brandViolet['100'],
    emphasisBackground: brandViolet['500'],
  },
  dark: {
    main: brandViolet['200'],
    auxiliary: brandViolet['400'],
    mainBackground: brandViolet['50'],
    auxiliaryBackground: brandViolet['100'],
  },
};

export const secondaryStateOverlay = {
  light: {
    hovered: brandViolet['4%'],
    focused: brandViolet['8%'],
    focusedRipple: brandViolet['20%'],
    selected: brandViolet['8%'],
  },
  dark: {
    hovered: brandViolet['8%'],
    focused: brandViolet['12%'],
    focusedRipple: brandViolet['20%'],
    selected: brandViolet['12%'],
  },
};

export const greenPalette = {
  light: {
    main: brandGreen['500'],
    auxiliary: brandGreen['900'],
    mainBackground: brandGreen['50'],
    auxiliaryBackground: brandGreen['100'],
  },
  dark: {
    main: brandGreen['200'],
    auxiliary: brandGreen['400'],
    mainBackground: brandGreen['50'],
    auxiliaryBackground: brandGreen['100'],
  },
};

export const goldPalette = {
  light: {
    main: brandGold['500'],
    auxiliary: brandGold['700'],
    mainBackground: brandGold['50'],
    auxiliaryBackground: brandGold['100'],
  },
  dark: {
    main: brandGold['200'],
    auxiliary: brandGold['400'],
    mainBackground: brandGold['50'],
    auxiliaryBackground: brandGold['100'],
  },
};

export const backgroundPalette = {
  light: {
    main: gray['50'],
    component: white['100'],
    disabled: black['12'],
    mainBackground: gray['50'],
    auxiliary: brandBlue['10'],
    auxiliaryBackground: gray[200],
  },
  dark: {
    main: gray['50'],
    component: white['100'],
    disabled: white['12'],
    mainBackground: brandBlue[10],
    auxiliary: brandBlue['10'],
    auxiliaryBackground: gray[200],
  },
};

export const errorPalette = {
  light: {
    main: error['700'],
    auxiliary: error['900'],
    mainBackground: error['50'],
    auxiliaryBackground: error['100'],
  },
  dark: {
    main: error['200'],
    auxiliary: error['400'],
    mainBackground: error['50'],
    auxiliaryBackground: error['100'],
  },
};

export const errorStateOverlay = {
  light: {
    hovered: error['4%'],
    focused: error['8%'],
    focusedRipple: error['20%'],
    selected: error['8%'],
  },
  dark: {
    hovered: error['8%'],
    focused: error['12%'],
    focusedRipple: error['20%'],
    selected: error['12%'],
  },
};

export const warningPalette = {
  light: {
    main: warning['700'],
    auxiliary: warning['900'],
    mainBackground: warning['50'],
    auxiliaryBackground: warning['100'],
  },
  dark: {
    main: warning['200'],
    auxiliary: warning['400'],
    mainBackground: warning['50'],
    auxiliaryBackground: warning['100'],
  },
};

export const warningStateOverlay = {
  light: {
    hovered: warning['4%'],
    focused: warning['8%'],
    focusedRipple: warning['20%'],
    selected: warning['8%'],
  },
  dark: {
    hovered: warning['8%'],
    focused: warning['12%'],
    focusedRipple: warning['20%'],
    selected: warning['12%'],
  },
};

export const successPalette = {
  light: {
    main: success['700'],
    auxiliary: success['900'],
    mainBackground: success['50'],
    auxiliaryBackground: success['100'],
  },
  dark: {
    main: success['200'],
    auxiliary: success['400'],
    mainBackground: success['50'],
    auxiliaryBackground: success['100'],
  },
};

export const successStateOverlay = {
  light: {
    hovered: success['4%'],
    focused: success['8%'],
    focusedRipple: success['20%'],
    selected: success['8%'],
  },
  dark: {
    hovered: success['4%'],
    focused: success['8%'],
    focusedRipple: success['20%'],
    selected: success['8%'],
  },
};

export const infoPalette = {
  light: {
    main: gray['800'],
    auxiliary: gray['900'],
    mainBackground: gray['100'],
    auxiliaryBackground: gray['200'],
  },
  dark: {
    main: info['200'],
    auxiliary: info['400'],
    mainBackground: info['50'],
    auxiliaryBackground: info['100'],
  },
};

export const infoStateOverlay = {
  light: {
    hovered: info['4%'],
    focused: info['8%'],
    focusedRipple: info['20%'],
    selected: info['8%'],
  },
  dark: {
    hovered: info['8%'],
    focused: info['12%'],
    focusedRipple: info['20%'],
    selected: info['12%'],
  },
};
const navigationButton = {
  light: {
    hovered: brandBlue['500'],
    focused: brandBlue['800'],
    focusedRipple: brandBlue['800'],
    selected: brandBlue['800'],
  },
  dark: {
    hovered: error['200'],
    focused: error['400'],
    focusedRipple: error['400'],
    selected: error['400'],
  },
};
export const otherPalette = {
  light: {
    divider: black['12'],
    mainBorder: black['50'],
    auxiliaryBorder: black['87'],
    ratingActive: brandGold['700'],
    backdropOverlay: black['50'],
    bottomSheetHandle: gray['300'],
    appHeaderBorder: 'rgba(15, 60, 151, 0.08)',
  },
  dark: {
    divider: white['12'],
    mainBorder: white['23'],
    auxiliaryBorder: white['100'],
    ratingActive: brandGold['700'],
    bottomSheetHandle: gray['300'],
    appHeaderBorder: 'rgba(15, 60, 151, 0.08)',
  },
};

export const focusPalette = {
  light: {
    main: brandViolet[500],
    inverse: white[100],
    overlay: brandViolet['8%'],
  },
  dark: {
    main: brandViolet[200],
    inverse: black[87],
    overlay: brandViolet['12%'],
  },
};

export const button = {
  inactive: {
    light: {
      backgroundColorPrimary: 'rgba(0, 0, 0, 0.12)',
      colorPrimary: 'rgba(0, 0, 0, 0.26)',
    },
    dark: {
      backgroundColorPrimary: 'rgba(255, 255, 255, 0.12)',
      colorPrimary: 'rgba(255, 255, 255, 0.3)',
    },
  },
  standard: {
    light: {
      colorPrimary: white[100],
      colorSecondary: brandBlue['500'],
      backgroundColorPrimary: brandBlue['500'],
      borderColorPrimary: brandBlue['500'],
      borderColorSecondary: white[100],
    },
    dark: {
      colorPrimary: brandBlue[500],
      colorSecondary: white[100],
      backgroundColorPrimary: white[100],
      borderColorPrimary: white[100],
      borderColorSecondary: black[100],
    },
  },
  destructive: {
    light: {
      colorPrimary: '#FFFFFF',
      colorSecondary: '#A1002F',
      backgroundColorPrimary: '#A1002F',
      borderColorPrimary: '#A1002F',
      borderColorSecondary: '#FFFFFF',
    },
    dark: {
      colorPrimary: '#A1002F',
      colorSecondary: '#FFFFFF',
      backgroundColorPrimary: '#FFFFFF',
      borderColorPrimary: '#FFFFFF',
      borderColorSecondary: '#000000',
    },
  },
};

// declare module '@mui/material/styles' {
//   interface ThemeOptions {
//     contentPalette: {
//       primary: React.CSSProperties['color'];
//       secondary: React.CSSProperties['color'];
//       disabled: React.CSSProperties['color'];
//       inverse: React.CSSProperties['color'];
//     };
//     primaryPalette: {
//       main: React.CSSProperties['color'];
//       auxiliary: React.CSSProperties['color'];
//       mainBackground: React.CSSProperties['color'];
//       auxiliaryBackground: React.CSSProperties['color'];
//     };
//     primaryStateOverlay: {
//       hovered: React.CSSProperties['color'];
//       focused: React.CSSProperties['color'];
//       focusedRipple: React.CSSProperties['color'];
//       selected: React.CSSProperties['color'];
//     };
//     secondaryPalette: {
//       main: React.CSSProperties['color'];
//       auxiliary: React.CSSProperties['color'];
//       mainBackground: React.CSSProperties['color'];
//       auxiliaryBackground: React.CSSProperties['color'];
//       emphasisBackground?: React.CSSProperties['color'];
//     };
//     secondaryStateOverlay: {
//       hovered: React.CSSProperties['color'];
//       focused: React.CSSProperties['color'];
//       focusedRipple: React.CSSProperties['color'];
//       selected: React.CSSProperties['color'];
//     };
//     green: {
//       main: React.CSSProperties['color'];
//       auxiliary: React.CSSProperties['color'];
//       mainBackground: React.CSSProperties['color'];
//       auxiliaryBackground: React.CSSProperties['color'];
//     };
//     gold: {
//       main: React.CSSProperties['color'];
//       auxiliary: React.CSSProperties['color'];
//       mainBackground: React.CSSProperties['color'];
//       auxiliaryBackground: React.CSSProperties['color'];
//     };
//     backgroundPalette: {
//       default: React.CSSProperties['color'];
//       component: React.CSSProperties['color'];
//       disabled: React.CSSProperties['color'];
//     };
//     errorPalette: {
//       main: React.CSSProperties['color'];
//       auxiliary: React.CSSProperties['color'];
//       mainBackground: React.CSSProperties['color'];
//       auxiliaryBackground: React.CSSProperties['color'];
//     };
//     errorStateOverlay: {
//       hovered: React.CSSProperties['color'];
//       focused: React.CSSProperties['color'];
//       focusedRipple: React.CSSProperties['color'];
//       selected: React.CSSProperties['color'];
//     };
//     warningPalette: {
//       main: React.CSSProperties['color'];
//       auxiliary: React.CSSProperties['color'];
//       mainBackground: React.CSSProperties['color'];
//       auxiliaryBackground: React.CSSProperties['color'];
//     };
//     warningStateOverlay: {
//       hovered: React.CSSProperties['color'];
//       focused: React.CSSProperties['color'];
//       focusedRipple: React.CSSProperties['color'];
//       selected: React.CSSProperties['color'];
//     };
//     successPalette: {
//       main: React.CSSProperties['color'];
//       auxiliary: React.CSSProperties['color'];
//       mainBackground: React.CSSProperties['color'];
//       auxiliaryBackground: React.CSSProperties['color'];
//     };
//     successStateOverlay: {
//       hovered: React.CSSProperties['color'];
//       focused: React.CSSProperties['color'];
//       focusedRipple: React.CSSProperties['color'];
//       selected: React.CSSProperties['color'];
//     };
//     infoPalette: {
//       main: React.CSSProperties['color'];
//       auxiliary: React.CSSProperties['color'];
//       mainBackground: React.CSSProperties['color'];
//       auxiliaryBackground: React.CSSProperties['color'];
//     };
//     infoStateOverlay: {
//       hovered: React.CSSProperties['color'];
//       focused: React.CSSProperties['color'];
//       focusedRipple: React.CSSProperties['color'];
//       selected: React.CSSProperties['color'];
//     };
//     other: {
//       divider: React.CSSProperties['color'];
//       mainBorder: React.CSSProperties['color'];
//       auxiliaryBorder: React.CSSProperties['color'];
//       ratingActive: React.CSSProperties['color'];
//       backdropOverlay?: React.CSSProperties['color'];
//     };
//   }
// }

export const LightColorPalette: unknown = {
  contentPalette: contentPalette.dark,
  primaryPalette: primaryPalette.dark,
  primaryStateOverlay: primaryStateOverlay.dark,
  secondaryPalette: secondaryPalette.dark,
  secondaryStateOverlay: secondaryStateOverlay.dark,
  green: greenPalette.dark,
  gold: goldPalette.dark,
  backgroundPalette: backgroundPalette.dark,
  errorPalette: errorPalette.dark,
  errorStateOverlay: errorStateOverlay.dark,
  warningPalette: warningPalette.dark,
  warningStateOverlay: warningStateOverlay.dark,
  successPalette: successPalette.dark,
  successStateOverlay: successStateOverlay.dark,
  infoPalette: infoPalette.dark,
  infoStateOverlay: infoStateOverlay.dark,
  other: otherPalette.dark,
  focusPalette: focusPalette.light,
};

export const DarkColorPalette: unknown = {
  contentPalette: contentPalette.dark,
  primaryPalette: primaryPalette.dark,
  primaryStateOverlay: primaryStateOverlay.dark,
  secondaryPalette: secondaryPalette.dark,
  secondaryStateOverlay: secondaryStateOverlay.dark,
  green: greenPalette.dark,
  gold: goldPalette.dark,
  backgroundPalette: backgroundPalette.dark,
  errorPalette: errorPalette.dark,
  errorStateOverlay: errorStateOverlay.dark,
  warningPalette: warningPalette.dark,
  warningStateOverlay: warningStateOverlay.dark,
  successPalette: successPalette.dark,
  successStateOverlay: successStateOverlay.dark,
  infoPalette: infoPalette.dark,
  infoStateOverlay: infoStateOverlay.dark,
  other: otherPalette.dark,
  focusPalette: focusPalette.dark,
};

export const colors = {
  brandBlue,
  brandViolet,
  brandGreen,
  brandGold,
  error,
  warning,
  success,
  info,
  gray,
  white,
  black,
  contentPalette,
  primaryPalette,
  primaryStateOverlay,
  secondaryPalette,
  secondaryStateOverlay,
  greenPalette,
  goldPalette,
  backgroundPalette,
  errorPalette,
  errorStateOverlay,
  successPalette,
  successStateOverlay,
  warningPalette,
  warningStateOverlay,
  infoPalette,
  infoStateOverlay,
  otherPalette,
  button,
  navigationButton,
  focusPalette,
};
