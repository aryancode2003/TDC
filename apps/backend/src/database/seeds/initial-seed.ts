/**
 * Database Seed Data
 * Used for development and testing
 * Run: npm run db:seed
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Import entities
import {
  User,
  Role,
  Permission,
  RolePermission,
  Provider,
  Customer,
  MealCategory,
  Meal,
  SubscriptionPlan,
  Address,
  ServiceArea,
  DeliverySlot,
  SystemSetting,
  Waitlist,
} from '../entities';

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  console.log('🌱 Seeding database...');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    // 1. Seed Roles
    console.log('📋 Seeding roles...');
    const roleRepository = dataSource.getRepository(Role);
    const superAdminRole = roleRepository.create({
      name: 'Super Admin',
      description: 'Platform super administrator',
      type: 'super_admin',
      isActive: true,
    });
    const partnerRole = roleRepository.create({
      name: 'Partner',
      description: 'Tiffin service provider',
      type: 'partner',
      isActive: true,
    });
    const customerRole = roleRepository.create({
      name: 'Customer',
      description: 'Platform customer',
      type: 'customer',
      isActive: true,
    });

    await roleRepository.save([superAdminRole, partnerRole, customerRole]);

    // 2. Seed Permissions
    console.log('📝 Seeding permissions...');
    const permissionRepository = dataSource.getRepository(Permission);
    const permissions = [
      // User permissions
      { name: 'Create User', resource: 'users', action: 'create' },
      { name: 'Read User', resource: 'users', action: 'read' },
      { name: 'Update User', resource: 'users', action: 'update' },
      { name: 'Delete User', resource: 'users', action: 'delete' },

      // Provider permissions
      { name: 'Create Provider', resource: 'providers', action: 'create' },
      { name: 'Read Provider', resource: 'providers', action: 'read' },
      { name: 'Update Provider', resource: 'providers', action: 'update' },
      { name: 'Manage Menu', resource: 'menus', action: 'manage' },

      // Order permissions
      { name: 'Create Order', resource: 'orders', action: 'create' },
      { name: 'Read Order', resource: 'orders', action: 'read' },
      { name: 'Cancel Order', resource: 'orders', action: 'cancel' },

      // Payment permissions
      { name: 'Process Payment', resource: 'payments', action: 'process' },
      { name: 'View Payment', resource: 'payments', action: 'read' },
      { name: 'Refund Payment', resource: 'payments', action: 'refund' },

      // Admin permissions
      { name: 'Approve Provider', resource: 'admin', action: 'approve_provider' },
      { name: 'Manage Settings', resource: 'admin', action: 'manage_settings' },
      { name: 'View Analytics', resource: 'admin', action: 'view_analytics' },
    ];

    const permissionEntities = permissions.map((p) =>
      permissionRepository.create({
        ...p,
        description: `${p.name} permission`,
        isActive: true,
      }),
    );

    const savedPermissions = await permissionRepository.save(permissionEntities);

    // 3. Link permissions to roles (simplified)
    console.log('🔗 Linking permissions to roles...');
    const rolePermissionRepository = dataSource.getRepository(RolePermission);
    const rolePermissions = [];

    // Super admin gets all permissions
    for (const permission of savedPermissions) {
      rolePermissions.push(
        rolePermissionRepository.create({
          roleId: superAdminRole.id,
          permissionId: permission.id,
        }),
      );
    }

    // Partner gets provider-related permissions
    const partnerPermissions = savedPermissions.filter((p) =>
      ['providers', 'menus', 'orders', 'payments'].includes(p.resource),
    );
    for (const permission of partnerPermissions) {
      rolePermissions.push(
        rolePermissionRepository.create({
          roleId: partnerRole.id,
          permissionId: permission.id,
        }),
      );
    }

    // Customer gets order and payment permissions
    const customerPermissions = savedPermissions.filter((p) =>
      ['orders', 'payments'].includes(p.resource),
    );
    for (const permission of customerPermissions) {
      rolePermissions.push(
        rolePermissionRepository.create({
          roleId: customerRole.id,
          permissionId: permission.id,
        }),
      );
    }

    await rolePermissionRepository.save(rolePermissions);

    // 4. Seed Admin User
    console.log('👤 Seeding admin user...');
    const userRepository = dataSource.getRepository(User);
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const adminUser = userRepository.create({
      email: 'admin@thedabbacompany.com',
      phone: '+919999999999',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      userType: 'admin',
      roleId: superAdminRole.id,
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
    });

    await userRepository.save(adminUser);

    // 5. Seed Sample Providers
    console.log('🍛 Seeding sample providers...');
    const providerRepository = dataSource.getRepository(Provider);

    const sampleProviders = [
      {
        name: 'North Indian Tiffin Service',
        business: 'North Indian Tiffin Service',
        city: 'Bangalore',
        pincode: '560001',
      },
      {
        name: 'South Indian Meals',
        business: 'South Indian Meals Daily',
        city: 'Bangalore',
        pincode: '560002',
      },
      {
        name: 'Healthy Gym Meals',
        business: 'FitFood Tiffin Service',
        city: 'Bangalore',
        pincode: '560003',
      },
    ];

    for (const providerData of sampleProviders) {
      const providerUser = userRepository.create({
        email: `provider${providerData.name.toLowerCase().replace(/\s/g, '')}@thedabbacompany.com`,
        phone: `+9198${Math.floor(Math.random() * 10000000000)}`,
        passwordHash: await bcrypt.hash('Provider@123', 10),
        firstName: providerData.name.split(' ')[0],
        lastName: 'Provider',
        userType: 'provider',
        roleId: partnerRole.id,
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
      });

      const savedUser = await userRepository.save(providerUser);

      const provider = providerRepository.create({
        userId: savedUser.id,
        businessName: providerData.business,
        description: `Quality ${providerData.name} service in ${providerData.city}`,
        gstNumber: `18AABCT${Math.floor(Math.random() * 100000)}`,
        panNumber: `AABCT${Math.floor(Math.random() * 100000)}`,
        fssaiNumber: `10019011${Math.floor(Math.random() * 1000000)}`,
        verificationStatus: 'approved',
        avgRating: 4.5,
        totalReviews: Math.floor(Math.random() * 500),
        mealsDelivered: Math.floor(Math.random() * 10000),
        yearsActive: Math.floor(Math.random() * 5) + 1,
        commissionRate: 15,
        activeSubscribers: Math.floor(Math.random() * 200),
        isActive: true,
        approvedAt: new Date(),
        bankDetails: {
          accountHolder: providerData.business,
          accountNumber: `1234${Math.floor(Math.random() * 1000000000)}`,
          ifsc: 'SBIN0001234',
          bank: 'State Bank of India',
        },
      });

      await providerRepository.save(provider);

      // Add service areas
      const serviceAreaRepository = dataSource.getRepository(ServiceArea);
      await serviceAreaRepository.save({
        providerId: provider.id,
        pincode: providerData.pincode,
        city: providerData.city,
        state: 'Karnataka',
        locality: 'Koramangala',
        isActive: true,
      });

      // Add meal categories
      const mealCategoryRepository = dataSource.getRepository(MealCategory);
      const categories = [
        {
          name: 'Breakfast',
          isSystemDefault: true,
        },
        {
          name: 'Lunch',
          isSystemDefault: true,
        },
        {
          name: 'Dinner',
          isSystemDefault: true,
        },
      ];

      const savedCategories = await mealCategoryRepository.save(
        categories.map((c) =>
          mealCategoryRepository.create({
            providerId: provider.id,
            ...c,
            isActive: true,
          }),
        ),
      );

      // Add sample meals
      const mealRepository = dataSource.getRepository(Meal);
      const sampleMeals = [
        {
          categoryId: savedCategories[0].id,
          name: 'Idli Sambhar',
          type: 'veg',
          price: 80,
          isAvailable: true,
        },
        {
          categoryId: savedCategories[1].id,
          name: 'Chicken Biryani',
          type: 'non-veg',
          price: 150,
          isAvailable: true,
        },
        {
          categoryId: savedCategories[2].id,
          name: 'Paneer Butter Masala',
          type: 'veg',
          price: 120,
          isAvailable: true,
        },
      ];

      await mealRepository.save(
        sampleMeals.map((m) =>
          mealRepository.create({
            providerId: provider.id,
            ...m,
            description: `Delicious ${m.name}`,
            specialization: 'normal',
          }),
        ),
      );

      // Add subscription plans
      const planRepository = dataSource.getRepository(SubscriptionPlan);
      await planRepository.save([
        planRepository.create({
          providerId: provider.id,
          name: 'Weekly Plan',
          planType: 'weekly',
          durationDays: 7,
          basePrice: 700,
          totalMeals: 21,
          isActive: true,
        }),
        planRepository.create({
          providerId: provider.id,
          name: 'Monthly Plan',
          planType: 'monthly',
          durationDays: 30,
          basePrice: 2500,
          totalMeals: 90,
          isActive: true,
        }),
      ]);

      // Add delivery slots
      const deliverySlotRepository = dataSource.getRepository(DeliverySlot);
      await deliverySlotRepository.save([
        deliverySlotRepository.create({
          providerId: provider.id,
          mealType: 'breakfast',
          startTime: '07:00',
          endTime: '09:00',
          maxCapacity: 50,
          isActive: true,
          serviceDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
          },
        }),
        deliverySlotRepository.create({
          providerId: provider.id,
          mealType: 'lunch',
          startTime: '12:00',
          endTime: '14:00',
          maxCapacity: 100,
          isActive: true,
          serviceDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: false,
          },
        }),
      ]);
    }

    // 6. Seed Sample Customers
    console.log('👥 Seeding sample customers...');
    const customerRepository = dataSource.getRepository(Customer);

    for (let i = 1; i <= 5; i++) {
      const customerUser = userRepository.create({
        email: `customer${i}@example.com`,
        phone: `+9198${Math.floor(Math.random() * 10000000000)}`,
        passwordHash: await bcrypt.hash('Customer@123', 10),
        firstName: `Customer${i}`,
        lastName: 'User',
        userType: 'customer',
        roleId: customerRole.id,
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
      });

      const savedUser = await userRepository.save(customerUser);

      const customer = customerRepository.create({
        userId: savedUser.id,
        totalSubscriptions: Math.floor(Math.random() * 5),
        activeSubscriptions: Math.floor(Math.random() * 3),
        totalSpent: Math.floor(Math.random() * 50000),
        avgRating: Math.random() * 5,
        totalReviews: Math.floor(Math.random() * 20),
      });

      await customerRepository.save(customer);

      // Add address
      const addressRepository = dataSource.getRepository(Address);
      await addressRepository.save({
        userId: savedUser.id,
        type: 'home',
        street: `${Math.floor(Math.random() * 1000)}, Main Street`,
        locality: 'Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        isDefault: true,
      });
    }

    // 7. Seed System Settings
    console.log('⚙️ Seeding system settings...');
    const settingRepository = dataSource.getRepository(SystemSetting);
    await settingRepository.save([
      settingRepository.create({
        key: 'platform_commission',
        value: 15,
        category: 'payment',
        description: 'Default platform commission percentage',
        dataType: 'number',
        isPublic: false,
      }),
      settingRepository.create({
        key: 'refund_policy_days',
        value: 7,
        category: 'policy',
        description: 'Number of days for refund policy',
        dataType: 'number',
        isPublic: true,
      }),
      settingRepository.create({
        key: 'min_order_amount',
        value: 100,
        category: 'payment',
        description: 'Minimum order amount in rupees',
        dataType: 'number',
        isPublic: true,
      }),
      settingRepository.create({
        key: 'enable_referral_program',
        value: true,
        category: 'general',
        description: 'Enable referral program',
        dataType: 'boolean',
        isPublic: true,
      }),
    ]);

    // 8. Seed Waitlist
    console.log('📍 Seeding waitlist entries...');
    const waitlistRepository = dataSource.getRepository(Waitlist);
    await waitlistRepository.save([
      waitlistRepository.create({
        name: 'Rohan Sharma',
        phone: '+919876543210',
        email: 'rohan@example.com',
        pincode: '400076',
        city: 'Powai, Mumbai',
        state: 'Maharashtra',
        preferredMealType: 'all',
        status: 'pending',
      }),
      waitlistRepository.create({
        name: 'Priya Patel',
        phone: '+918765432109',
        email: 'priya@example.com',
        pincode: '400076',
        city: 'Powai, Mumbai',
        state: 'Maharashtra',
        preferredMealType: 'lunch',
        status: 'pending',
      }),
      waitlistRepository.create({
        name: 'Amit Patel',
        phone: '+917654321098',
        email: 'amit@example.com',
        pincode: '400092',
        city: 'Borivali, Mumbai',
        state: 'Maharashtra',
        preferredMealType: 'dinner',
        status: 'pending',
      }),
      waitlistRepository.create({
        name: 'Anjali Desai',
        phone: '+916543210987',
        email: 'anjali@example.com',
        pincode: '400013',
        city: 'Lower Parel, Mumbai',
        state: 'Maharashtra',
        preferredMealType: 'all',
        status: 'notified',
        notifiedAt: new Date(),
      }),
    ]);

    await queryRunner.commitTransaction();
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
