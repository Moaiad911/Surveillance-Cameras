const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('❌ Admin user already exists!');
            process.exit(1);
        }

        // Create admin user
        const password = 'admin123'; // Default password - change this!
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const admin = new User({
            username: 'admin',
            passwordHash: passwordHash,
            role: 'Admin'
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('📝 Username: admin');
        console.log('🔑 Password: admin123');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
