import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, Flex, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from './stores/auth/authStore';
import { config } from './config';
import Sidenav from './components/layout/Sidenav'
import MainFrame from './components/layout/MainFrame';

// Lazy load views for code splitting
const Auth = lazy(() => import('./views/auth/Auth'));
const Calculator = lazy(() => import('./views/calculator/Calculator'));
const Analysis = lazy(() => import('./views/analysis/Analysis'));
const Faq = lazy(() => import('./views/faq/Faq'));
const Setup = lazy(() => import('./views/setup/Setup'));
const Logout = lazy(() => import('./views/logout/Logout'));


const PrivateRoute = ({ view, menu }: { view: JSX.Element, menu?: JSX.Element }): JSX.Element => {
  const { isAuthenticated } = useAuth();
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
          <Box flex={config.leftPanelWidth} p={config.padding}  color={config.black} >
            <MainFrame>
              {view}
            </MainFrame>
          </Box>
          {/* Menu area */}
          {menu && <Box flex={config.rightPanelWidth} minW={config.minRightPanelWidth} p={config.padding}  color={config.black}>
            <MainFrame >
              {menu}
            </MainFrame>
          </Box>}
        </Flex>
  );
};

const LoadingSpinner = () => (
  <Center h="100vh">
    <Spinner size="xl" color={config.test5} thickness="4px" />
  </Center>
);

const AppRoutes = (): JSX.Element => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/calculator" element={<PrivateRoute view={<Calculator />} menu={<p>.</p>} />} />
        <Route path="/setup" element={<PrivateRoute view={<Setup />} menu={<p>.</p>} />} />
        <Route path="/analysis" element={<PrivateRoute view={<Analysis/>} />} />
        <Route path="/faq" element={<PrivateRoute view={<Faq/>} />} />
        <Route path="/logout" element={<PrivateRoute view={<Logout/>} />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
