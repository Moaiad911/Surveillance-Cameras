const { User } = require('../entities/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }

    async login(username, password) {
        const user = await this.userRepo.findByUsername(username);
        if (!user) throw new Error('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) throw new Error('Invalid credentials');

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        return { user, token };
    }

    async createUser(data) {
        const hashed = await bcrypt.hash(data.password, 10);
        const user = new User('', data.username, hashed, data.role || 'Operator');
        return this.userRepo.create(user);
    }

    async getAllUsers() {
        return this.userRepo.findAll();
    }

    async getUserById(id) {
        return this.userRepo.findById(id);
    }

    async updateUser(id, data) {
        if (data.password) {
            data.passwordHash = await bcrypt.hash(data.password, 10);
            delete data.password;
        }
        return this.userRepo.update(id, data);
    }

    async deleteUser(id) {
        return this.userRepo.delete(id);
    }
}

module.exports = { UserService };
