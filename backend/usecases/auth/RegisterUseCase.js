const bcrypt = require('bcryptjs');

class RegisterUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ username, password, role }) {
        if (!username || !password) {
            throw { status: 400, message: 'Username and password are required' };
        }

        const existing = await this.userRepository.findByUsername(username);
        if (existing) {
            throw { status: 409, message: 'Username already exists' };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await this.userRepository.create({
            username,
            passwordHash,
            role: role || 'Operator'
        });

        return {
            id: user._id,
            username: user.username,
            role: user.role
        };
    }
}

module.exports = RegisterUseCase;
