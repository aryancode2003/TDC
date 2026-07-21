import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedDatabase } from './database/seeds/initial-seed';
import { DataSource } from 'typeorm';
// @ts-ignore
import { Client } from 'pg';
import * as dotenv from 'dotenv';

async function bootstrap() {
  console.log('🚀 Starting standalone database seeding script...');
  
  // Load environment variables from local .env
  dotenv.config();
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not defined!');
    process.exit(1);
  }

  console.log('🗑️ Resetting database schema (drop & recreate public schema)...');
  
  // Connect via raw pg client to clear the database BEFORE NestJS boots
  const isProduction = process.env.NODE_ENV === 'production';
  const client = new Client({
    connectionString: databaseUrl,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ Database schema reset completed successfully!');
  } catch (error) {
    console.error('❌ Failed to reset database schema:', error);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Now boot the NestJS application context with a clean slate
  console.log('🔄 Initializing NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const dataSource = app.get(DataSource);
  try {
    console.log('Loaded entities in DataSource:', dataSource.entityMetadatas.map(m => m.name));
    console.log('🔄 Synchronizing database schema with entities...');
    await dataSource.synchronize();
    console.log('✅ Schema synchronized successfully! Seeding data...');
    await seedDatabase(dataSource);
    console.log('✨ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
