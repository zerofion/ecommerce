import { Box, VStack, Heading, Text, FormControl, FormLabel, Input, Button, Select, useToast, Link as ChakraLink, HStack, Text as ChakraText, InputLeftElement, InputGroup, Icon } from '@chakra-ui/react';
import { FaUser, FaLock, FaUserTag, FaUserPlus, FaGoogle } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { login, signUp, signInWithGoogle, signUpWithGoogle } from '../services/auth';
import { useAuth } from '../hooks/useAuthHook';
import { ClientRole } from '../context/types';
import { EmailNotVerifiedError } from '../exceptions/EmailNotVerifiedError';
import { UserRoleExistsError } from '../exceptions/UserRoleExists';
import { UserNotFoundError } from '../exceptions/UserNotFound';
import { UserRoleNotFoundError } from '../exceptions/UserRoleNotFoundError';

export default function Auth() {
  const toast = useToast();
  const navigate = useNavigate();
  const { mode } = useParams<{ mode: string }>();
  const [searchParams] = useSearchParams();
  const userExists = searchParams.get('ue');
  const userJustCreated = searchParams.get('ujc');
  const roleExists = searchParams.get('re');
  const emailNotVerified = searchParams.get('env');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<ClientRole>('customer');
  const [passwordError, setPasswordError] = useState('');
  const { setAuthSession, setIsLoading, isLoading } = useAuth();

  useEffect(() => {

    if (userExists === '0' && mode === 'signup') {
      toast({
        title: 'Error',
        description: 'User not found, Please sign up first',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      navigate('/auth/signup');
    }

    if (userJustCreated === '1' && mode === 'login') {
      toast({
        title: 'Success',
        description: 'Account created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      navigate('/auth/login');
    }

    if (roleExists === '0' && mode === 'signup') {
      toast({
        title: 'Error',
        description: 'Role not found, Please sign up with a valid role first',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      navigate('/auth/signup');
    }

    if (emailNotVerified === '1' && mode === 'login') {
      toast({
        title: 'Error',
        description: 'Email not verified, Please verify your email first',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      navigate('/auth/login');
    }

    if (mode === 'login' && userExists === '1' && roleExists === '1') {
      toast({
        title: 'Warning',
        description: 'User with this role already exists',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      navigate('/auth/login');
    }
  }, [toast, userExists, mode, userJustCreated, roleExists, emailNotVerified, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await signUp(email, password, role);
      toast({
        title: 'Success',
        description: 'Account created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      navigate('/auth/login?ujc=1');
    } catch (error: any) {
      console.error('Sign-Up Error:', error);
      if (error instanceof UserRoleExistsError) {
        navigate('/auth/login?ue=1&re=1');
        return;
      }
      if (error instanceof UserNotFoundError) {
        navigate('/auth/signup?ue=0');
        return;
      }
      navigate('/auth/signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login(email, password, role);
      setAuthSession({
        user: response.user,
        token: response.token
      });
      navigate('/');
    } catch (error: any) {
      if (error instanceof EmailNotVerifiedError) {
        navigate('/auth/login?env=1');
        return;
      }
      if (error instanceof UserNotFoundError) {
        navigate('/auth/signup?ue=0');
        return;
      }
      if (error instanceof UserRoleNotFoundError) {
        navigate('/auth/signup?re=0');
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const response = await signUpWithGoogle(role);
      if (response.userExists === '1') {
        setIsLoading(false);
        navigate('/auth/login?ue=1');
        return;
      }
      navigate('/auth/login?ujc=1');
    } catch (error: any) {
      if (error instanceof UserRoleExistsError) {
        navigate('/auth/login?ue=1&re=1');
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const response = await signInWithGoogle(role);
      setAuthSession({
        user: response.user,
        token: response.token
      });
      navigate('/');
    } catch (error: any) {
      if (error instanceof UserNotFoundError) {
        navigate('/auth/signup?ue=0');
        return;
      }
      if (error instanceof UserRoleNotFoundError) {
        navigate('/auth/signup?re=0');
        return;
      }
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

          <form onSubmit={mode === 'login' ? handleSignIn : handleSignUp}>
            <VStack spacing={6} align="stretch">
              (
              <>
                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value as ClientRole)}
                    icon={<FaUserTag />}
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="b2b-customer">B2B Customer</option>
                  </Select>
                </FormControl>
              </>
              )

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
                w="full"
                mb={4}
                isDisabled= {mode === 'signup' && !!passwordError}
              >
                {mode === 'login' ? 'Login' : 'Sign Up'}
              </Button>

              <Button
                onClick={mode === 'login' ? handleGoogleSignIn : handleGoogleSignUp}
                colorScheme="gray"
                leftIcon={<Icon as={FaGoogle} />}
                w="full"
                mb={4}
              >
                {mode === 'login' ? 'Login with Google' : 'Sign Up with Google'}
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
