export class UserRoleExistsError extends Error {
    constructor(message?: string) {
        super(message || 'User role exists');
    }
}