export class EmailNotVerifiedError extends Error {
    constructor(message?: string) {
        super(message || 'Email not verified');
    }
}