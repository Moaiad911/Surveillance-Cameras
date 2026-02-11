// @ts-nocheck
/**
 * @param {string} id
 * @param {string} username
 * @param {string} passwordHash
 * @param {string} role
 * 
 */ class User {
    constructor(id, username, passwordHash, role) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }
}
