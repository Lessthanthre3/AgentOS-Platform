import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    primary: '#00FF41',
    secondary: '#003B00',
    tertiary: '#0D0208',
    error: '#FF0000',
    success: '#00FF41',
    warning: '#FFA500',
    background: {
      primary: '#000000',
      secondary: '#0A0A0A',
      tertiary: '#141414'
    },
    text: {
      primary: '#00FF41',
      secondary: '#00BB41',
      muted: '#006400'
    }
  }
};

const styles = {
  global: {
    'html, body': {
      backgroundColor: 'brand.background.primary',
      color: 'brand.text.primary',
      fontFamily: 'mono',
    },
    '::-webkit-scrollbar': {
      width: '6px',
    },
    '::-webkit-scrollbar-track': {
      background: 'brand.background.secondary',
    },
    '::-webkit-scrollbar-thumb': {
      background: 'brand.text.muted',
      borderRadius: '3px',
    },
  }
};

const components = {
  Window: {
    baseStyle: {
      container: {
        bg: 'brand.background.secondary',
        borderColor: 'brand.primary',
        borderWidth: '1px',
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
        overflow: 'hidden',
      },
      header: {
        bg: 'brand.background.tertiary',
        borderBottom: '1px solid',
        borderColor: 'brand.primary',
        p: 2,
      },
      body: {
        p: 4,
      }
    }
  },
  Button: {
    variants: {
      matrix: {
        bg: 'transparent',
        color: 'brand.primary',
        border: '1px solid',
        borderColor: 'brand.primary',
        _hover: {
          bg: 'brand.secondary',
          boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
          transform: 'scale(1.02)',
        },
        _active: {
          bg: 'brand.secondary',
          transform: 'scale(0.98)',
        },
        transition: 'all 0.2s',
      },
      ghost: {
        color: 'brand.text.primary',
        _hover: {
          bg: 'rgba(0, 255, 65, 0.1)',
        },
      },
    },
    defaultProps: {
      variant: 'matrix',
    },
  },
  Input: {
    variants: {
      matrix: {
        field: {
          bg: 'brand.background.secondary',
          border: '1px solid',
          borderColor: 'brand.primary',
          color: 'brand.text.primary',
          _focus: {
            borderColor: 'brand.text.primary',
            boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
          },
          _hover: {
            borderColor: 'brand.text.primary',
          },
          _placeholder: {
            color: 'brand.text.muted',
          },
        },
      },
    },
    defaultProps: {
      variant: 'matrix',
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'brand.background.secondary',
        borderColor: 'brand.primary',
        borderWidth: '1px',
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'all 0.2s',
        _hover: {
          boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)',
        },
      },
      header: {
        bg: 'brand.background.tertiary',
        borderBottom: '1px solid',
        borderColor: 'brand.primary',
        p: 4,
      },
      body: {
        p: 4,
      },
    },
  },
  Badge: {
    variants: {
      matrix: {
        bg: 'brand.secondary',
        color: 'brand.primary',
        borderRadius: '2px',
        px: 2,
        py: 1,
        fontSize: 'xs',
        textTransform: 'uppercase',
      },
    },
    defaultProps: {
      variant: 'matrix',
    },
  },
  Progress: {
    baseStyle: {
      track: {
        bg: 'brand.background.tertiary',
      },
      filledTrack: {
        bg: 'brand.primary',
        transition: 'all 0.4s',
      },
    },
  },
};

const fonts = {
  body: 'Courier New, monospace',
  heading: 'Courier New, monospace',
  mono: 'Courier New, monospace',
};

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  colors,
  styles,
  components,
  fonts,
  config,
});

export default theme;
