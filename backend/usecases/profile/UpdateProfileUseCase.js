const bcrypt = require('bcryptjs');

class UpdateProfileUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId, { username, currentPassword, newPassword }) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        const updates = {};

        if (username && username !== user.username) {
            const existing = await this.userRepository.findByUsername(username);
            if (existing) {
                throw { status: 409, message: 'Username already taken' };
            }
            updates.username = username;
        }

        if (newPassword) {
            if (!currentPassword) {
                throw { status: 400, message: 'Current password is required to set a new password' };
            }
            const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isMatch) {
                throw { status: 401, message: 'Current password is incorrect' };
            }
            updates.passwordHash = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(updates).length === 0) {
            throw { status: 400, message: 'No changes provided' };
        }

        const updated = await this.userRepository.update(userId, updates);
        return {
            id: updated._id,
            username: updated.username,
            role: updated.role
        };
    }
}

module.exports = UpdateProfileUseCase;
