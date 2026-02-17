import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// Manually load .env variables for the CLI
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});