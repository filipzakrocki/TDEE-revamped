import React from 'react';
import { Provider } from 'react-redux';
import store from './app/store';
import Auth from './components/Auth';

import { ChakraProvider } from '@chakra-ui/react'

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <Auth />
      </ChakraProvider>
    </Provider>
  );
}

export default App;