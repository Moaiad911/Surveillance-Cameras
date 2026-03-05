class GetProfileUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
        return {
            id: user._id,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt
        };
    }
}

module.exports = GetProfileUseCase;
