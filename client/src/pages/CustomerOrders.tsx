import { Box, Heading, Container, Table, Thead, Tr, Th, Tbody, Td, Button, VStack, HStack, Text, Card, CardHeader, CardBody, CardFooter, Stack, useBreakpointValue, Icon } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { API_URL } from '../services/auth';
import { Order } from '../types';
import { useAuth } from '../hooks/useAuthHook';
import { FaStreetView, FaTruck, FaMoneyBillWave } from 'react-icons/fa';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const statusColors = {
    pending: 'yellow.500',
    delivered: 'green.500',
    cancelled: 'red.500'
  };

  return (
    <Card
      variant="outline"
      mb={{ base: 3, md: 4 }}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    >
      <CardHeader p={{ base: 2, md: 3 }}>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>
              Order #{order.id}
            </Text>
            <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </VStack>
          <Text
            color={statusColors[order.status as keyof typeof statusColors]}
            fontWeight="bold"
            fontSize={{ base: 'xs', md: 'sm' }}
            px={2}
            py={1}
            borderRadius="full"
            bg={statusColors[order.status as keyof typeof statusColors] + '.100'}
          >
            {order.status.toUpperCase()}
          </Text>
        </HStack>
      </CardHeader>

      <CardBody p={{ base: 2, md: 3 }}>
        <VStack spacing={3} align="stretch">
          <HStack
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={2}
          >
            <HStack>
              <Icon as={FaMoneyBillWave} color="blue.500" boxSize={4} />
              <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>
                ₹{order.total.toFixed(2)}
              </Text>
            </HStack>
            <HStack>
              <Icon as={FaTruck} color="gray.500" boxSize={4} />
              <Text fontSize={{ base: 'xs', md: 'sm' }}>
                Vendor: {order.vendorId}
              </Text>
            </HStack>
          </HStack>

          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              Products
            </Text>
            <VStack spacing={2}>
              <HStack w="full" justify="space-between" align="center" wrap="wrap" gap={2}>
                <Text fontSize="sm" fontWeight="bold">Name</Text>
                <Text fontSize="sm" fontWeight="bold">Quantity</Text>
                <Text fontSize="sm" fontWeight="bold">Price</Text>
              </HStack>
              {order.products.map((product, index) => (
                <HStack
                  key={index}
                  justify="space-between"
                  align="center"
                  p={2}
                  bg={index % 2 === 0 ? 'gray.50' : 'white'}
                  borderRadius="md"
                  w="full"
                >
                  <Text fontSize="sm" noOfLines={1}>
                    {product.name}
                  </Text>
                  <Text fontSize="sm">
                    ₹{product.price * product.quantity}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </VStack>
      </CardBody>

      <CardFooter p={{ base: 2, md: 3 }}>
        <HStack
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={2}
        >
          <Button
            size="sm"
            leftIcon={<Icon as={FaStreetView} boxSize={4} />}
            onClick={() => window.open(`/orders/${order.id}`)}
          >
            View Details
          </Button>
          {order.status === 'pending' && (
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => {
                // Add cancel order logic here
              }}
            >
              Cancel Order
            </Button>
          )}
        </HStack>
      </CardFooter>
    </Card>
  );
};

export const CustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { authSession } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders/user`, {
          headers: {
            Authorization: `Bearer ${authSession?.token}`,
          },
        });
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, [authSession]);

  return (
    <Container maxW="container.xl" mt={16}>
      <Heading mb={8}>Orders</Heading>
      <VStack spacing={6}>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} isMobile={false} />
        ))}
      </VStack>
    </Container>
  );
};
