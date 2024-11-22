import dotenv from 'dotenv';
dotenv.config();

const {
  MONGODB_URL,
} = process.env;

if (!MONGODB_URL) {
  throw new Error('Missing MONGODB_URL environment variable');
}
 
export const mongoDbUrl = MONGODB_URL;
 