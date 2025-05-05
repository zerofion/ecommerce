import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme, Box, Flex, useColorModeValue, useDisclosure, Spinner, Text } from '@chakra-ui/react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import Auth from './pages/Auth';
import { useAuth } from './hooks/useAuthHook';
import { ClientRole } from './context/types';
import { CustomerHome } from './pages/CustomerHome';
import { VendorHome } from './pages/VendorHome';

const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        bg: 'gray.50',
      },
    },
  },
  colors: {
    brand: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
    primary: {
      50: '#f0f9ff',
      100: '#e3f2fd',
      200: '#b3e5fc',
      300: '#81d4fa',
      400: '#4fc3f7',
      500: '#29b6f6',
      600: '#039be5',
      700: '#0288d1',
      800: '#0277bd',
      900: '#01579b',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        },
        ghost: {
          bg: 'transparent',
          color: 'primary.500',
          _hover: {
            bg: 'primary.50',
          },
        },
      },
    },
  },
});

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
      <Box flex="1" ml={{ base: 0, md: "68px" }} p={4}>
        {children}
      </Box>
    </Flex>
  );
};

const App: React.FC = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const { authSession, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        {/* <Spinner
          thickness="10px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        /> */}
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Router>

        <Box bg={bg} minH="100vh">
          {authSession && <Header />}
          <Box maxW="container.xl" mx="auto"
            bgGradient="linear(to-b, blue.50, white)"
            p={4}>
            <Routes>
              <Route path="/auth/:mode" element={<Auth />} />
              <Route
                path="/"
                element={
                  authSession ? (
                    <Layout>
                      {authSession!.user!.role === ClientRole.CUSTOMER ? <CustomerHome /> : <VendorHome />}
                    </Layout>
                  ) : (
                    <Navigate to="/auth/login" replace />
                  )
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Products />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Orders />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </Box>
        </Box>

      </Router>
    </ChakraProvider>
  );
};

export default App;
