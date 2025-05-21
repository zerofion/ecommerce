import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box, Flex, useDisclosure, Spinner } from '@chakra-ui/react';
import { useAuth } from './hooks/useAuthHook';
import { theme } from './theme';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import Auth from './pages/Auth';
import { ClientRole } from './context/types';
import { CustomerHome } from './pages/CustomerHome';
import { VendorHome } from './pages/VendorHome';
import { CustomerOrders } from './pages/CustomerOrders';
import ErrorBoundary from './components/ErrorBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authSession, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Box>
    );
  }

  if (!authSession) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isOpen, onClose } = useDisclosure();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Flex>
      <Sidebar
        isOpen={isOpen}
        onClose={onClose}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <Box flex="1" ml={{ base: 0, md: "68px" }} p={4} w="100vw">
        {children}
      </Box>
    </Flex>
  );
};

const App: React.FC = () => {
  const { authSession } = useAuth()

  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary>
        <Box bg={theme.colors.gray[50]} minH="100vh" minW="100vw" pt={{ base: '180px', md: '0px' }}>
          {authSession?.token && <Header />}
          <Box mx="auto" bgGradient="linear(to-b, blue.50, white)" p={4} m={0} w="100vw" className='w-full' pt={{ base: '64px', md: '0px' }}>
            <Routes>
              <Route path="/auth/:mode" element={
                authSession?.token ? (
                  <Navigate to="/" replace />
                ) : (
                  <Auth />
                )
              } />
              <Route
                path="/"
                element={
                  authSession?.token ? (
                    <Layout>
                      {authSession!.user!.role === ClientRole.CUSTOMER || authSession!.user!.role === ClientRole.B2B_CUSTOMER ? <CustomerHome /> : <VendorHome />}
                    </Layout>
                  ) : (
                    <Navigate to="/auth/login" replace />
                  )
                }
              />
              {authSession?.user!.role === ClientRole.VENDOR ? <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Products />
                    </Layout>
                  </ProtectedRoute>
                }
              /> : <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Navigate to="/" replace />
                    </Layout>
                  </ProtectedRoute>
                }
              />}
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Layout>
                      {authSession?.user!.role === ClientRole.CUSTOMER || authSession?.user!.role === ClientRole.B2B_CUSTOMER ? <CustomerOrders /> : <Orders />}
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </Box>
        </Box>
      </ErrorBoundary>
    </ChakraProvider>)
};

export default App;
