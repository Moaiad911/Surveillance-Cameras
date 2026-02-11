// src/services/UserService.ts
import { IUserRepository } from "../interfaces/IUserRepository";
import { User } from "../entities/User";

export class UserService {
    constructor(private userRepo: IUserRepository) {}

    async getAllUsers(): Promise<User[]> {
        return this.userRepo.findAll();
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userRepo.findById(id);
    }

    async getUserByUsername(username: string): Promise<User | null> {
        return this.userRepo.findByUsername(username);
    }

    async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const user = new User('', data.username, data.passwordHash, data.role);
        return this.userRepo.create(user);
    }

    async updateUser(id: string, data: Partial<User>): Promise<User | null> {
        return this.userRepo.update(id, data);
    }

    async deleteUser(id: string): Promise<void> {
        return this.userRepo.delete(id);
    }
}
