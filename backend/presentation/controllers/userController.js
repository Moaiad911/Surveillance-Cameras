const GetUsersUseCase = require('../../usecases/user/GetUsersUseCase');
const DeleteUserUseCase = require('../../usecases/user/DeleteUserUseCase');
const UserRepository = require('../../infrastructure/repositories/UserRepository');

const userRepository = new UserRepository();
const getUsers = new GetUsersUseCase(userRepository);
const deleteUser = new DeleteUserUseCase(userRepository);

exports.getAllUsers = async (req, res) => {
    try {
        const users = await getUsers.execute();
        res.status(200).json(users);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await deleteUser.execute(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};
