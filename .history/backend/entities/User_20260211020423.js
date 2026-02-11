// @ts-nocheck
/**
 * @param {string} id
 * @param {string} username
 * @param {string} streamURL
 * @param {string} location
 * @param {string} status
 * @param {string} createdBy
 */export class User {
    constructor(
        public id: string,
        public username: string,
        public passwordHash: string,
        public role: 'Admin' | 'Operator'
    ) {}
}
