class DeleteUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(id) {
        const deleted = await this.userRepository.delete(id);
        if (!deleted) {
            throw { status: 404, message: 'User not found' };
        }
        return deleted;
    }
}

module.exports = DeleteUserUseCase;
