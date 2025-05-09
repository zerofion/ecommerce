import { Box, Image, Flex } from '@chakra-ui/react';
import AuthForm from '../components/ui/auth/AuthForm';
import authImage1 from '../assets/authPageImage1.webp';
import authImage2 from '../assets/authPageImage2.webp';
import authImage3 from '../assets/authPageImage3.webp';

export default function Auth() {

  return (
    <Box
      minH="100vh"
      minW="100vw"
      bgGradient="linear(to-b, blue.50, white)"
      display="flex"
      alignItems="space-between"
      justifyContent="space-between"
      p={8}
      pt={0}
      gap={8}
    >
      <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="center" gap={8}
      >
        <Box m={4}>
          <AuthForm />
        </Box>
        <Flex 
          align="space-between" 
          justify="center" 
          wrap="wrap" 
          display={{ base: 'none', md: 'flex' }}
        >
          <Image
            src={authImage1}
            alt="Neighbour Stores"
            maxW="500px"
            borderRadius="lg"
            boxShadow="lg"
            mr={4}
          />
          <Image
            src={authImage3}
            alt="Neighbour Stores"
            maxW="500px"
            borderRadius="lg"
            boxShadow="lg"
          />
          <Image
            src={authImage2}
            alt="Neighbour Stores"
            maxW="500px"
            borderRadius="lg"
            boxShadow="lg"
          />
        </Flex>
      </Flex>
    </Box>
  );
};
