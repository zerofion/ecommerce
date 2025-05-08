import { Box, Heading, Text, VStack, Container } from '@chakra-ui/react';
import { ShoppingWindow } from '../components/ShoppingWindow';
import { ShoppingSessionProvider } from '../contexts/ShoppingSession';

export const CustomerHome: React.FC = () => {

  return (
    <ShoppingSessionProvider>
      <Container w="100vw" h="100vh" m={0} mt={16}>

        <VStack spacing={8}>
          <ShoppingWindow />
        </VStack>
      </Container>
    </ShoppingSessionProvider>
  );
};
