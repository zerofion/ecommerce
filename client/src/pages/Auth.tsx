import { Box } from '@chakra-ui/react';
import AuthForm from '../components/ui/auth/AuthForm';

export default function Auth() {

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-b, blue.50, white)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
      pt={0}
    >
      <AuthForm />
    </Box>
  );
};
