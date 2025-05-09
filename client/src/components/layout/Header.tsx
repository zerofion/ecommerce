import { Box, Flex, Heading, Container, Link, Button, useToast } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthHook';
import { API_URL, logout } from '../../services/auth';
import FormSelectInputField from '../ui/FormComponents/FormSelectInputField';
import { useEffect, useState } from 'react';
import { ClientRole } from '../../context/types';
import axios from 'axios';
import { toDisplayCase } from '../../utils/stringUtils';

export const Header = () => {
  const { authSession, setAuthSession } = useAuth();
  const toast = useToast();
  const [clientRoles, setClientRoles] = useState<ClientRole[]>([]);

  const handleLogout = async () => {
    try {
      await logout();
      setAuthSession(null);
      toast({
        title: 'Success',
        description: 'Logged out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  useEffect(() => {
    const fetchClientRoles = async () => {
      try {
        const roles = await axios.get(`${API_URL}/api/auth/list-roles`, {
          headers: {
            'Authorization': `Bearer ${authSession?.token}`
          }
        });
        setClientRoles(roles.data);
      } catch (error: any) {
        console.error('Error fetching client roles:', error);
      }
    };
    if (authSession?.token) {
      fetchClientRoles();
    }
  }, [authSession?.token]);

  const switchRole = async (role: ClientRole) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/switch-role`, {
        requestedRole: role
      }, {
        headers: {
          'Authorization': `Bearer ${authSession?.token}`
        }
      });
      localStorage.setItem('auth', JSON.stringify({
        user: response.data.user,
        token: authSession!.token
      }));
      setAuthSession({
        user: response.data.user,
        token: authSession!.token
      });
      toast({
        title: 'Success',
        description: 'Role switched successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to switch role',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={10}
      bg="white"
      boxShadow="sm"
      borderBottom="1px"
      borderColor="gray.100"
      px={4}
      py={2}
      w="full"
    >
      <Container maxW="container.xl">
        <Flex
          h={{ base: 'auto', md: '16' }}
          alignItems="center"
          justifyContent="space-between"
          wrap="wrap"
          gap={{ base: 4, md: 0 }}
        >
          <Heading size="lg" mb={4}>
            <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
              Neighbour Stores
            </Link>
          </Heading>
          {authSession?.token && (
            <Box
              display={{ base: 'flex', md: 'none' }}
              flexDirection="column"
              alignItems="center"
              w="full"
              p={4}
              bg="white"
              boxShadow="sm"
              borderRadius="md"
              mb={4}
            >
              <Box w="full" mb={4}>
                <Box fontSize="lg" fontWeight="bold" color="blue.600" textAlign="center" mb={2}>
                  Welcome back
                </Box>
                {authSession?.user?.name &&
                  <Box fontSize="md" color="gray.600" textAlign="center">
                    {authSession?.user?.name}
                  </Box>
                }
              </Box>
              <Box w="full" mb={4}>
                <FormSelectInputField
                  value={toDisplayCase(authSession!.user!.role)}
                  onChange={(e) => {
                    switchRole(e.target.value as ClientRole);
                  }}
                  options={[{ label: toDisplayCase(authSession!.user!.role), value: authSession!.user!.role }].concat(clientRoles.filter(role => role !== authSession!.user!.role).map(role => ({
                    label: toDisplayCase(role),
                    value: role
                  })))}
                  isRequired={true}
                />
              </Box>
              <Button
                w="full"
                colorScheme="red"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          )}
          {authSession?.token && (
            <Flex
              display={{ base: 'none', md: 'flex' }}
              alignItems="center"
              gap={4}
              h="16"
            >
              {authSession?.user?.name &&
                <Box>
                  Hello {authSession?.user?.name}
                </Box>
              }
              <Box w="200px">
                <FormSelectInputField
                  value={toDisplayCase(authSession!.user!.role)}
                  onChange={(e) => {
                    switchRole(e.target.value as ClientRole);
                  }}
                  options={[{ label: toDisplayCase(authSession!.user!.role), value: authSession!.user!.role }].concat(clientRoles.filter(role => role !== authSession!.user!.role).map(role => ({
                    label: toDisplayCase(role),
                    value: role
                  })))}
                  isRequired={true}
                />
              </Box>
              <Button
                colorScheme="red"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Flex>
          )}
        </Flex>
      </Container>
    </Box>
  );
};
