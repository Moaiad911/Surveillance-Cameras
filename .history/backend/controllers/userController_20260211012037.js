// src/controllers/UserController.ts
import { MongoUserRepository } from '../repositories/MongoUserRepository';
import { UserService } from '../services/UserService';

const mongoUserRepository = new MongoUserRepository();
const userService = new UserService(mongoUserRepository);
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
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
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ message: 'User created', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getAllUsers = async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
};
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getUserById = async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
};
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updateUser = async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User updated', user });
};
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const deleteUser = async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ message: 'User deleted' });
};
