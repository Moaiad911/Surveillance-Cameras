const UserModel = require('../models/UserModel');
const IUserRepository = require('../../domain/repositories/IUserRepository');

class UserRepository extends IUserRepository {
    async findById(id) {
        return await UserModel.findById(id);
    }

    async findByUsername(username) {
        return await UserModel.findOne({ username });
    }

    async create(userData) {
        const user = new UserModel(userData);
        return await user.save();
    }

    async update(id, userData) {
        return await UserModel.findByIdAndUpdate(id, userData, { new: true });
    }

    async delete(id) {
        return await UserModel.findByIdAndDelete(id);
    }

    async findAll() {
        return await UserModel.find({}, { passwordHash: 0 });
    }
}

module.exports = UserRepository;
