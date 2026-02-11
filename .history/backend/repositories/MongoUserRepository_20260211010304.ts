// src/repositories/MongoUserRepository.ts
const UserModel = require('../models/User');
import { IUserRepository } from "../interfaces/IUserRepository";
import { User } from "../entities/User";

export class MongoUserRepository implements IUserRepository {

    private toEntity(doc: any): User {
        return new User(
            doc._id.toString(),
            doc.username,
            doc.passwordHash,
            doc.role,
            doc.createdAt,
            doc.updatedAt
        );
    }

    async findById(id: string): Promise<User | null> {
        const doc = await UserModel.findById(id);
        return doc ? this.toEntity(doc) : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const doc = await UserModel.findOne({ username });
        return doc ? this.toEntity(doc) : null;
    }

    async findAll(): Promise<User[]> {
        const docs = await UserModel.find();
        return docs.map(this.toEntity);
    }

    async create(user: User): Promise<User> {
        const doc = await UserModel.create(user);
        return this.toEntity(doc);
    }

    async update(id: string, user: Partial<User>): Promise<User | null> {
        const doc = await UserModel.findByIdAndUpdate(id, user, { new: true });
        return doc ? this.toEntity(doc) : null;
    }

    async delete(id: string): Promise<void> {
        await UserModel.findByIdAndDelete(id);
    }
}
