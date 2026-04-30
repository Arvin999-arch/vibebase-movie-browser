// backend/src/utils/userStorage.js
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../../data/users.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Read users from file
const readUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

// Write users to file
const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users:', error);
  }
};

// Find user by email
const findUserByEmail = (email) => {
  const users = readUsers();
  return users.find(u => u.email === email.toLowerCase());
};

// Find user by username
const findUserByUsername = (username) => {
  const users = readUsers();
  return users.find(u => u.username === username.toLowerCase());
};

// Find user by id
const findUserById = (id) => {
  const users = readUsers();
  return users.find(u => u.id === id);
};

// Create new user
const createUser = (userData) => {
  const users = readUsers();
  const newUser = {
    id: users.length + 1,
    ...userData,
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null
  };
  users.push(newUser);
  writeUsers(users);
  return newUser;
};

// Update user
const updateUser = (id, updates) => {
  const users = readUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    writeUsers(users);
    return users[index];
  }
  return null;
};

// Get all users
const getAllUsers = () => {
  const users = readUsers();
  return users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }));
};

module.exports = {
  readUsers,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  updateUser,
  getAllUsers
};