// src/config/database.js (temporary - without Prisma)
// This is a temporary mock until Prisma is fixed

console.log(' Using mock database config - Prisma not available');

// Mock database functions
const prisma = {
  user: {
    findUnique: async () => null,
    findFirst: async () => null,
    create: async (data) => ({ ...data.data, id: 1 }),
    update: async (data) => data.data,
    findMany: async () => []
  },
  movie: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async (data) => ({ ...data.data }),
    update: async (data) => data.data,
    delete: async () => ({})
  },
  watchlist: {
    findMany: async () => [],
    create: async (data) => ({ ...data.data, id: 1 }),
    delete: async () => ({}),
    findUnique: async () => null
  },
  favorite: {
    findMany: async () => [],
    create: async (data) => ({ ...data.data, id: 1 }),
    delete: async () => ({}),
    findUnique: async () => null
  },
  review: {
    findMany: async () => [],
    upsert: async ({ create, update }) => ({ ...create, ...update }),
    findUnique: async () => null,
    delete: async () => ({})
  },
  $connect: async () => console.log('Mock DB connected'),
  $disconnect: async () => console.log('Mock DB disconnected')
};

const connectDB = async () => {
  console.log(' Mock database ready');
  return true;
};

const disconnectDB = async () => {
  console.log(' Mock database disconnected');
};

module.exports = { prisma, connectDB, disconnectDB };

