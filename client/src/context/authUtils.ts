import { ClientRole, Session } from "./types";
import { verifyAuthSession } from "../utils/authApiUtils";
import { logout } from "../services/auth";
import { NavigateFunction } from "react-router-dom";
import { EmailNotVerifiedError } from "../exceptions/EmailNotVerifiedError";
import { UserRoleNotFoundError } from "../exceptions/UserRoleNotFoundError";
import { UserNotFoundError } from "../exceptions/UserNotFound";
import { UserRoleExistsError } from "../exceptions/UserRoleExists";


export async function validateAuthSession({ idToken, role }: { idToken: string, role: ClientRole }): Promise<Session> {
    try {
        const updatedAuthSession = await verifyAuthSession({
            idToken: idToken,
            role: role
        });
        updateAuthSessionInLocalStorage(updatedAuthSession);
        return updatedAuthSession;
    } catch (error: any) {
        if (error.response?.status === 401) {
            logout();
        }
        throw error;
    }
}

export function updateAuthSessionInLocalStorage(updatedAuthSession: Session) {
    localStorage.setItem('auth', JSON.stringify({
        token: updatedAuthSession.token,
        user: {
            name: updatedAuthSession.user?.name || null,
            email: updatedAuthSession.user?.email || null,
            role: updatedAuthSession.user?.role || ClientRole.CUSTOMER
        }
    }));
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
        return;
    }
    console.error('Auth Error:', error);
    navigate('/auth/login');
}