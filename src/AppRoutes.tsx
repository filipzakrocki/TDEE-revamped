import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { config } from './config';

// Views
import Auth from './views/auth/Auth';
import Calculator from './views/calculator/Calculator';
import Analysis from './views/analysis/Analysis';
import Faq from './views/faq/Faq';
import Setup from './views/setup/Setup';
import Logout from './views/logout/Logout';

// Components
import { Box, Flex } from '@chakra-ui/react';
import Sidenav from './components/layout/Sidenav'
import MainFrame from './components/layout/MainFrame';


const PrivateRoute = ({ view, menu }: { view: JSX.Element, menu?: JSX.Element }): JSX.Element => {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" />;

  return (
        <Flex flex="1" width="100%" h={'100vh'} bg={config.backgroundColor}>
          {/* View area */}
          <Box w={config.sidenavWidth} p={config.padding} color={config.black}>
            <MainFrame>
              <Sidenav />
            </MainFrame>
          </Box>
          {/* View area */}
          <Box flex={config.leftPanelWidth} p={config.padding} bg={config.backgroundLeft} color={config.black} overflow={'auto'}>
            <MainFrame>
              {view}
            </MainFrame>
          </Box>
          {/* Menu area */}
          {menu && <Box flex={config.rightPanelWidth} minW={config.minRightPanelWidth} p={config.padding} bg={config.backgroundRight} color={config.black} overflow={'auto'}>
            <MainFrame bg={config.backgroundRight}>
              {menu}
            </MainFrame>
          </Box>}
        </Flex>
  );
};

const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/calculator" element={<PrivateRoute view={<Calculator />} menu={<p>.</p>} />} />
      <Route path="/setup" element={<PrivateRoute view={<Setup />} menu={<p>.</p>} />} />
      <Route path="/analysis" element={<PrivateRoute view={<Analysis/>} />} />
      <Route path="/faq" element={<PrivateRoute view={<Faq/>} />} />
      <Route path="/logout" element={<PrivateRoute view={<Logout/>} />} />
    </Routes>
  );
};

export default AppRoutes;
