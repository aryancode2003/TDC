import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedDatabase } from './database/seeds/initial-seed';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('🚀 Starting standalone database seeding script...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const dataSource = app.get(DataSource);
  try {
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
