import { Box, Flex, Heading, Text, Button, Select } from '@chakra-ui/react';
import { FaShoppingCart } from 'react-icons/fa';
import { ProductList } from './products/ProductList';
import { Cart } from './cart/Cart';
import { useShoppingSession } from '../contexts/ShoppingSession';

export const ShoppingWindow: React.FC = () => {
  const { state, actions } = useShoppingSession();

  return (
    <Box
      w="full"
      ml={{ base: 0, md: "24" }}
      p={{ base: 4, md: 8 }}
      gap={8}
      display="flex"
      flexDirection="column"
    >
      <Box textAlign="center" mb={8}>
        <Heading
          as="h1"
          size="2xl"
          mb={4}
          color="blue.600"
          fontWeight="extrabold"
        >
          Welcome to Neighbour Stores
        </Heading>
        <Text
          fontSize="xl"
          color="gray.600"
        >
          Order from your nearest local store
        </Text>
      </Box>

      <Flex
        justify="space-between"
        align="center"
        mb={8}
      >
        <Button
          colorScheme={state.showCart ? "red" : "blue"}
          onClick={() => actions.setShowCart(!state.showCart)}
          size="lg"
          _hover={{ transform: 'scale(1.02)' }}
          transition="all 0.2s"
        >
          {state.showCart ? 'Hide Cart' : 'View Cart'}
        </Button>
      </Flex>

      <Box
        w="full"
        maxW="container.xl"
        mx="auto"
      >
        <Box
          display={{ base: 'block', md: 'none' }}
          mb={4}
        >
          <ProductList />
        </Box>

        <Flex
          display={{ base: 'none', md: 'flex' }}
          gap={8}
          justifyContent="space-between"
        >
          <Box flex="1">
            <ProductList />
          </Box>
          <Box
            w="300px"
            display={state.showCart ? 'block' : 'none'}
            boxShadow="lg"
            borderRadius="lg"
            p={6}
            bg="white"
            position="fixed"
            right="24"
            top="16"
            zIndex={10}
            maxH="calc(100vh - 32px)"
            overflowY="auto"
          >
            <Cart />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};
