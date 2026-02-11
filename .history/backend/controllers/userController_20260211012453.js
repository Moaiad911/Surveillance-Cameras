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
        res.status(401).json({ message: err instanceof Error ? err.message : 'Login failed' });
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
        res.status(400).json({ message: err instanceof Error ? err.message : 'Create failed' });
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
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const user = await userService.getUserById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err instanceof Error ? err.message : 'Server error' });
    }
};
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updateUser = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const user = await userService.updateUser(id, req.body);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User updated', user });
    } catch (err) {
        res.status(500).json({ message: err instanceof Error ? err.message : 'Update failed' });
    }
};
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const deleteUser = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await userService.deleteUser(id);
        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err instanceof Error ? err.message : 'Delete failed' });
    }
};
