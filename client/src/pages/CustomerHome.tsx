import { Box } from '@chakra-ui/react';
import { ShoppingWindow } from '../components/ShoppingWindow';
import { ShoppingSessionProvider } from '../contexts/ShoppingSession';

export const CustomerHome: React.FC = () => {
  return (
    <ShoppingSessionProvider>
      <Box 
        w="full" 
        h="100vh" 
        m={0} 
        mt={{ base: 4, md: 16 }}
        bgGradient="linear(to-b, blue.50, white)"
        p={0}
      >
        <ShoppingWindow />
      </Box>
    </ShoppingSessionProvider>
  );
};
