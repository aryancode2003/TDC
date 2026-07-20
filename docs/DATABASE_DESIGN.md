# 🗄️ Database Design Documentation

## Overview

The DABBA Company uses **PostgreSQL 16** as the primary database with **TypeORM** as the ORM layer. The design follows enterprise database principles with:

- **Multi-tenancy support** via row-level security
- **ACID compliance** for financial transactions
- **Soft deletes** for data recovery
- **Audit logging** for compliance
- **Performance-optimized indexes**
- **Extensible JSON fields** for flexibility

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS DOMAIN                         │
├─────────────────────────────────────────────────────────────┤

users (Core User Account)
├── id: UUID (PK)
├── email: STRING (UNIQUE)
├── phone: STRING (UNIQUE)
├── passwordHash: STRING (nullable)
├── firstName, lastName: STRING
├── userType: ENUM [customer, provider, admin]
├── roleId: UUID (FK → roles)
├── emailVerified: BOOLEAN
├── phoneVerified: BOOLEAN
├── twoFactorEnabled: BOOLEAN
├── isActive: BOOLEAN
└── Timestamps: createdAt, updatedAt, deletedAt

roles (Access Control)
├── id: UUID (PK)
├── name: STRING (UNIQUE)
├── type: ENUM [super_admin, admin, support, finance, partner, ...]
├── description: STRING
└── isActive: BOOLEAN

permissions (Fine-grained Access)
├── id: UUID (PK)
├── name: STRING
├── resource: STRING
├── action: STRING
└── isActive: BOOLEAN

role_permissions (Junction)
├── roleId: UUID (FK → roles)
└── permissionId: UUID (FK → permissions)

┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS DOMAIN                        │
├─────────────────────────────────────────────────────────────┤

providers (Tiffin Service Businesses)
├── id: UUID (PK)
├── userId: UUID (FK → users, UNIQUE)
├── businessName: STRING
├── businessLogo, businessBanner: STRING
├── gstNumber, panNumber, fssaiNumber: STRING
├── verificationStatus: ENUM [pending, approved, rejected, suspended, blacklisted]
├── avgRating: FLOAT
├── totalReviews: INTEGER
├── mealsDelivered: INTEGER
├── commissionRate: FLOAT
├── activeSubscribers: INTEGER
├── bankDetails: JSONB
├── verificationDocuments: JSONB
├── approvedAt: TIMESTAMP
└── Indexes: verificationStatus, avgRating, activeSubscribers, createdAt

customers (End Users)
├── id: UUID (PK)
├── userId: UUID (FK → users, UNIQUE)
├── totalSubscriptions: INTEGER
├── activeSubscriptions: INTEGER
├── totalSpent: FLOAT
├── avgRating: FLOAT
├── totalReviews: INTEGER
├── preferredProviderId: UUID (FK → providers, nullable)
└── preferences: JSONB

┌─────────────────────────────────────────────────────────────┐
│                    LOCATION DOMAIN                          │
├─────────────────────────────────────────────────────────────┤

addresses (Customer Addresses)
├── id: UUID (PK)
├── userId: UUID (FK → users)
├── type: STRING [home, office, hostel, pg]
├── street, locality, city, state: STRING
├── pincode: STRING
├── latitude, longitude: DECIMAL
└── isDefault: BOOLEAN

service_areas (Provider Coverage)
├── id: UUID (PK)
├── providerId: UUID (FK → providers)
├── pincode: STRING
├── locality: STRING (nullable)
├── city, state: STRING
├── deliveryRadius: DECIMAL (km)
└── isActive: BOOLEAN
└── Indexes: pincode, city (for discovery)

delivery_slots (Delivery Windows)
├── id: UUID (PK)
├── providerId: UUID (FK → providers)
├── mealType: ENUM [breakfast, lunch, dinner]
├── startTime, endTime: TIME
├── maxCapacity, currentBookings: INTEGER
├── serviceDays: JSONB {monday: true, tuesday: true, ...}
└── isActive: BOOLEAN

kitchen_capacity (Meal Capacity Tracking)
├── id: UUID (PK)
├── providerId: UUID (FK → providers)
├── mealType: ENUM [breakfast, lunch, dinner]
├── date: DATE
├── maxCapacity, currentBookings: INTEGER
└── Indexes: (providerId, date), mealType (time-series)

┌─────────────────────────────────────────────────────────────┐
│                     MENU DOMAIN                             │
├─────────────────────────────────────────────────────────────┤

meal_categories (Meal Types)
├── id: UUID (PK)
├── providerId: UUID (FK → providers)
├── name: STRING [Breakfast, Lunch, Dinner, Custom, ...]
├── description: STRING (nullable)
├── displayOrder: INTEGER
├── isActive: BOOLEAN
└── isSystemDefault: BOOLEAN

meals (Individual Meal Items)
├── id: UUID (PK)
├── providerId: UUID (FK → providers)
├── categoryId: UUID (FK → meal_categories)
├── name: STRING
├── description: TEXT
├── imageUrl: STRING
├── type: ENUM [veg, non-veg, jain]
├── specialization: ENUM [normal, healthy, gym, diet]
├── price: FLOAT
├── calorieCount: INTEGER
├── preparationTime: FLOAT (minutes)
├── servings: INTEGER
├── isAvailable: BOOLEAN
├── nutrients: JSONB {protein: 20, carbs: 45, fat: 10, ...}
├── allergens: JSONB [gluten, dairy, ...]
└── ingredients: JSONB [tomato, onion, ...]

subscription_plans (Meal Plans)
├── id: UUID (PK)
├── providerId: UUID (FK → providers)
├── name: STRING
├── planType: ENUM [weekly, biweekly, monthly, quarterly, custom]
├── durationDays: INTEGER
├── basePrice: FLOAT
├── discountPercentage: FLOAT
├── deliveryCharges, packagingCharges: FLOAT
├── depositAmount, taxPercentage: FLOAT
├── totalMeals: INTEGER
├── includedCategories: JSONB {breakfast: true, lunch: true, dinner: false}
├── isActive: BOOLEAN
└── displayOrder: INTEGER

subscription_plan_meals (Meal Mapping)
├── id: UUID (PK)
├── planId: UUID (FK → subscription_plans)
├── mealId: UUID (FK → meals)
├── day: INTEGER [0-6]
└── quantity: INTEGER

┌─────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION DOMAIN                      │
├─────────────────────────────────────────────────────────────┤

subscriptions (Active Plans)
├── id: UUID (PK)
├── customerId: UUID (FK → customers)
├── providerId: UUID (FK → providers)
├── planId: UUID (FK → subscription_plans)
├── status: ENUM [active, paused, cancelled, completed]
├── startDate, endDate: DATE
├── totalPrice: FLOAT
├── paidAmount, remainingAmount: FLOAT
├── pausedUntil: TIMESTAMP
├── autoRenew: BOOLEAN
├── mealsDelivered, mealsMissed: INTEGER
├── mealType: ENUM [breakfast, lunch, dinner, multiple]
├── deliveryAddresses: JSONB {home: address_obj, office: address_obj}
├── preferences: JSONB {skipWeekends: true, ...}
└── Indexes: (customerId, providerId), status, (startDate, endDate)

orders (Daily Meal Orders)
├── id: UUID (PK)
├── subscriptionId: UUID (FK → subscriptions)
├── customerId: UUID (FK → customers)
├── providerId: UUID (FK → providers)
├── orderDate: DATE
├── deliveryDate: DATE
├── status: ENUM [pending, confirmed, prepared, dispatched, delivered, cancelled]
├── totalPrice: FLOAT
├── mealType: ENUM [breakfast, lunch, dinner]
├── items: JSONB [{mealId, name, price, quantity}, ...]
├── confirmationRequired: BOOLEAN
├── customerConfirmed: BOOLEAN
├── confirmedAt, cancelledAt, deliveredAt: TIMESTAMP
├── deliveryLatitude, deliveryLongitude: DECIMAL
└── Indexes: (subscriptionId, customerId, providerId), status, (orderDate, deliveryDate)

┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT DOMAIN                           │
├─────────────────────────────────────────────────────────────┤

payments (Transaction Records)
├── id: UUID (PK)
├── orderId: UUID (FK → orders, nullable)
├── subscriptionId: UUID (FK → subscriptions, nullable)
├── customerId: UUID (FK → customers)
├── providerId: UUID (FK → providers)
├── amount: FLOAT
├── status: ENUM [pending, completed, failed, refunded]
├── paymentMethod: ENUM [upi, card, netbanking, wallet]
├── razorpayOrderId: STRING
├── razorpayPaymentId: STRING
├── razorpaySignature: STRING
├── gatewayCharges: FLOAT
├── platformCommission: FLOAT
├── providerAmount: FLOAT
├── failureReason: STRING (nullable)
├── completedAt: TIMESTAMP
└── Indexes: (customerId, providerId), status, razorpayPaymentId, createdAt

wallets (Customer Wallet)
├── id: UUID (PK)
├── customerId: UUID (FK → customers, UNIQUE)
├── balance: FLOAT
├── totalCredits: FLOAT
├── totalRefunds: FLOAT
├── totalCashback: FLOAT
└── totalReferralBonus: FLOAT

wallet_transactions (Transaction History)
├── id: UUID (PK)
├── walletId: UUID (FK → wallets)
├── customerId: UUID (FK → customers)
├── type: ENUM [credit, debit, refund, cashback, referral]
├── amount: FLOAT
├── balanceBefore, balanceAfter: FLOAT
├── description: STRING
├── referenceId: UUID (payment/refund/referral ID)
└── Indexes: (customerId, walletId), type, createdAt

coupons (Discount Codes)
├── id: UUID (PK)
├── code: STRING (UNIQUE)
├── providerId: UUID (FK → providers, nullable)
├── discountType: ENUM [percentage, fixed]
├── discountValue: FLOAT
├── maxDiscount: FLOAT
├── minOrderAmount: FLOAT
├── validFrom, validUntil: DATE
├── usageLimit, usageCount: INTEGER
├── limitPerCustomer: INTEGER
├── isActive: BOOLEAN
├── applicableMealTypes: JSONB
└── applicableCategories: JSONB

┌─────────────────────────────────────────────────────────────┐
│                     REVIEW DOMAIN                           │
├─────────────────────────────────────────────────────────────┤

reviews (Customer Reviews)
├── id: UUID (PK)
├── customerId: UUID (FK → customers)
├── providerId: UUID (FK → providers)
├── orderId: UUID (FK → orders, nullable)
├── subscriptionId: UUID (FK → subscriptions, nullable)
├── foodRating: INTEGER [1-5]
├── tasteRating: INTEGER [1-5]
├── packagingRating: INTEGER [1-5]
├── deliveryRating: INTEGER [1-5]
├── quantityRating: INTEGER [1-5]
├── overallRating: INTEGER [1-5]
├── title, description: STRING
├── photos: JSONB []
├── videos: JSONB []
├── isVerifiedPurchase: BOOLEAN
├── helpfulCount: INTEGER
├── isVisible: BOOLEAN
└── Indexes: (customerId, providerId), overallRating, createdAt

┌─────────────────────────────────────────────────────────────┐
│                   SYSTEM DOMAIN                             │
├─────────────────────────────────────────────────────────────┤

notifications (Multi-channel Alerts)
├── id: UUID (PK)
├── userId: UUID (FK → users)
├── type: ENUM [order_confirmed, payment_success, promo, alert, ...]
├── title, description: STRING
├── actionUrl: STRING (nullable)
├── isRead: BOOLEAN
├── readAt: TIMESTAMP
├── channel: ENUM [push, sms, whatsapp, email, in_app]
├── isSent: BOOLEAN
├── sentAt: TIMESTAMP
└── Indexes: userId, type, isRead, createdAt

audit_logs (Action History)
├── id: UUID (PK)
├── userId: UUID (FK → users)
├── entityType: STRING
├── entityId: UUID
├── action: ENUM [CREATE, UPDATE, DELETE, APPROVE, REJECT]
├── changes: JSONB {field: {before: value, after: value}}
├── ipAddress: STRING
├── userAgent: STRING
└── Indexes: userId, (entityType, entityId), action, createdAt

system_settings (Configuration)
├── id: UUID (PK)
├── key: STRING (UNIQUE)
├── value: JSONB
├── category: STRING
├── description: STRING
├── dataType: ENUM [string, number, boolean, json]
├── isPublic: BOOLEAN
└── lastModifiedBy: UUID

referrals (Referral Program)
├── id: UUID (PK)
├── referrerId: UUID (FK → customers)
├── referredCustomerId: UUID (FK → customers)
├── bonusAmount: FLOAT
├── status: ENUM [pending, completed, claimed]
└── completedAt: TIMESTAMP

waitlist (Demand Tracking)
├── id: UUID (PK)
├── name, phone, email: STRING
├── pincode, city, state: STRING
├── preferredMealType: ENUM [breakfast, lunch, dinner, all]
├── status: ENUM [pending, notified, converted]
└── convertedAt: TIMESTAMP

settlements (Provider Payouts)
├── id: UUID (PK)
├── providerId: UUID (FK → providers)
├── startDate, endDate: DATE
├── totalRevenue: FLOAT
├── commissionAmount: FLOAT
├── gatewayCharges, refunds: FLOAT
├── netAmount: FLOAT
├── status: ENUM [pending, processed, paid, failed]
├── paidAt: TIMESTAMP
└── bankDetails: JSONB
```

---

## Database Indexes

### Performance-Critical Indexes

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email) WHERE deletedAt IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deletedAt IS NULL;

-- Provider discovery
CREATE INDEX idx_service_areas_pincode ON service_areas(pincode);
CREATE INDEX idx_service_areas_city ON service_areas(city);
CREATE INDEX idx_providers_verification_status ON providers(verificationStatus);

-- Order & subscription queries
CREATE INDEX idx_orders_date ON orders(orderDate, deliveryDate);
CREATE INDEX idx_subscriptions_customer_provider ON subscriptions(customerId, providerId);

-- Payment tracking
CREATE INDEX idx_payments_razorpay_id ON payments(razorpayPaymentId);
CREATE INDEX idx_wallet_transactions_customer ON wallet_transactions(customerId);

-- Time-series data (kitchen capacity)
CREATE INDEX idx_kitchen_capacity_date ON kitchen_capacity(providerId, date);

-- Analytics queries
CREATE INDEX idx_reviews_provider_rating ON reviews(providerId, overallRating);
CREATE INDEX idx_orders_provider_date ON orders(providerId, orderDate);
```

---

## Relationships

### One-to-Many

- **User → Addresses** (1 user has many addresses)
- **User → Orders** (1 customer places many orders)
- **Provider → Meals** (1 provider has many meals)
- **Provider → SubscriptionPlans** (1 provider has many plans)
- **SubscriptionPlan → Subscriptions** (1 plan has many subscriptions)

### Many-to-Many

- **Role ↔ Permission** (via RolePermission junction table)
- **Subscription ↔ Meal** (via Orders)

---

## Soft Deletes

All entities have a `deletedAt` timestamp field for soft deletes:

```sql
SELECT * FROM users WHERE "deletedAt" IS NULL;  -- Active records only
SELECT * FROM users WHERE "deletedAt" IS NOT NULL;  -- Deleted records
```

---

## JSON Fields for Flexibility

### `metadata` fields

Every entity has a `metadata` field for storing unstructured data:

```json
{
  "customField": "value",
  "externalId": "123456",
  "integration": { "provider": "razorpay", "sync": true }
}
```

### `preferences` fields

Customers and subscriptions have `preferences`:

```json
{
  "skipWeekends": true,
  "skipHolidays": true,
  "packagingType": "eco-friendly",
  "allergenWarnings": true
}
```

### `bankDetails` in Providers

```json
{
  "accountHolder": "Business Name",
  "accountNumber": "1234567890123456",
  "ifsc": "SBIN0001234",
  "bank": "State Bank of India",
  "upiId": "merchant@upi"
}
```

---

## Multi-Tenancy (Future)

Currently designed for single-tenant use. For multi-tenancy:

1. Add `tenantId` to all tables
2. Implement Row-Level Security (RLS) policies
3. Use partition by tenantId for large tables

```sql
-- Example RLS policy
CREATE POLICY "tenant_isolation" ON users
FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

---

## Audit & Compliance

- **Audit Logs**: Track all CREATE, UPDATE, DELETE operations
- **IP Logging**: Store IP address for security
- **Soft Deletes**: Never permanently delete user data
- **Encryption**: Passwords hashed with bcryptjs

---

## Data Volumes & Partitioning

### Current Design

- No partitioning initially
- Indexes ensure < 100ms query times

### For Scaling (Future)

```sql
-- Partition orders by date (monthly)
CREATE TABLE orders_2026_07 PARTITION OF orders
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Partition kitchen_capacity by date (monthly)
CREATE TABLE kitchen_capacity_2026_07 PARTITION OF kitchen_capacity
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
```

---

## Entity Statistics

| Entity | Purpose | Records/Customer | Indexes |
|--------|---------|------------------|---------|
| users | Authentication | 1 per role | 4 |
| roles | Access control | 8 global | 2 |
| providers | Businesses | 100k target | 5 |
| customers | End users | 1M target | 3 |
| orders | Daily orders | 5-10 per customer | 4 |
| payments | Transactions | 1+ per order | 4 |
| subscriptions | Active plans | 1-3 per customer | 3 |
| notifications | Alerts | 10+ per customer | 4 |

---

## DDL Files

- `1720954800000-InitialMigration.ts` - Creates all base tables
- Additional migrations for future features

## Seed Data

- `initial-seed.ts` - Development sample data
- Admin user, 3 providers, 5 customers
- Sample meals, plans, delivery slots

---

**Total Entities**: 25+  
**Total Indexes**: 40+  
**Estimated Storage**: < 10GB for 1M customers (with time-series partitioning)

---

*Last Updated: 2026-07-14*  
*Version: 1.0.0*
