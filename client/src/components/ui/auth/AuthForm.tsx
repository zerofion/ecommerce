import { Box, VStack, Heading, HStack, Link, Text, useToast } from '@chakra-ui/react';
import { FaLock, FaUser } from 'react-icons/fa';
import { ClientRole, Session } from '../../../context/types';
import FormInputField from '../FormComponents/FormInputField';
import FormSubmissionButton from '../FormComponents/FormSubmissionButton';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { handleToasts } from '../../../utils/authUtils';
import { login, signInWithGoogle, signUp, signUpWithGoogle } from '../../../services/auth';
import { useAuth } from '../../../hooks/useAuthHook';
import FormSelectInputField from '../FormComponents/FormSelectInputField';
import GoogleButton from './GoogleButton';
import { toDisplayCase } from '../../../utils/stringUtils';
import { handleError } from './utils';

export default function AuthForm() {

    const { setAuthSession, setIsLoading, isLoading, authSession, setRole } = useAuth();

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
    const [passwordError, setPasswordError] = useState('');
    const role = authSession?.user?.role || ClientRole.CUSTOMER;

    useEffect(() => {
        const navigateTo = handleToasts({
            flags: { userExists, roleExists, emailNotVerified, userJustCreated }, mode, toast
        });
        if (navigateTo) navigate(navigateTo);
    }, [toast, userExists, mode, userJustCreated, roleExists, emailNotVerified, navigate]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signUp(email, password, role);
            navigate('/auth/login?ujc=1');
        } catch (error: any) {
            handleError(error, navigate);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await login(email, password, role);
            setAuthSession(response.session);
            navigate('/');
        } catch (error: any) {
            handleError(error, navigate);
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleSignUp = async () => {
        try {
            setIsLoading(true);
            await signUpWithGoogle(role);
            navigate('/auth/login?ujc=1');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right'
            });
            handleError(error, navigate);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            const response = await signInWithGoogle(role);
            setAuthSession(response.session);
            navigate('/');
        } catch (error: any) {
            handleError(error, navigate);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const roles = Object.values(ClientRole).map(role => ({
        label: toDisplayCase(role),
        value: role
    }))

    if (window.location.href.includes('signup')) {
        roles.splice(roles.findIndex(role => role.value === ClientRole.B2B_CUSTOMER), 1);
        if (role === ClientRole.B2B_CUSTOMER) {
            setRole(ClientRole.CUSTOMER);
        }
    }

    return (
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
                        <FormSelectInputField
                            value={role}
                            onChange={(e) => {
                                const newAuthSession: Session = {
                                    ...authSession,
                                    token: authSession?.token || null,
                                    user: {
                                        ...authSession?.user,
                                        role: e.target.value as ClientRole,
                                        email: authSession?.user?.email || null,
                                        name: authSession?.user?.name || null
                                    }
                                };
                                setAuthSession(newAuthSession);
                            }}
                            options={roles}
                            isRequired={true}
                        />

                        <FormInputField
                            formFieldLabel="Email"
                            formFieldValue={email}
                            handleFormFieldChange={(e) => setEmail(e.target.value)}
                            formFieldPlaceholder="Enter your email"
                            formFieldType="email"
                            formFieldIcon={<FaUser color="gray.300" />}
                            formFieldIsRequired={true}
                        />

                        <FormInputField
                            formFieldLabel="Password"
                            formFieldValue={password}
                            handleFormFieldChange={handlePasswordInputChange}
                            formFieldPlaceholder="Enter your password"
                            formFieldType="password"
                            formFieldIcon={<FaLock color="gray.300" />}
                            formFieldIsRequired={true}
                        />

                        {mode === 'signup' && (
                            <FormInputField
                                formFieldLabel="Confirm Password"
                                formFieldValue={confirmPassword}
                                handleFormFieldChange={handleConfirmPasswordChange}
                                formFieldPlaceholder="Confirm your password"
                                formFieldType="password"
                                formFieldIcon={<FaLock color="gray.300" />}
                                formFieldIsRequired={true}
                                optionalChildren={passwordError && (
                                    <Text color="red.500" mt={1} fontSize="sm">
                                        {passwordError}
                                    </Text>
                                )}
                            />
                        )}

                        <FormSubmissionButton mode={mode ? mode : 'login'}
                            isLoading={isLoading}
                            isDisabled={mode === 'signup' && !!passwordError} />

                        {isLoading ? <FormSubmissionButton mode={mode ? mode : 'login'}
                            isLoading={isLoading}
                            isDisabled={mode === 'signup' && !!passwordError} /> : <GoogleButton mode={mode ? mode : 'login'}
                                handleGoogleSignIn={handleGoogleSignIn}
                                handleGoogleSignUp={handleGoogleSignUp} />}


                        <HStack justify="center">
                            <Text color="gray.600">
                                {mode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}
                            </Text>
                            <Link
                                color="blue.500"
                                onClick={() => navigate(`/auth/${mode === 'login' ? 'signup' : 'login'}`)}
                            >
                                {mode === 'login' ? 'Create Account' : 'Login'}
                            </Link>
                        </HStack>
                        {mode === 'signup' && (
                            <Text color="gray.600">
                                Please contact the admin for B2B account registration.
                            </Text>
                        )}
                    </VStack>
                </form>
            </VStack>
        </Box>
    )
}
