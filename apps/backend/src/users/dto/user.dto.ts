/**
 * User DTOs - Data Transfer Objects for user management
 */

export class CreateUserDto {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  userType: 'customer' | 'provider' | 'admin';
  avatar?: string;
  password?: string;
}

export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
}

export class UserResponseDto {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  userType: string;
  avatar?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserListResponseDto {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  userType: string;
  isActive: boolean;
  createdAt: Date;
}

export class AssignRoleDto {
  roleId: string;
  userId: string;
}

export class RemoveRoleDto {
  roleId: string;
  userId: string;
}
