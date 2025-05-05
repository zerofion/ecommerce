import { Box, VStack, Heading, HStack, Link, Text, useToast } from '@chakra-ui/react';
import { FaLock, FaUser } from 'react-icons/fa';
import { ClientRole } from '../../../context/types';
import FormInputField from '../FormComponents/FormInputField';
import FormSubmissionButton from '../FormComponents/FormSubmissionButton';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { handleError, handleToasts } from '../../../utils/authUtils';
import { login, signInWithGoogle, signUp, signUpWithGoogle } from '../../../services/auth';
import { useAuth } from '../../../hooks/useAuthHook';
import FormSelectInputField from '../FormComponents/FormSelectInputField';
import GoogleButton from './GoogleButton';
import { toDisplayCase } from '../../../utils/stringUtils';

export default function AuthForm() {

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
    const [role, setRole] = useState<ClientRole>(ClientRole.CUSTOMER);
    const [passwordError, setPasswordError] = useState('');
    const { setAuthSession, setIsLoading, isLoading } = useAuth();

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
            setAuthSession({
                user: response.user,
                token: response.token
            });
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
            const response = await signUpWithGoogle(role);
            if (response.userExists === '1') {
                setIsLoading(false);
                navigate('/auth/login?ue=1');
                return;
            }
            navigate('/auth/login?ujc=1');
        } catch (error: any) {
            handleError(error, navigate);
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
                            onChange={(e) => setRole(e.target.value as ClientRole)}
                            options={Object.values(ClientRole).map(role => ({
                                label: toDisplayCase(role),
                                value: role
                            }))}
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

                        <GoogleButton mode={mode ? mode : 'login'}
                            handleGoogleSignIn={handleGoogleSignIn}
                            handleGoogleSignUp={handleGoogleSignUp} />

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
                    </VStack>
                </form>
            </VStack>
        </Box>
    )
}
