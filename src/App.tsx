import { Provider } from 'react-redux';
import { BrowserRouter as Router} from 'react-router-dom';
import { ChakraProvider, Container } from '@chakra-ui/react'
import store from './app/store';
import AppRoutes from './AppRoutes';

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <Router>
          <Container bg='gray.50' sx={{minHeight: '100vh'}}>
            <AppRoutes />
          </Container>
        </Router>
      </ChakraProvider>
    </Provider>
  );
}

export default App;