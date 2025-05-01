import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme, Box, Flex, Container, useColorModeValue } from '@chakra-ui/react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Auth } from './pages/Auth';
import { mockAuth } from './services/mockFirebase';
import { useDisclosure } from '@chakra-ui/react';
import { useAppInit } from './hooks/useAppInit';
import { useState } from 'react';

const theme = extendTheme({
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
      defaultProps: {
        colorScheme: 'primary',
      },
      variants: {
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
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.900',
        fontFamily: 'system-ui, sans-serif',
      },
    },
  },
});

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!mockAuth.currentUser) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

function App() {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useAppInit();

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box bg={bg} minH="100vh">
          {/* Header */}
          <Header onToggle={onOpen} />
          
          <Box maxW="container.xl" mx="auto" p={4}>
            <Routes>
              <Route path="/auth/:mode" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Flex>
                      {/* Sidebar */}
                      <Box
                        as="nav"
                        pos="fixed"
                        top="0"
                        left="0"
                        zIndex={2}
                        h="full"
                        w="full"
                        maxW={{ base: isOpen ? 'full' : '0', md: isSidebarCollapsed ? '64px' : '250px' }}
                        bg="white"
                        boxShadow="md"
                        display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
                        transition="all 0.3s ease-in-out"
                        transform={{ base: isOpen ? 'translateX(0)' : 'translateX(-100%)', md: 'translateX(0)' }}
                      >
                        <Sidebar 
                          isOpen={isOpen} 
                          onClose={onClose} 
                          isCollapsed={isSidebarCollapsed} 
                          onToggleCollapse={toggleSidebarCollapse} 
                        />
                      </Box>
                      <Box flex={1} ml={{ base: 0, md: isSidebarCollapsed ? '64px' : '250px' }}>
                        <Routes>
                          <Route index element={<Home />} />
                          <Route path="products" element={<Products />} />
                          <Route path="orders" element={<Orders />} />
                        </Routes>
                      </Box>
                    </Flex>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
