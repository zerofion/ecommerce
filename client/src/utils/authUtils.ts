import { CreateToastFnReturn } from "@chakra-ui/react";
import { EmailNotVerifiedError } from '../exceptions/EmailNotVerifiedError';
import { UserRoleExistsError } from '../exceptions/UserRoleExists';
import { UserNotFoundError } from '../exceptions/UserNotFound';
import { UserRoleNotFoundError } from '../exceptions/UserRoleNotFoundError';
import { NavigateFunction } from "react-router-dom";

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


export function handleError(error: any, navigate: NavigateFunction) {
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

    if (error instanceof UserRoleExistsError) {
        navigate('/auth/login?ue=1&re=1');
        return;
    }

    if (error.code === 'auth/popup-closed-by-user') {
        navigate('/auth/login');
        return;
    }
    console.error('Auth Error:', error);
    navigate('/auth/login');
}