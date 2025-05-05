import { Box, Container } from '@chakra-ui/react';
import SideBarControl from '../ui/SideBarComponents/SideBarControl';
import SideBarActions from '../ui/SideBarComponents/SideBarActons';

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
      top="4.2rem"
      left="0"
      zIndex={2}
      h="full"
      w="full"
      maxW={isCollapsed ? '68px' : '250px'}
      bg="white"
      boxShadow="md"
      display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
      transition="all 0.3s ease-in-out"
      transform={{ base: isOpen ? 'translateX(0)' : 'translateX(-100%)', md: 'translateX(0)' }}
    >
      <Container maxW="container.xl">
        <Box p="4" h="full">
          <SideBarControl isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />

          <SideBarActions onClose={onClose} isCollapsed={isCollapsed} />
        </Box>
      </Container>
    </Box>
  );
};
