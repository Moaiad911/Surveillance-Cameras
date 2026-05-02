const UserModel = require('../../infrastructure/models/UserModel');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (role) updateData.role = role;
    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await UserModel.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUsers, deleteUser, updateUser };
