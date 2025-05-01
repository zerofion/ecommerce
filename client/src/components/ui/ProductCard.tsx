import { Box, Image, Text } from '@chakra-ui/react';

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  image?: string;
}

export const ProductCard = ({ name, description, price, image }: ProductCardProps) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      maxW="sm"
    >
      {image && (
        <Image
          src={image}
          alt={name}
          height="200px"
          width="100%"
          objectFit="cover"
        />
      )}
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={2}>
          {name}
        </Text>
        <Text mb={2}>{description}</Text>
        <Text fontSize="lg" color="green.500">
          ${price}
        </Text>
      </Box>
    </Box>
  );
};
