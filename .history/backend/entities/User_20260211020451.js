// @ts-nocheck
/**
 * @param {string} id
 * @param {string} username
 * @param {string} passwordHash
 * @param {string} role
 * 
 */ class User {
    constructor(
        public id: string,
        public username: string,
        public passwordHash: string,
        public role: 'Admin' | 'Operator'
    ) {}
}
