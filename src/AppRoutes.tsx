import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Box, Flex, Spinner, Center, useBreakpointValue } from '@chakra-ui/react';
import { useAuth } from './stores/auth/authStore';
import { config } from './config';
import Sidenav from './components/layout/Sidenav';
import HorizontalNav from './components/layout/HorizontalNav';
import Tile from './components/layout/Tile';

// Lazy load views for code splitting
const Auth = lazy(() => import('./views/auth/Auth'));
const Calculator = lazy(() => import('./views/calculator/Calculator'));
const Analysis = lazy(() => import('./views/analysis/Analysis'));
const Faq = lazy(() => import('./views/faq/Faq'));
const Setup = lazy(() => import('./views/setup/Setup'));
const Logout = lazy(() => import('./views/logout/Logout'));

const MOBILE_BREAKPOINT = config.mobileBreakpoint;

/** Layout shell: desktop = sidenav + main; mobile = main + bottom nav (never both). */
const PrivateLayout = (): JSX.Element => {
  const { isAuthenticated } = useAuth();
  const isMobile = useBreakpointValue({ base: true, [MOBILE_BREAKPOINT]: false }) ?? true;
  const [enableSidenavTransition, setEnableSidenavTransition] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setEnableSidenavTransition(true), 100);
    return () => clearTimeout(id);
  }, []);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <Flex 
      flex="1" 
      width="100%" 
      h="100dvh"
      maxH="100dvh"
      minH={0} 
      bg={config.backgroundColor}
      pb={{ base: 'max(env(safe-area-inset-bottom, 0px), 20px)', [MOBILE_BREAKPOINT]: 0 }}
    >
      <Box flex={1} minW={config.layoutGutter} aria-hidden display={{ base: 'none', [MOBILE_BREAKPOINT]: 'block' }} />
        <Flex w={config.mainPanelMaxWidth} maxW="100%" flexShrink={1} minW={0} h="100%" minH={0}>
          <Box
            flexShrink={0}
            h="100%"
            overflow="hidden"
            w={isMobile ? 0 : config.sidenavWidth}
            transition={enableSidenavTransition ? 'width 0.3s ease' : 'none'}
            sx={{ minWidth: isMobile ? 0 : undefined }}
          >
            <Box w={config.sidenavWidth} h="100%" color={config.black}>
              <Tile bg={config.backgroundColor} height="100%">
                <Sidenav />
              </Tile>
            </Box>
          </Box>
          <Flex
            flex={1}
            minW={0}
            h="100%"
            pt={{ base: 2, [MOBILE_BREAKPOINT]: config.padding }}
            pb={{ base: 0, [MOBILE_BREAKPOINT]: config.padding }}
            px={{ base: config.layoutGutter, [MOBILE_BREAKPOINT]: 0 }}
            color={config.black}
            flexDirection="column"
            minH={0}
            transition="flex 0.3s ease"
          >
            <Box flex={1} minH={0} overflow="hidden" overflowX="hidden">
              <Tile bg={config.backgroundNav} height="100%">
                <Suspense fallback={<MainPanelFallback />}>
                  <Outlet />
                </Suspense>
              </Tile>
            </Box>
            {isMobile && (
              <Box flexShrink={0} mt={2}>
                <HorizontalNav />
              </Box>
            )}
          </Flex>
        </Flex>
      <Box flex={1} minW={config.layoutGutter} aria-hidden display={{ base: 'none', [MOBILE_BREAKPOINT]: 'block' }} />
    </Flex>
  );
};

const LoadingSpinner = () => (
  <Center h="100vh">
    <Spinner size="xl" color={config.test5} thickness="4px" />
  </Center>
);

const MainPanelFallback = () => (
  <Center h="100%" minH="200px">
    <Spinner size="lg" color={config.test5} thickness="3px" />
  </Center>
);

const AppRoutes = (): JSX.Element => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/logout" element={<Logout />} />
        <Route element={<PrivateLayout />}>
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/faq" element={<Faq />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
