import { Box, Flex, Heading, IconButton, Container, Link } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

interface HeaderProps {
  onToggle: () => void;
}

export const Header = ({ onToggle }: HeaderProps) => {
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
        </Flex>
      </Container>
    </Box>
  );
};
