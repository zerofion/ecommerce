import { Button, VStack, HStack, Select, Flex, Box, Heading, Text } from '@chakra-ui/react';
import { FaFilter, FaShoppingCart } from 'react-icons/fa';
import { ProductList } from './products/ProductList';
import { Cart } from './cart/Cart';
import { useShoppingSession } from '../contexts/ShoppingSession';
import { categories } from '../types';
import { toDisplayCase } from '../utils/stringUtils';

export const ShoppingWindow: React.FC = () => {
  const { state, actions } = useShoppingSession();

  return (
    <>
      <Flex ml={"16rem"} w="100vw">
        <Box textAlign="center" mb={12} w="90vw">
          <Heading as="h1" size="2xl" mb={4}>
            Welcome to Neighbour Stores
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Order from your nearest local store
          </Text>
          <br />
          <Box>
            <Button
              as="a"
              href="/orders"
              leftIcon={<FaShoppingCart />}
              size="lg"
              colorScheme="primary"
              flex="1"
              mr={4}
            >
              Orders
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => actions.setShowCart(!state.showCart)}
              size="lg"
            >
              {state.showCart ? 'Hide Cart' : 'View Cart'}
            </Button>
          </Box>
        </Box>

      </Flex>
      <Select
        placeholder="Filter by category"
        value={state.selectedCategory}
        onChange={(e) => actions.setSelectedCategory(e.target.value)}
        icon={<FaFilter />}
        
      >
        {categories.map((category) => {
          const value = category === '' ? '' : toDisplayCase(category);
          return (
            <option key={value} value={value}>
              {value}
            </option>
          )
        })}
      </Select>
      <Flex >




        <Flex>
          <ProductList />
          <Cart />
        </Flex>
      </Flex>
    </>
  );
};
