import { NavigateFunction } from "react-router-dom";
import { EmailNotVerifiedError } from "../../../exceptions/EmailNotVerifiedError";
import { UserNotFoundError } from "../../../exceptions/UserNotFound";
import { UserRoleExistsError } from "../../../exceptions/UserRoleExists";
import { UserRoleNotFoundError } from "../../../exceptions/UserRoleNotFoundError";


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