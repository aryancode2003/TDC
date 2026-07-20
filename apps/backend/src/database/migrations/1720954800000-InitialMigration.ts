import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial Migration
 * Creates all base tables for The DABBA Company platform
 * Generated: 2026-07-14
 */
export class InitialMigration1720954800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "public"."user_type_enum" AS ENUM('customer', 'provider', 'admin')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."role_type_enum" AS ENUM('super_admin', 'admin', 'support', 'finance', 'partner', 'partner_manager', 'delivery', 'customer')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."verification_status_enum" AS ENUM('pending', 'approved', 'rejected', 'suspended', 'blacklisted')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."subscription_status_enum" AS ENUM('active', 'paused', 'cancelled', 'completed')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."order_status_enum" AS ENUM('pending', 'confirmed', 'prepared', 'dispatched', 'delivered', 'cancelled')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'completed', 'failed', 'refunded')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."payment_method_enum" AS ENUM('upi', 'card', 'netbanking', 'wallet')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."meal_type_enum" AS ENUM('veg', 'non-veg', 'jain')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."specialization_enum" AS ENUM('normal', 'healthy', 'gym', 'diet')
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar UNIQUE NOT NULL,
        "phone" varchar UNIQUE,
        "passwordHash" varchar,
        "firstName" varchar,
        "lastName" varchar,
        "avatar" varchar,
        "userType" "user_type_enum" NOT NULL,
        "roleId" uuid NOT NULL,
        "phoneVerified" boolean DEFAULT false,
        "emailVerified" boolean DEFAULT false,
        "twoFactorEnabled" boolean DEFAULT false,
        "twoFactorSecret" varchar,
        "isActive" boolean DEFAULT true,
        "lastLoginAt" timestamp,
        "metadata" jsonb DEFAULT '{}',
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    // Create indexes for users
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email") WHERE "deletedAt" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_users_phone" ON "users" ("phone") WHERE "deletedAt" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_users_userType" ON "users" ("userType")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_roleId" ON "users" ("roleId")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_createdAt" ON "users" ("createdAt")`);

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar UNIQUE NOT NULL,
        "description" varchar NOT NULL,
        "type" "role_type_enum" NOT NULL,
        "isActive" boolean DEFAULT true,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_roles_name" ON "roles" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_roles_type" ON "roles" ("type")`);

    // Create permissions table
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "description" varchar NOT NULL,
        "resource" varchar NOT NULL,
        "action" varchar NOT NULL,
        "isActive" boolean DEFAULT true,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_permissions_resource_action" ON "permissions" ("resource", "action")`);

    // Create role_permissions table
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "roleId" uuid NOT NULL,
        "permissionId" uuid NOT NULL,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp,
        UNIQUE("roleId", "permissionId")
      )
    `);

    // Create customers table
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid UNIQUE NOT NULL,
        "totalSubscriptions" integer DEFAULT 0,
        "activeSubscriptions" integer DEFAULT 0,
        "totalSpent" float DEFAULT 0,
        "avgRating" float DEFAULT 0,
        "totalReviews" integer DEFAULT 0,
        "preferredProviderId" uuid,
        "preferences" jsonb DEFAULT '{}',
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    // Create providers table
    await queryRunner.query(`
      CREATE TABLE "providers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid UNIQUE NOT NULL,
        "businessName" varchar NOT NULL,
        "businessLogo" varchar,
        "businessBanner" varchar,
        "description" text,
        "gstNumber" varchar NOT NULL,
        "panNumber" varchar NOT NULL,
        "fssaiNumber" varchar NOT NULL,
        "verificationStatus" "verification_status_enum" DEFAULT 'pending',
        "avgRating" float DEFAULT 0,
        "totalReviews" integer DEFAULT 0,
        "mealsDelivered" integer DEFAULT 0,
        "yearsActive" integer DEFAULT 0,
        "commissionRate" float DEFAULT 15,
        "activeSubscribers" integer DEFAULT 0,
        "totalSubscriptions" integer DEFAULT 0,
        "bankDetails" jsonb DEFAULT '{}',
        "verificationDocuments" jsonb DEFAULT '{}',
        "isActive" boolean DEFAULT true,
        "approvedAt" timestamp,
        "metadata" jsonb DEFAULT '{}',
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_providers_userId" ON "providers" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_providers_verificationStatus" ON "providers" ("verificationStatus")`);
    await queryRunner.query(`CREATE INDEX "IDX_providers_avgRating" ON "providers" ("avgRating")`);
    await queryRunner.query(`CREATE INDEX "IDX_providers_activeSubscribers" ON "providers" ("activeSubscribers")`);
    await queryRunner.query(`CREATE INDEX "IDX_providers_createdAt" ON "providers" ("createdAt")`);

    // Create addresses table
    await queryRunner.query(`
      CREATE TABLE "addresses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" varchar NOT NULL,
        "street" varchar NOT NULL,
        "locality" varchar NOT NULL,
        "city" varchar NOT NULL,
        "state" varchar NOT NULL,
        "pincode" varchar NOT NULL,
        "latitude" numeric(10,8),
        "longitude" numeric(11,8),
        "isDefault" boolean DEFAULT false,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_addresses_userId" ON "addresses" ("userId")`);

    // Create meal_categories table
    await queryRunner.query(`
      CREATE TABLE "meal_categories" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "providerId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "displayOrder" integer DEFAULT 0,
        "isActive" boolean DEFAULT true,
        "isSystemDefault" boolean DEFAULT false,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_meal_categories_providerId_isActive" ON "meal_categories" ("providerId", "isActive")`);

    // Create meals table
    await queryRunner.query(`
      CREATE TABLE "meals" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "providerId" uuid NOT NULL,
        "categoryId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "imageUrl" varchar,
        "type" "meal_type_enum" DEFAULT 'veg',
        "specialization" "specialization_enum" DEFAULT 'normal',
        "price" float NOT NULL,
        "calorieCount" integer DEFAULT 0,
        "preparationTime" float DEFAULT 0,
        "servings" integer DEFAULT 0,
        "displayOrder" integer DEFAULT 0,
        "isAvailable" boolean DEFAULT true,
        "nutrients" jsonb DEFAULT '{}',
        "allergens" jsonb DEFAULT '[]',
        "ingredients" jsonb DEFAULT '[]',
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_meals_providerId_categoryId" ON "meals" ("providerId", "categoryId")`);
    await queryRunner.query(`CREATE INDEX "IDX_meals_type" ON "meals" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_meals_createdAt" ON "meals" ("createdAt")`);

    // Create subscription_plans table
    await queryRunner.query(`
      CREATE TABLE "subscription_plans" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "providerId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "planType" varchar NOT NULL,
        "durationDays" integer NOT NULL,
        "basePrice" float NOT NULL,
        "discountPercentage" float DEFAULT 0,
        "deliveryCharges" float DEFAULT 0,
        "packagingCharges" float DEFAULT 0,
        "depositAmount" float DEFAULT 0,
        "taxPercentage" float DEFAULT 0,
        "totalMeals" integer DEFAULT 0,
        "includedCategories" jsonb DEFAULT '{}',
        "isActive" boolean DEFAULT true,
        "displayOrder" integer DEFAULT 0,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_subscription_plans_providerId_isActive" ON "subscription_plans" ("providerId", "isActive")`);

    // Continue with more tables in subsequent steps...
    console.log('✅ Initial migration created base tables');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_plans" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meals" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meal_categories" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "addresses" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "providers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "public"."user_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."role_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."verification_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payment_method_enum"`);
    await queryRunner.query(`DROP TYPE "public"."meal_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."specialization_enum"`);
  }
}
