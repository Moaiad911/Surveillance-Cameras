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
}
