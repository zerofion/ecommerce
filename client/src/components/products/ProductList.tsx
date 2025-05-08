import { Box, Heading, Text, HStack, Button, Grid, GridItem, Select, Image, Spinner } from '@chakra-ui/react';
import { FaShoppingCart } from 'react-icons/fa';
import { Product } from '../../types';
import { useToast } from '@chakra-ui/react';
import { useShoppingSession } from '../../contexts/ShoppingSession';



export const ProductList: React.FC = () => {
  const { state, actions } = useShoppingSession();
  const toast = useToast();

  const handleAddToCart = (product: Product) => {
    actions.addToCart(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} added to cart`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const filteredProducts = state.selectedCategory === 'all'
    ? state.products
    : state.products.filter(product => product.category === state.selectedCategory);

  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>Products</Heading>
      <HStack justify="space-between" mb={4}>
        <Select
          value={state.selectedCategory}
          onChange={(e) => actions.setSelectedCategory(e.target.value)}
          placeholder="Filter by category"
        >
          <option value="all">All</option>
          <option value="grocery">Grocery</option>
          <option value="dairy">Dairy</option>
          <option value="beverages">Beverages</option>
        </Select>
      </HStack>
      {state.loading ? (
        <Spinner size="xl" />
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
          {filteredProducts.map((product) => (
            <GridItem key={product.id}>
              <Box p={4} borderWidth={1} borderRadius="lg">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  mb={3}
                  boxSize="200px"
                  objectFit="contain"
                />
                <Heading size="sm" mb={1}>{product.name}</Heading>
                <Text color="gray.600" mb={2}>{product.description}</Text>
                <HStack justify="space-between" align="center">
                  <Text fontWeight="bold">₹{product.price}</Text>
                  <Button
                    leftIcon={<FaShoppingCart />}
                    colorScheme="green"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </HStack>
              </Box>
            </GridItem>
          ))}
        </Grid>
      )}
    </Box>
  );
};
