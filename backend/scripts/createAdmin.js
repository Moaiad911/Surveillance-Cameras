const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Operator'], default: 'Operator' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  await mongoose.connect(MONGODB_URI, { dbName: 'graduation_project' });
  console.log('✅ Connected to MongoDB - DB:', mongoose.connection.db.databaseName);

  await User.deleteOne({ username: 'admin' });

  const passwordHash = await bcrypt.hash('Admin@1234', 10);
  await User.create({ username: 'admin', passwordHash, role: 'Admin' });

  console.log('✅ Admin created in graduation_project');
  console.log('👤 Username: admin');
  console.log('🔑 Password: Admin@1234');
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });
