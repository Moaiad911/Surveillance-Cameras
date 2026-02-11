// src/controllers/UserController.ts
import { UserService } from '../services/UserService';

const userService = new UserService(mongoUserRepository);

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const { user, token } = await userService.login(username, password);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};
