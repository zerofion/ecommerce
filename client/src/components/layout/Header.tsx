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
  const [role, setRole] = useState<ClientRole>(ClientRole.CUSTOMER);
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
    fetchClientRoles();
  }, []);

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
      bg="white"
      boxShadow="sm"
      borderBottom="1px"
      borderColor="gray.100"
      px={4}
      pos="fixed"
      w="full"
      top={0}
      zIndex={1}
    >
      <Container maxW="container.xl"  >
        <Flex h={16} alignItems="center" justifyContent="space-between" >
          <Heading size="lg" mb={4}>
            <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
              Neighbour Stores
            </Link>
          </Heading>
          {authSession?.token && (
            <Flex alignItems="center">

              {authSession?.user?.name &&
                <Box m={4}>
                  Hello {authSession?.user?.name}
                </Box>}

              <Box>
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
                m={4}
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
