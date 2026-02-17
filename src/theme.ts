import { extendTheme } from '@chakra-ui/react';
import { config } from './config';

import '@fontsource/raleway/400.css';
import '@fontsource/raleway/700.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';

const theme = extendTheme({
  styles: {
    global: {
      'div': {
        borderRadius: config.borderRadius
      }
    }
  },
  fonts: {
    heading: config.headingFont,
    body: config.bodyFont,
  },
  components: {
    Heading: {
      sizes: {
        xl: { fontSize: "6xl", fontWeight: "bold", my: 20 }, 
        lg: { fontSize: "4xl", fontWeight: "semibold", my: 10 }, 
        md: { fontSize: "2xl", fontWeight: "medium" },
        sm: { fontSize: "xl", fontWeight: "normal" },
        xs: { fontSize: "lg", fontWeight: "light" },
      },
      defaultProps: {
        size: 'lg'
      }
    }
  }
});

export default theme;
