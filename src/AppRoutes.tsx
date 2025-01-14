import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Flex } from '@chakra-ui/react';
import Auth from './views/Auth';
import Calculator from './views/Calculator';
import Header from './components/Header';
// import Footer from './components/Footer';
import MainFrame from './components/MainFrame';
import { config } from './config';

const PrivateRoute = ({ view, menu }: { view: JSX.Element, menu?: JSX.Element }): JSX.Element => {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" />;

  return (
    <>
      <Header />
      <Flex direction="column" minH="100vh">
        <Flex flex="1" width="100%">
          {/* View area */}
          <Box flex="8" p={config.padding} bg={config.backgroundLeft} color='black' overflow={'auto'}>
            <MainFrame>
              {view}
            </MainFrame>
          </Box>
          {/* Menu area */}
          {menu && <Box flex="2" minW={config.minRightPanelWidth} p={config.padding} bg={config.backgroundRight} color='black' overflow={'auto'}>
            <MainFrame bg={config.backgroundRight}>
              {menu}
            </MainFrame>
          </Box>}
        </Flex>
      </Flex>
    </>
  );
};

const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/calculator" element={<PrivateRoute view={<Calculator />} menu={<p>.</p>} />} />
      <Route path="/faq" element={<PrivateRoute view={<div>Faq</div>} />} />
    </Routes>
  );
};

export default AppRoutes;
