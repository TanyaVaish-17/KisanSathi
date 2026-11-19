import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.NODE_ENV = "test";

let mongo;

// Start a throwaway MongoDB in memory so tests never touch the real database
export const startDB = async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await mongoose.connection.syncIndexes();
};

export const clearDB = async () => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((c) => c.deleteMany({})));
};

export const stopDB = async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
};
