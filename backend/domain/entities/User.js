class User {
    constructor({ id, username, passwordHash, role, createdAt, updatedAt }) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

module.exports = User;
