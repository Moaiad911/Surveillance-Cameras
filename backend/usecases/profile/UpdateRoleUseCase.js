class UpdateRoleUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(targetUserId, role, requestingUser) {
        if (requestingUser.role !== 'Admin') {
            throw { status: 403, message: 'Only admins can change roles' };
        }

        const validRoles = ['Admin', 'Operator'];
        if (!validRoles.includes(role)) {
            throw { status: 400, message: 'Invalid role. Must be Admin or Operator' };
        }

        const user = await this.userRepository.findById(targetUserId);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        const updated = await this.userRepository.update(targetUserId, { role });
        return {
            id: updated._id,
            username: updated.username,
            role: updated.role
        };
    }
}

module.exports = UpdateRoleUseCase;
