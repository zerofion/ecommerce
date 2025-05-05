import { Box, Heading, Text, VStack, HStack, Button, Icon, Container } from '@chakra-ui/react';
import { FaShoppingCart, FaBox, FaChartLine } from 'react-icons/fa';

export const VendorHome = () => {
  return (
    <Container maxW="container.xl" mt={16}>
      <Box textAlign="center" mb={12}>
        <Heading as="h1" size="2xl" mb={4}>
          Welcome to Neighbour Stores
        </Heading>
        <Text fontSize="xl" color="gray.600">
          Manage your product orders and inventory efficiently
        </Text>
      </Box>

      <VStack spacing={8}>
        <HStack spacing={6}>
          <Button
            as="a"
            href="/products"
            leftIcon={<Icon as={FaBox} />}
            size="lg"
            colorScheme="primary"
            flex="1"
          >
            Products
          </Button>
          <Button
            as="a"
            href="/orders"
            leftIcon={<Icon as={FaShoppingCart} />}
            size="lg"
            colorScheme="primary"
            flex="1"
          >
            Orders
          </Button>
        </HStack>
        <Button
          leftIcon={<Icon as={FaChartLine} />}
          size="lg"
          colorScheme="primary"
          w="full"
        >
          View Analytics
        </Button>
      </VStack>
    </Container>
  );
};
