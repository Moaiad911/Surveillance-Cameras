const UserModel = require('../models/User');
const User = require("../entities/User");
const { IUserRepository } = require('../interface/IUserRepository');

class MongoUserRepository extends IUserRepository {

    toEntity(doc) {
        return new User(
            doc._id.toString(),
            doc.username,
            doc.passwordHash,
            doc.role
        );
    }

    async findById(id) {
        const doc = await UserModel.findById(id);
        return doc ? this.toEntity(doc) : null;
    }

    async findByUsername(username) {
        const doc = await UserModel.findOne({ username });
        return doc ? this.toEntity(doc) : null;
    }

    async findAll() {
        const docs = await UserModel.find();
        return docs.map(doc => this.toEntity(doc));
    }

    async create(user) {
        const doc = await UserModel.create(user);
        return this.toEntity(doc);
    }

    async update(id, user) {
        const doc = await UserModel.findByIdAndUpdate(id, user, { new: true });
        return doc ? this.toEntity(doc) : null;
    }

    async delete(id) {
        await UserModel.findByIdAndDelete(id);
    }
}

module.exports = { MongoUserRepository };
