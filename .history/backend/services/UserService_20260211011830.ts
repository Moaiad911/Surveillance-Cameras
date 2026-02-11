// src/services/UserService.ts
import { IUserRepository } from "../interfaces/IUserRepository";
import { User } from "../entities/User";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserService {
    constructor(private userRepo: IUserRepository) {}

    async login(username: string, password: string): Promise<{ user: User, token: string }> {
        const user = await this.userRepo.findByUsername(username);
        if (!user) throw new Error('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) throw new Error('Invalid credentials');

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        return { user, token };
    }

    async createUser(data: { username: string, password: string, role?: 'Admin' | 'Operator' }): Promise<User> {
        const hashed = await bcrypt.hash(data.password, 10);
        const user = new User('', data.username, hashed, data.role || 'Operator');
        return this.userRepo.create(user);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepo.findAll();
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userRepo.findById(id);
    }

    async updateUser(id: string, data: Partial<User>): Promise<User | null> {
        if (data.password) {
            data.passwordHash = await bcrypt.hash(data.password, 10);
            delete data.password;
        }
        return this.userRepo.update(id, data);
    }

    async deleteUser(id: string): Promise<void> {
        return this.userRepo.delete(id);
    }
}
