/**
 * Users Service
 * Handles user management business logic
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserDto, UserResponseDto, UserListResponseDto } from './dto/user.dto';
import { PaginationDto, createPaginatedResponse } from '../common/dto/pagination.dto';
import { IsNull } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByIdWithRoles(userId);
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return this.mapToResponseDto(user);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.mapToResponseDto(user) : null;
  }

  /**
   * List all users with pagination
   */
  async listUsers(pagination: PaginationDto) {
    const skip = ((pagination.page || 1) - 1) * (pagination.limit || 10);
    const take = pagination.limit || 10;

    const [users, total] = await this.userRepository.findAndCount({
      where: { deletedAt: IsNull() },
      skip,
      take,
      order: { createdAt: 'DESC' as any },
    });

    const usersDto = users.map((user) => this.mapToListResponseDto(user));
    return createPaginatedResponse(usersDto, total, pagination.page || 1, take);
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string, pagination: PaginationDto) {
    const skip = ((pagination.page || 1) - 1) * (pagination.limit || 10);
    const take = pagination.limit || 10;

    const [users, total] = await this.userRepository.searchUsers(query, skip, take);

    const usersDto = users.map((user) => this.mapToListResponseDto(user));
    return createPaginatedResponse(usersDto, total, pagination.page || 1, take);
  }

  /**
   * Get users by type (customer, provider, admin)
   */
  async getUsersByType(userType: string, pagination: PaginationDto) {
    const skip = ((pagination.page || 1) - 1) * (pagination.limit || 10);
    const take = pagination.limit || 10;

    const [users, total] = await this.userRepository.findByUserType(userType, skip, take);

    const usersDto = users.map((user) => this.mapToListResponseDto(user));
    return createPaginatedResponse(usersDto, total, pagination.page || 1, take);
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Check if email is being changed and already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userRepository.emailExists(updateUserDto.email, userId);
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    // Check if phone is being changed and already exists
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const phoneExists = await this.userRepository.phoneExists(updateUserDto.phone, userId);
      if (phoneExists) {
        throw new ConflictException('Phone already in use');
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return this.mapToResponseDto(updatedUser);
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    await this.userRepository.softDeleteUser(userId);
  }

  /**
   * Activate user account
   */
  async activateUser(userId: string): Promise<void> {
    await this.userRepository.restoreUser(userId);
  }

  /**
   * Get active users count
   */
  async getActiveUsersCount(): Promise<number> {
    return this.userRepository.count({
      where: { isActive: true, deletedAt: IsNull() },
    });
  }

  /**
   * Get active providers count
   */
  async getActiveProvidersCount(): Promise<number> {
    return this.userRepository.getActiveProvidersCount();
  }

  /**
   * Get active customers count
   */
  async getActiveCustomersCount(): Promise<number> {
    return this.userRepository.getActiveCustomersCount();
  }

  /**
   * Map User entity to response DTO
   */
  private mapToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      avatar: user.avatar,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Map User entity to list response DTO
   */
  private mapToListResponseDto(user: any): UserListResponseDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
