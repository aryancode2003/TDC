/**
 * User Repository - Data access layer for User entity
 * Implements Repository pattern for database operations
 */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between } from 'typeorm';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.phone = :phone', { phone })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  /**
   * Find user by id with roles
   */
  async findByIdWithRoles(userId: string): Promise<User | null> {
    return this.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });
  }

  /**
   * Find active users by type
   */
  async findByUserType(userType: string, skip = 0, take = 10): Promise<[User[], number]> {
    return this.findAndCount({
      where: { userType: userType as any, isActive: true },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string, skip = 0, take = 10): Promise<[User[], number]> {
    const qb = this.createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .andWhere('user.isActive = :isActive', { isActive: true })
      .andWhere(
        '(user.email ILIKE :query OR user.firstName ILIKE :query OR user.lastName ILIKE :query)',
        { query: `%${query}%` },
      )
      .skip(skip)
      .take(take)
      .orderBy('user.createdAt', 'DESC');

    return qb.getManyAndCount();
  }

  /**
   * Find by email or phone
   */
  async findByEmailOrPhone(email: string, phone: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .andWhere('(user.email = :email OR user.phone = :phone)', { email, phone })
      .leftJoinAndSelect('user.role', 'role')
      .getOne();
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    const query = this.createQueryBuilder('user').where('user.email = :email', { email });
    if (excludeUserId) {
      query.andWhere('user.id != :userId', { userId: excludeUserId });
    }
    query.andWhere('user.deletedAt IS NULL');
    const count = await query.getCount();
    return count > 0;
  }

  /**
   * Check if phone exists
   */
  async phoneExists(phone: string, excludeUserId?: string): Promise<boolean> {
    const query = this.createQueryBuilder('user').where('user.phone = :phone', { phone });
    if (excludeUserId) {
      query.andWhere('user.id != :userId', { userId: excludeUserId });
    }
    query.andWhere('user.deletedAt IS NULL');
    const count = await query.getCount();
    return count > 0;
  }

  /**
   * Get users count by type
   */
  async countByUserType(userType: string): Promise<number> {
    return this.count({
      where: { userType: userType as any, isActive: true },
    });
  }

  /**
   * Soft delete user
   */
  async softDeleteUser(userId: string): Promise<void> {
    await this.update(userId, {
      isActive: false,
      deletedAt: new Date(),
    });
  }

  /**
   * Restore soft-deleted user
   */
  async restoreUser(userId: string): Promise<void> {
    await this.update(userId, {
      isActive: true,
      deletedAt: undefined,
    });
  }

  /**
   * Update password (already hashed)
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.update(userId, {
      passwordHash: hashedPassword,
    });
  }

  /**
   * Mark email as verified
   */
  async markEmailVerified(userId: string): Promise<void> {
    await this.update(userId, {
      emailVerified: true,
    });
  }

  /**
   * Mark phone as verified
   */
  async markPhoneVerified(userId: string): Promise<void> {
    await this.update(userId, {
      phoneVerified: true,
    });
  }

  /**
   * Get active providers count
   */
  async getActiveProvidersCount(): Promise<number> {
    return this.count({
      where: { userType: 'provider', isActive: true },
    });
  }

  /**
   * Get active customers count
   */
  async getActiveCustomersCount(): Promise<number> {
    return this.count({
      where: { userType: 'customer', isActive: true },
    });
  }

  /**
   * Find users created after date (for analytics)
   */
  async findByCreatedDateRange(startDate: Date, endDate: Date, skip = 0, take = 10): Promise<[User[], number]> {
    return this.findAndCount({
      where: {
        createdAt: Between(startDate, endDate),
      },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }
}
