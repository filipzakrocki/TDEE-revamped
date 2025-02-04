import { extendTheme } from '@chakra-ui/react';

import '@fontsource/raleway/400.css';
import '@fontsource/raleway/700.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';

const theme = extendTheme({
  fonts: {
    heading: `'Raleway', sans-serif`,
    body: `'Lato', sans-serif`,
  },
});

export default theme;
