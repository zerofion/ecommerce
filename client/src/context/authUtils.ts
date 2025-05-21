import { ClientRole, Session } from "./types";
import { verifyAuthSession } from "../utils/authApiUtils";
import { logout } from "../services/auth";

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