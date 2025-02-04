import { Provider } from 'react-redux';
import { BrowserRouter as Router} from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme';
import store from './app/store';
import AppRoutes from './AppRoutes';

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <Router>
          <AppRoutes />
        </Router>
      </ChakraProvider>
    </Provider>
  );
}

export default App;