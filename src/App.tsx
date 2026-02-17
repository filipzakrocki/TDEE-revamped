import { BrowserRouter as Router} from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme';
import AppRoutes from './AppRoutes';

function App(): JSX.Element {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AppRoutes />
      </Router>
    </ChakraProvider>
  );
}

export default App;