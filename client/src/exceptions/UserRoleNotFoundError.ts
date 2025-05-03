export class UserRoleNotFoundError extends Error {
    constructor(message?: string) {
        super(message || 'User role not found');
    }
}
