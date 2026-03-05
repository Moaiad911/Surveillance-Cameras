const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const UserModel = require('../infrastructure/models/UserModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const existing = await UserModel.findOne({ username: 'admin' });
        if (existing) {
            console.log('ℹ️  Admin user already exists');
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash('admin123', 10);

        await UserModel.create({
            username: 'admin',
            passwordHash,
            role: 'Admin'
        });

        console.log('✅ Admin user created successfully');
        console.log('👤 Username: admin');
        console.log('🔑 Password: admin123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

createAdmin();
