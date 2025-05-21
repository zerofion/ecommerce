import { Box, Heading, Container, Button, VStack, HStack, Text, Card, CardHeader, CardBody, CardFooter, Icon, Input, useToast, Flex } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { API_URL } from '../services/auth';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../hooks/useAuthHook';
import { FaTruck, FaMoneyBillWave, FaCheck, FaTimes, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface OrderCardProps {
  order: Order;
  handleStatusUpdate: (order: Order, status: OrderStatus, archived: boolean) => void;
  handleCommentUpdate: (order: Order, comment: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, handleStatusUpdate, handleCommentUpdate }) => {
  const [comment, setComment] = useState(order.vendorComment || '');
  const [isEditing, setIsEditing] = useState(false);
  const total = order.products.reduce((acc, product) => acc + product.price * product.quantity, 0);
  const statusColors = {
    pending: 'yellow.500',
    accepted: 'blue.500',
    completed: 'green.500',
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
              {new Date(order.createdAt).toLocaleDateString() + ' ' + new Date(order.createdAt).toLocaleTimeString()}
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
                ₹{total.toFixed(2)}
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
                <Text fontSize="sm" fontWeight="bold">Price</Text>
                <Text fontSize="sm" fontWeight="bold">Quantity</Text>
                <Text fontSize="sm" fontWeight="bold">Total</Text>
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
                    ₹{product.price}
                  </Text>
                  <Text fontSize="sm">
                    x{product.quantity}
                  </Text>
                  <Text fontSize="sm">
                    ₹{product.price * product.quantity}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {order.vendorComment && (
            <Box mt={4}>
              <Text fontSize="sm" color="gray.600" mb={2}>Vendor Comment</Text>
              <Text fontSize="sm">{order.vendorComment}</Text>
            </Box>
          )}

          <Box mt={4}>
            <Text fontSize="sm" color="gray.600" mb={2}>Customer Comment</Text>
            {isEditing ? (
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                mb={2}
              />
            ) : (
              <Text color="gray.600" mb={2}>{order.customerComment || 'No comment added'}</Text>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (isEditing) {
                  handleCommentUpdate(order, comment);
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? 'Save Comment' : 'Add Comment'}
            </Button>
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
          <HStack spacing={2}>
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <Button
                size="sm"
                leftIcon={<Icon as={FaTimes} boxSize={4} />}
                colorScheme="red"
                onClick={() => handleStatusUpdate(order, 'cancelled', true)}
              >
                Cancel Order
              </Button>
            )}
            {(order.status === 'cancelled' && order.archived === false) && (
              <Button
                size="sm"
                leftIcon={<Icon as={FaCheck} boxSize={4} />}
                colorScheme="green"
                onClick={() => handleStatusUpdate(order, 'cancelled', true)}
              >
                Archive Order
              </Button>
            )}
          </HStack>
        </HStack>
      </CardFooter>
    </Card>
  );
};

export const CustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { authSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

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

  function handleStatusUpdate(order: Order, status: OrderStatus, archived: boolean) {
    fetch(`${API_URL}/api/orders/${order.id}/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authSession?.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update order status');
        }
        toast({
          title: 'Success',
          description: 'Order status updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
        const updatedOrders = orders.map((o) => (o.id === order.id ? { ...o, status, archived } : o));
        setOrders(updatedOrders);
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update order status',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      });
  }

  function handleCommentUpdate(order: Order, comment: string) {
    fetch(`${API_URL}/api/orders/${order.id}/comment`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authSession?.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update order comment');
        }
        toast({
          title: 'Success',
          description: 'Comment updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
        const updatedOrders = orders.map((o) =>
          o.id === order.id ? { ...o, customerComment: comment } : o
        );
        setOrders(updatedOrders);
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update order comment',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      });
  }

  return (
    <Container maxW="container.xl" mt={16}>
      <Flex
        justify="space-between"
        align="center"
        mb={8}
      >
        <Heading>Orders</Heading>
        <Button
          size="lg"
          display={{ base: 'block', md: 'none' }}
          colorScheme="blue"
          leftIcon={<Icon as={FaHome} boxSize={4} />}
          onClick={() => navigate('/')}
        >
          Home
        </Button>
      </Flex>
      <VStack spacing={6}>
        <Flex flexWrap="wrap" gap={4}>
          {orders?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
            <>
              <OrderCard key={order.id} order={order} handleStatusUpdate={handleStatusUpdate} handleCommentUpdate={handleCommentUpdate} />
            </>
          ))}

        </Flex>
      </VStack>
    </Container>
  );
};
