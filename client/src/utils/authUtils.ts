import { CreateToastFnReturn } from "@chakra-ui/react";
import { UserRoleExistsError } from '../exceptions/UserRoleExists';
import { UserNotFoundError } from '../exceptions/UserNotFound';
import { UserRoleNotFoundError } from "../exceptions/UserRoleNotFoundError";
import { GoogleAuthProvider } from "@firebase/auth";

export interface authToastFlags {
    userExists: string | null;
    roleExists: string | null;
    emailNotVerified: string | null;
    userJustCreated: string | null;
}

export interface authToastArgs {
    flags: authToastFlags;
    mode: string | undefined;
    toast: CreateToastFnReturn;
}

export function getGoogleProvider(): GoogleAuthProvider {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    provider.addScope('profile');
    provider.addScope('email');
    return provider;
}

export function handleToasts({ flags, mode, toast }: authToastArgs): string {
    if (flags.userExists === '0' && mode === 'signup') {
        toast({
            title: 'Error',
            description: 'User not found, Please sign up first',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top-right'
        });
        return '/auth/signup';
    }

    if (flags.userJustCreated === '1' && mode === 'login') {
        toast({
            title: 'Success',
            description: 'Account created successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top-right'
        });
        return '/auth/login';
    }

    if (flags.roleExists === '0' && mode === 'signup') {
        toast({
            title: 'Error',
            description: 'Role not found, Please sign up with a valid role first',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top-right'
        });
        return '/auth/signup';
    }

    if (flags.emailNotVerified === '1' && mode === 'login') {
        toast({
            title: 'Error',
            description: 'Email not verified, Please verify your email first',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top-right'
        });
        return '/auth/login';
    }

    if (mode === 'login' && flags.userExists === '1' && flags.roleExists === '1') {
        toast({
            title: 'Warning',
            description: 'User with this role already exists',
            status: 'warning',
            duration: 3000,
            isClosable: true,
            position: 'top-right'
        });
        return '/auth/login';
    }

    return '';
}

export function handleSignUpError(error: any) {
    console.error('SignUp Error:', error);
    if (error.response?.status === 409) {
        throw new UserRoleExistsError();
    }
    if (error.response?.status === 404 || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        throw new UserNotFoundError();
    }
    if (!error.response?.data?.message) {
        if (error.response?.data?.error) {
            error.message = error.response.data.error;
        } else {
            error.message = 'Something went wrong';
        }
    }
    if(error.code && error.code === 'auth/popup-closed-by-user'){
        error.message = 'Popup closed by user';
    }
    throw error;
}

export const handleLoginError = (error: any) => {
    if (error.response?.status === 403) {
        throw new UserRoleNotFoundError();
    }

    if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
    }

    if (error.response?.status === 404 || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        throw new UserNotFoundError();
    }
    console.error('Google Auth Error:', error);
}

// export const refreshSession = async (setAuthSession: React.Dispatch<React.SetStateAction<Session | null>>) => {
//     try {
//       onAuthStateChanged(auth, async (user) => {
//         if (user) {
//           const tokenResult = await user.getIdTokenResult(true);
//           const idToken = tokenResult.token;
  
//           setAuthSession({
//             token: idToken,
//             user: {
//               name: user.displayName || null,
//               email: user.email || null,
//               role: tokenResult.claims.role as ClientRole || ClientRole.CUSTOMER
//             }
//           })
//           localStorage.setItem('auth', JSON.stringify({
//             token: idToken,
//             user: {
//               name: user.displayName || null,
//               email: user.email || null,
//               role: tokenResult.claims.role as ClientRole || ClientRole.CUSTOMER
//             }
//           }))
//         } else {
//           console.log("No user is signed in.");
//         }
//       });
//     } catch (error: any) {
//       throw new Error(error.message || 'Failed to refresh session');
//     }
//   }