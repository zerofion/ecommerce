import React from 'react';
import { Box, VStack, HStack, Text, Button, IconButton, Badge, useToast } from '@chakra-ui/react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useShoppingSession } from '../../contexts/ShoppingSession';

export const Cart: React.FC = () => {
  const { state, actions } = useShoppingSession();
  const toast = useToast();

  const handlePlaceOrder = async () => {
    try {
      await actions.placeOrder();
      toast({
        title: 'Order placed',
        description: 'Your order has been placed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    actions.removeFromCart(productId);
    toast({
      title: 'Removed',
      description: 'Item removed from cart',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const handleQuantityChange = (productId: string, increment: number) => {
    const item = state.cartItems.find(item => item.product.id === productId);
    if (!item) return;
    
    const newQuantity = increment > 0 ? item.quantity + 1 : item.quantity - 1;
    if (newQuantity >= 1) {
      actions.updateQuantity(productId, newQuantity);
    }
  };

  return (
    <Box p={4}>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Shopping Cart
      </Text>
      {state.cartItems.length === 0 ? (
        <Text>No items in cart</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {state.cartItems.map((item) => (
            <HStack key={item.product.id} justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">{item.product.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  ₹{item.product.price}
                </Text>
              </Box>
              <HStack>
                <IconButton
                  icon={<FaMinus />}
                  size="sm"
                  onClick={() => handleQuantityChange(item.product.id, -1)}
                  aria-label="Decrease quantity"
                />
                <Badge>{item.quantity}</Badge>
                <IconButton
                  icon={<FaPlus />}
                  size="sm"
                  onClick={() => handleQuantityChange(item.product.id, 1)}
                  aria-label="Increase quantity"
                />
              </HStack>
              <IconButton
                icon={<FaTrash />}
                size="sm"
                onClick={() => handleRemoveFromCart(item.product.id)}
                aria-label="Remove item"
                colorScheme="red"
              />
            </HStack>
          ))}
          <Box mt={4}>
            <Text fontWeight="bold" mb={2}>
              Total: ₹{state.cartItems.reduce((sum: number, item) => sum + (item.product.price * item.quantity), 0)}
            </Text>
            <Text fontWeight="bold" color="green.500">
              ₹{state.cartItems.reduce((sum: number, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
            </Text>
            <Button colorScheme="blue" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </Box>
        </VStack>
      )}
    </Box>
  );
};
