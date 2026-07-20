import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { User } from '../database/entities/user.entity';

/**
 * Users Module
 * Manages user accounts, profiles, roles, and permissions
 * - User registration and management
 * - User profiles (customer, provider, admin)
 * - Role-based access control (RBAC)
 * - Permission management
 * - User settings and preferences
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
