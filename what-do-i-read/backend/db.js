const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

const connectDB = async () => {
  if (db) return db;
  try {
    await client.connect();
    db = client.db("What-Do-I-Read"); // Make sure "What-Do-I-Read" is your exact database name
    console.log("MongoDB connected successfully");
    return db;
  } catch (e) {
    console.error("Database connection failed:", e);
    process.exit(1);
  }
};

const getDB = () => {
    console.log("getDB called. The db variable is:", db); 
  if (!db) {
    throw new Error("Database not connected!");
  }
  return db;
};

module.exports = { connectDB, getDB };