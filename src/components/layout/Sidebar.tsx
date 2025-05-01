import { Box, Button, Flex, Heading, Container, IconButton } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaHome, FaBoxes, FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) => {
  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex={2}
      h="full"
      w="full"
      maxW={isCollapsed ? '64px' : '250px'}
      bg="white"
      boxShadow="md"
      display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
      transition="all 0.3s ease-in-out"
      transform={{ base: isOpen ? 'translateX(0)' : 'translateX(-100%)', md: 'translateX(0)' }}
    >
      <Container maxW="container.xl">
        <Box p="4" h="full">
          <Flex alignItems="center" justifyContent="space-between" mb="4">
            <Heading size="md" display={{ base: 'block', md: isCollapsed ? 'none' : 'block' }}>
              Menu
            </Heading>
            <IconButton
              aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
              icon={isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
              onClick={onToggleCollapse}
              variant="ghost"
              size="sm"
            />
          </Flex>
          
          <Flex direction="column" gap="3" h="calc(100% - 64px)" overflowY="auto">
            <Button
              as={RouterLink}
              to="/"
              variant="ghost"
              onClick={onClose}
              leftIcon={<FaHome />}
              justifyContent="center"
              w="full"
              _hover={{
                bg: 'primary.50',
                color: 'primary.700',
              }}
              display="flex"
            >
              <Box display={{ base: 'none', md: isCollapsed ? 'none' : 'block' }}>
                Home
              </Box>
            </Button>
            <Button
              as={RouterLink}
              to="/products"
              variant="ghost"
              onClick={onClose}
              leftIcon={<FaBoxes />}
              justifyContent="center"
              w="full"
              _hover={{
                bg: 'primary.50',
                color: 'primary.700',
              }}
              display="flex"
            >
              <Box display={{ base: 'none', md: isCollapsed ? 'none' : 'block' }}>
                Products
              </Box>
            </Button>
            <Button
              as={RouterLink}
              to="/orders"
              variant="ghost"
              onClick={onClose}
              leftIcon={<FaShoppingCart />}
              justifyContent="center"
              w="full"
              _hover={{
                bg: 'primary.50',
                color: 'primary.700',
              }}
              display="flex"
            >
              <Box display={{ base: 'none', md: isCollapsed ? 'none' : 'block' }}>
                Orders
              </Box>
            </Button>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};
