const LoginUseCase = require('../../usecases/auth/LoginUseCase');
const RegisterUseCase = require('../../usecases/auth/RegisterUseCase');
const UserRepository = require('../../infrastructure/repositories/UserRepository');

const userRepository = new UserRepository();
const loginUseCase = new LoginUseCase(userRepository);
const registerUseCase = new RegisterUseCase(userRepository);

exports.login = async (req, res) => {
    try {
        const result = await loginUseCase.execute(req.body);
        res.status(200).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};

exports.signup = async (req, res) => {
    try {
        const result = await registerUseCase.execute(req.body);
        res.status(201).json({ message: 'User created successfully', user: result });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
};
