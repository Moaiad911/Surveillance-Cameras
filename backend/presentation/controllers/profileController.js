const GetProfileUseCase = require('../../usecases/profile/GetProfileUseCase');
const UpdateProfileUseCase = require('../../usecases/profile/UpdateProfileUseCase');
const UpdateRoleUseCase = require('../../usecases/profile/UpdateRoleUseCase');
const UserRepository = require('../../infrastructure/repositories/UserRepository');

const userRepository = new UserRepository();
const getProfile = new GetProfileUseCase(userRepository);
const updateProfile = new UpdateProfileUseCase(userRepository);
const updateRole = new UpdateRoleUseCase(userRepository);

exports.getProfile = async (req, res) => {
    try {
        const profile = await getProfile.execute(req.user._id);
        res.status(200).json(profile);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updated = await updateProfile.execute(req.user._id, req.body);
        res.status(200).json({ message: 'Profile updated successfully', user: updated });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const updated = await updateRole.execute(req.params.userId, req.body.role, req.user);
        res.status(200).json({ message: 'Role updated successfully', user: updated });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};
