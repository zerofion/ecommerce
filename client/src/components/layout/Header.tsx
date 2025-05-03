import { Box, Flex, Heading, IconButton, Container, Link, Button, useToast } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthHook';
import { logout } from '../../services/auth';

interface HeaderProps {
  onToggle: () => void;
}

export const Header = ({ onToggle }: HeaderProps) => {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      toast({
        title: 'Success',
        description: 'Logged out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={<HamburgerIcon />}
            aria-label="Open Menu"
            display={{ base: 'flex', md: 'none' }}
            onClick={onToggle}
            variant="ghost"
          />
          <Heading size="lg" mb={4}>
            <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
              Product Order App
            </Link>
          </Heading>
          {user && (
            <Button
              colorScheme="red"
              size="sm"
              ml={4}
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </Flex>
      </Container>
    </Box>
  );
};
