import { Box, VStack, Heading, Text, FormControl, FormLabel, Input, Button, Select, useToast, Link as ChakraLink, HStack, Text as ChakraText, InputLeftElement, InputGroup } from '@chakra-ui/react';
import { FaUser, FaLock, FaUserTag, FaUserPlus } from 'react-icons/fa';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { login, signUp } from '../services/auth';
import { useAuth } from '../hooks/useAuthHook';

export default function Auth() {
  const toast = useToast();
  const navigate = useNavigate();
  const { mode } = useParams<{ mode: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor' | 'b2b-customer'>('customer');
  const [passwordError, setPasswordError] = useState('');
  const { setUser, setIsLoading, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      if (mode === 'signup') {
        response = await signUp(email, password, role);
        toast({
          title: 'Success',
          description: 'Account created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        response = await login(email, password);
        toast({
          title: 'Success',
          description: 'Logged in successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
        setUser(response.user);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (password !== e.target.value) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const otherMode = mode === 'login' ? 'signup' : 'login';
  const otherModeText = mode === 'login' ? 'Create Account' : 'Login';

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-b, blue.50, white)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        w={{ base: '100%', sm: '400px' }}
      >
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={2}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </Heading>
            <Text color="gray.600">
              {mode === 'login' ? 'Sign in to your account' : 'Create your new account'}
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'customer' | 'vendor' | 'b2b-customer')}
                  icon={<FaUserTag />}
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="b2b-customer">B2B Customer</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaUser color="gray.300" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaLock color="gray.300" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                  />
                </InputGroup>
              </FormControl>

              {mode === 'signup' && (
                <FormControl isRequired isInvalid={!!passwordError}>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaLock color="gray.300" />
                    </InputLeftElement>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder="Confirm your password"
                    />
                  </InputGroup>
                  {passwordError && (
                    <ChakraText color="red.500" mt={1} fontSize="sm">
                      {passwordError}
                    </ChakraText>
                  )}
                </FormControl>
              )}

              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                leftIcon={mode === 'login' ? <FaUser /> : <FaUserPlus />}
              >
                {mode === 'login' ? 'Login' : 'Sign Up'}
              </Button>

              <HStack justify="center">
                <Text color="gray.600">
                  {mode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}
                </Text>
                <ChakraLink
                  color="blue.500"
                  onClick={() => navigate(`/auth/${otherMode}`)}
                >
                  {otherModeText}
                </ChakraLink>
              </HStack>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};
