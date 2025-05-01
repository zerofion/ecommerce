import { Box, Text } from '@chakra-ui/react';

interface OrderCardProps {
  orderId: string;
  products: Array<{ name: string; quantity: number }>;
  status: string;
  total: number;
  date: string;
}

export const OrderCard = ({ orderId, products, status, total, date }: OrderCardProps) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      maxW="sm"
    >
      <Text fontSize="sm" color="gray.600" mb={2}>
        Order #{orderId}
      </Text>
      <Text fontSize="sm" color="gray.600" mb={4}>
        {date}
      </Text>
      {products.map((product, index) => (
        <Text key={index} mb={2}>
          {product.name} × {product.quantity}
        </Text>
      ))}
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        Total: ${total}
      </Text>
      <Text color={status === 'delivered' ? 'green.500' : status === 'pending' ? 'orange.500' : 'gray.500'}>
        Status: {status}
      </Text>
    </Box>
  );
};
