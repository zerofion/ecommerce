import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react';
import { ProductList } from './products/ProductList';
import { Cart } from './cart/Cart';
import { useShoppingSession } from '../contexts/ShoppingSession';

export const ShoppingWindow: React.FC = () => {
  const { state, actions } = useShoppingSession();

  return (
    <Box
      w="full"
      p={{ base: 2, md: 8 }}
      gap={{ base: 4, md: 8 }}
      display="flex"
      flexDirection="column"
      mt={{ base: '64px', md: '80px' }}
      pt={{ base: '64px', md: '80px' }}
    >
      <Box 
        textAlign="center" 
        mb={{ base: 4, md: 8 }}
        px={{ base: 2, md: 0 }}
      >
        <Heading
          as="h1"
          size={{ base: "lg", md: "2xl" }}
          mb={2}
          color="blue.600"
          fontWeight="extrabold"
        >
          Welcome to Neighbour Stores
        </Heading>
        <Text
          fontSize={{ base: "sm", md: "xl" }}
          color="gray.600"
          maxW={{ base: "90vw", md: "container.md" }}
          mx="auto"
        >
          Order from your nearest local store
        </Text>
      </Box>

      <Flex
        justify="space-between"
        align="center"
        mb={{ base: 4, md: 8 }}
        wrap="wrap"
        gap={2}
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
