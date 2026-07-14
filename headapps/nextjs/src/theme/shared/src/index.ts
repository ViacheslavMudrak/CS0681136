import { createTheme } from '@mui/material/styles';
import { breakpoints } from './lib/breakpoints';
import { colors } from './lib/colors';
import { typography } from './lib/typography';

const theme = createTheme({
  breakpoints,
  palette: colors,
  typography,
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: '"Whitney-Semibold", Arial, sans-serif',
          fontSize: '14px',
          letterSpacing: '0.5px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
          borderRadius: '12px',
        },

        filledSuccess: {
          backgroundColor: '#E9FBE7',
          color: '#0C5C34',

          '& .MuiAlert-icon': {
            color: colors.brandGreen[800],
          },

          '& .MuiAlert-action': {
            color: colors.white[100],
          },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontSize: '16px',
          letterSpacing: '1px',
        },
        li: {
          fontSize: '1rem',
          letterSpacing: '1px',
          fontFamily: '"Whitney-Book", "Arial", "Helvetica Neue", Helvetica, sans-serif',
          color: colors.gray[600],
          p: {
            fontSize: '1rem',
          },
          a: {
            fontSize: '1rem',
            fontFamily: '"Whitney-Semibold", "Arial", "Helvetica Neue", Helvetica, sans-serif',
            textDecoration: 'underline',
            '&:hover': {
              textDecoration: 'none',
              color: colors.brandBlue[800],
            },
          },
        },
        separator: {
          margin: '0 8px',
          color: colors.gray[600],
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'plainText' },
          style: {
            fontSize: '12px',
            color: colors.brandBlue[500],
            backgroundColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '1.25px',
            borderRadius: '0',
            width: 'fit-content',
            margin: '20px auto 0',
            '&:hover': {
              backgroundColor: 'transparent',
              color: colors.brandBlue[800],
            },
            '&:active': {
              backgroundColor: 'transparent',
              color: colors.brandBlue[500],
              boxShadow: 'none',
              transition: 'none',
            },
            '&:focus': {
              backgroundColor: 'transparent',
              color: colors.brandBlue[500],
              outline: 'none',
              boxShadow: 'none',
              transition: 'none',
            },
            '&.Mui-disabled': {
              backgroundColor: 'transparent',
              color: colors.brandBlue[800],
            },
            '&:disabled': {
              backgroundColor: 'transparent',
              color: colors.brandBlue[800],
            },
          },
        },
        {
          props: { variant: 'noBorderOutline' },
          style: {
            backgroundColor: colors.white[100],
            color: colors.brandBlue[500],
            border: 'none',
            '&:hover': {
              color: colors.brandBlue[800],
              backgroundColor: colors.white[100],
              border: `none`,
            },
            '&:focus': {
              color: colors.brandBlue[500],
              backgroundColor: colors.white[100],
              border: 'none',
              outline: `2px dashed ${colors.white[100]}`,
              outlineOffset: '2px',
            },
            '&.Mui-disabled': {
              backgroundColor: 'transparent',
              color: 'rgba(0,0,0,0.38)',
              border: 'none',
            },
          },
        },
      ],
      styleOverrides: {
        outlined: {
          backgroundColor: 'transparent',
          color: colors.brandBlue[500],
          border: '2px solid',
          '&:hover': {
            color: colors.brandBlue[800],
            backgroundColor: colors.white[100],
            border: `2px solid ${colors.brandBlue[800]}`,
          },
          '&:focus': {
            color: colors.brandBlue[500],
            backgroundColor: colors.white[100],
            border: `2px solid ${colors.brandBlue[500]}`,
            outline: `2px dashed ${colors.brandViolet[500]}`,
            outlineOffset: '2px',
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: 'rgba(0,0,0,0.38)',
            border: '2px solid rgba(0,0,0,0.38)',
          },
        },
        root: {
          fontSize: '16px',
          fontFamily: '"Whitney-Semibold", Times, sans-serif',
          borderRadius: '9999px',
          textTransform: 'uppercase',
          padding: '8px 24px',
          color: colors.white[100],
          backgroundColor: colors.brandBlue[500],
          letterSpacing: '1.25px',
          lineHeight: '24px',
          height: 'fit-content',
          '&:hover': {
            backgroundColor: colors.brandBlue[800],
          },
          '&:focus': {
            color: colors.white[100],
            backgroundColor: colors.brandBlue[500],
            outlineOffset: '2px',
            outline: `2px dashed ${colors.brandViolet[500]}`,
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(0,0,0,0.12)',
            color: 'rgba(0,0,0,0.38)',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: colors.brandBlue[901],
          borderRadius: '12px',
          border: '1px solid #A2CDFF80',
          boxShadow: 'none',
          margin: '12px 0',
          '&:before': { display: 'none' },
          '&:first-of-type': {
            borderRadius: '12px',
          },
          '&:last-of-type': {
            borderRadius: '12px',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          fontSize: '32px',
          fontFamily: '"Whitney-Book", Arial, sans-serif',
          color: colors.brandBlue[800],
          margin: '0',
          '& .MuiAccordionSummary-content': {
            margin: '0',
            flexDirection: 'column',
          },
          // Accordion expand icon only
          '& .MuiSvgIcon-root': {
            color: colors.brandBlue[800],
          },
        },
        content: {
          '& > :first-of-type': {
            fontFamily: '"Whitney-Book", Arial, sans-serif',
            fontSize: '16px',
            margin: '0',
            lineHeight: '24px',
            color: colors.black[60],
          },
          '&.Mui-expanded': {
            margin: '0 0',
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          fontFamily: '"Whitney-Book", Arial, sans-serif',
          fontSize: '18px',
          lineHeight: '28px',
          color: colors.black[87],
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: colors.brandBlue[800], // arrow icon color
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          maxWidth: '500px',
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          fontFamily: '"Whitney-Semibold", Arial, sans-serif',
          borderRadius: '9999px',
          color: colors.gray[800],

          '&:hover': {
            backgroundColor: colors.brandBlue[100],
          },
        },

        // Active page state
        text: {
          '&.Mui-selected': {
            backgroundColor: `${colors.brandBlue[500]} !important`,
            color: `${colors.white[100]} !important`,
            borderColor: `${colors.brandBlue[500]} !important`,

            '&:hover': {
              backgroundColor: `${colors.brandBlue[800]} !important`,
              borderColor: `${colors.brandBlue[800]} !important`,
            },
          },
        },
        previousNext: {
          border: 'none',
          '& .MuiSvgIcon-root': {
            color: colors.brandBlue[500], // default arrow color
          },
          '&:hover': {
            backgroundColor: 'transparent !important',
          },
          '&:hover .MuiSvgIcon-root': {
            color: colors.brandBlue[800], // hover color
          },
          '&.Mui-disabled .MuiSvgIcon-root': {
            color: colors.gray[400], // disabled color
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.brandBlue[500],
        },
      },
    },
  },
});

export default theme;
