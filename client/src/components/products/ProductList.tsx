import React, { useCallback } from 'react';
import { Box, Heading, Text, HStack, Button, Grid, GridItem, Select, Image, Spinner, useToast, Badge } from '@chakra-ui/react';
import { FaFilter, FaShoppingCart } from 'react-icons/fa';
import { categories, Product } from '../../types';
import { useShoppingSession } from '../../contexts/ShoppingSession';
import { toDisplayCase } from '../../utils/stringUtils';
import { useAuth } from '../../hooks/useAuthHook';
import { ClientRole } from '../../context/types';



export const ProductList: React.FC = () => {
  const { state, actions } = useShoppingSession();
  const { authSession } = useAuth();
  const toast = useToast();

  const handleAddToCart = useCallback((product: Product, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // Only show toast for new items
    if (!state.cartItems.some(item => item.product.id === product.id)) {
      toast({
        title: 'Added to cart',
        description: `${product.name} added to cart`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
    actions.addToCart(product);
  }, [actions, state.cartItems, toast]);

  const filteredProducts = state.selectedCategory === 'All' || state.selectedCategory === ''
    ? state.products
    : state.products.filter(product => product.category.toLowerCase() === state.selectedCategory.toLowerCase());

  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>Products</Heading>
      <HStack justify="space-between" mb={4}>
        <Select
          value={state.selectedCategory || 'Filter by category'}
          onChange={(e) => actions.setSelectedCategory(e.target.value)}
          placeholder="Filter by category"
          icon={<FaFilter />}
        >
          {categories.map((category) => {
            const value = category === '' ? 'All' : toDisplayCase(category);
            return (
              <option key={value} value={value}>
                {value}
              </option>
            );
          })}
        </Select>
      </HStack>
      {state.loading ? (
        <Spinner size="xl" />
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
          {filteredProducts.map((product) => (
            <GridItem key={product.id}>
              <Box p={4} borderWidth={1} borderRadius="lg">
                <Box position="relative">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    boxSize="200px"
                    objectFit="contain"
                    position="relative"
                  />
                  <Box
                    position="absolute"
                    top="10px"
                    right="10px"
                    zIndex="1"
                  >
                    <Badge
                      variant="solid"
                      colorScheme="blue"
                      borderRadius="full"
                      px="2"
                      py="1"
                      fontSize="xs"
                      display="flex"
                      alignItems="center"
                      flexDirection="column"
                    >
                      <FaFilter size={12} />
                      <Box ml="1">{product.category}</Box>
                    </Badge>
                  </Box>
                </Box>
                <Heading size="sm" mb={1}>{product.name}</Heading>
                <Text color="gray.600" mb={2}>{product.description}</Text>
                <HStack justify="space-between" align="center">
                  <Text fontWeight="bold">₹{authSession?.user?.role === ClientRole.CUSTOMER ? product.price : product.b2bPricePerQuantity}</Text>
                  <Button
                    leftIcon={<FaShoppingCart />}
                    colorScheme="green"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Only call handleAddToCart once
                      handleAddToCart(product, e);
                    }}
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
