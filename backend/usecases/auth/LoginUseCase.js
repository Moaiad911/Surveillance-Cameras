const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ username, password }) {
        if (!username || !password) {
            throw { status: 400, message: 'Username and password are required' };
        }

        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        };
    }
}

module.exports = LoginUseCase;
