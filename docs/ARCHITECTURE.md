# 🏗️ Architecture Documentation

Comprehensive guide to The DABBA Company platform architecture, design patterns, and system design.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  Mobile App (Flutter)  │  Admin Dashboard  │ Partner Dashboard│
│  (iOS, Android, Web)   │  (React/Next.js)  │ (React/Next.js)  │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │   API GATEWAY       │
                    │ (Rate Limiting)     │
                    └─────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (NestJS)                        │
├─────────────────────────────────────────────────────────────┤
│  Auth   │ Users  │ Providers │ Customers │ Orders │ Payments│
│ Module  │Module  │   Module  │  Module   │ Module │ Module  │
│         │        │           │           │        │         │
│ Notifications │ Admin │ Common (Pipes, Guards, Interceptors)│
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────┐
        │     DATA ACCESS LAYER (TypeORM)        │
        └────────────────────────────────────────┘
                              ↓
┌──────────────────┬──────────────────┬──────────────────┐
│   PostgreSQL     │   Redis Cache    │  Meilisearch     │
│   (Primary DB)   │   (Sessions)     │  (Full-text)     │
└──────────────────┴──────────────────┴──────────────────┘
```

---

## Module Architecture

### Layered Architecture Pattern

Each feature module follows a strict layered architecture:

```
Module
  ├── Controller
  │   └── Handles HTTP requests/responses
  ├── Service
  │   └── Business logic
  ├── Entity
  │   └── Database models
  ├── DTO
  │   └── Request/response objects
  ├── Repository (TypeORM)
  │   └── Data access
  └── Module (Wires everything)
```

### Example: Users Module

```typescript
// users.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}

// users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }
}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Business logic
  }
}
```

---

## Multi-Tenancy Architecture

The platform supports multiple tenants with complete data isolation.

### Tenant Context

Every request carries a tenant context:

```typescript
// Tenant context passed through interceptor
export interface TenantContext {
  tenantId: string;
  userId: string;
  userRole: UserRole;
  permissions: Permission[];
}

// Extracted from JWT token
const tenantId = req.user.tenantId;
```

### Row-Level Security

All queries are automatically filtered by tenant:

```typescript
// Repository enforces tenant isolation
const users = await this.userRepository.find({
  where: { tenantId },
});
```

### Data Isolation

- Each tenant has separate data
- No cross-tenant data leakage possible
- Admin users can only access their tenant data
- Audit logs track all access

---

## Authentication & Authorization

### Authentication Flow

```
1. User submits credentials (email/password or phone OTP)
   ↓
2. Backend validates and generates JWT token
   ↓
3. Client stores token in secure storage
   ↓
4. Client includes token in Authorization header
   ↓
5. Backend validates token on each request
   ↓
6. Token refresh when approaching expiration
```

### JWT Token Structure

```json
{
  "sub": "user-id",
  "tenantId": "tenant-id",
  "email": "user@example.com",
  "phone": "+91-phone-number",
  "role": "customer",
  "permissions": ["read:subscriptions", "create:orders"],
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Role-Based Access Control (RBAC)

```typescript
// Define roles and permissions
enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SUPPORT_EXECUTIVE = 'support_executive',
  FINANCE_EXECUTIVE = 'finance_executive',
  PARTNER = 'partner',
  PARTNER_MANAGER = 'partner_manager',
  DELIVERY_EXECUTIVE = 'delivery_executive',
  CUSTOMER = 'customer',
}

// Protect endpoints with guards
@Post('providers')
@UseGuards(RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
approveProvider(@Body() data: any): Promise<void> {
  // Only super admin can execute
}
```

---

## Database Design

### Entity Relationship Diagram (Conceptual)

```
┌─────────────┐         ┌──────────────┐
│    User     │────────→│     Role     │
├─────────────┤         ├──────────────┤
│ id (PK)     │         │ id (PK)      │
│ email       │         │ name         │
│ phone       │         │ permissions  │
│ role_id (FK)│         └──────────────┘
│ created_at  │
└─────────────┘
       ↑
       │ (Inheritance via STI)
       │
    ┌──┴───────────────┬──────────────┐
    │                  │              │
 CUSTOMER          PROVIDER        ADMIN
 (phone,addr)  (kitchen,menu)  (permissions)

┌──────────────┐         ┌──────────────┐
│  Provider    │────────→│    Menu      │
├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │
│ business_name│         │ provider_id  │
│ gst_number   │         │ category_id  │
│ kitchen_addr │         │ meals        │
└──────────────┘         └──────────────┘
       ↓                         ↓
       │ (1:N)           ┌──────────────┐
       │         ┌──────→│    Meal      │
       │         │       ├──────────────┤
       │         │       │ id (PK)      │
       │         │       │ name         │
       │         │       │ price        │
       │         │       │ veg/non-veg  │
       │         │       └──────────────┘
       │         │
    ┌──┴────┐    │
    │        │    │
 SUBSCRIPTION   PLAN
 (customer)  (meals+timing)
```

### Key Entities

| Entity | Purpose | Partitioning |
|--------|---------|--------------|
| `users` | Core user accounts | By role |
| `providers` | Tiffin service businesses | By verified status |
| `subscriptions` | Active meal plans | By provider & customer |
| `orders` | Daily meal orders | By date (time-series) |
| `payments` | Transaction records | By date |
| `notifications` | Event logs | By user & date |

---

## Caching Strategy

### Cache Layers

```
Application Cache (Redis)
  ├── Session Cache
  │   └── JWT token revocation list
  ├── User Cache
  │   └── User profiles (1 hour TTL)
  ├── Provider Cache
  │   └── Menu & pricing (30 min TTL)
  └── Search Cache
      └── Provider search results (5 min TTL)

Database
  └── Raw data with indexes
```

### Cache Invalidation

```typescript
// Invalidate when data changes
async updateProvider(id: string, data: UpdateProviderDto): Promise<void> {
  const provider = await this.providerService.update(id, data);
  
  // Clear affected caches
  await this.cacheService.delete(`provider:${id}`);
  await this.cacheService.delete('providers:list');
  
  return provider;
}
```

---

## Payment Architecture

### Payment Flow

```
Customer selects subscription
        ↓
Create Order & Payment Record
        ↓
Call Razorpay API (Create Order)
        ↓
Return payment URL to client
        ↓
Client redirects to Razorpay
        ↓
Customer enters payment details
        ↓
Razorpay processes payment
        ↓
Webhook notification received
        ↓
Verify signature & update payment status
        ↓
Activate subscription
        ↓
Send confirmation notification
```

### Settlement Engine

```
Daily Settlement Process
  ├── Calculate commissions (percentage or fixed)
  ├── Deduct gateway charges
  ├── Deduct refunds & chargebacks
  ├── Generate settlement record
  ├── Transfer to provider bank
  └── Send SMS/email confirmation
```

---

## Notification System

### Multi-Channel Architecture

```
Event (order created, delivery scheduled, payment failed)
        ↓
Notification Service
        ├─→ Firebase Cloud Messaging (Push)
        ├─→ SMS (Twilio)
        ├─→ WhatsApp (Twilio)
        ├─→ Email (SendGrid/SMTP)
        └─→ In-App (Database)

Preferences & Rules
  ├── User notification settings
  ├── Frequency limits
  ├── Time windows
  └── Channel preferences
```

---

## Scalability Considerations

### Horizontal Scaling

```
Load Balancer
    ├─→ Backend Pod 1
    ├─→ Backend Pod 2
    ├─→ Backend Pod 3
    └─→ Backend Pod N

Shared Resources
    ├─→ PostgreSQL (with read replicas)
    ├─→ Redis Cluster
    └─→ Meilisearch Cluster
```

### Database Optimization

```typescript
// Query optimization
- Add indexes on frequently filtered columns
- Use pagination for large result sets
- Select specific columns (not SELECT *)
- Eager load relationships to avoid N+1

// Partitioning strategy
- Time-series data (orders) → partitioned by date
- User data → partitioned by region (future)
- Logs → partitioned by month
```

### Caching Strategy

- Cache frequently accessed, infrequently changed data
- Use appropriate TTL based on data freshness requirements
- Implement cache warming for critical data
- Monitor cache hit rates

---

## Error Handling

### Global Exception Handler

```typescript
@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = getStatus(exception);
    const message = getMessage(exception);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Security Architecture

### Defense in Depth

```
1. Network Layer
   - HTTPS/TLS encryption
   - DDoS protection
   - WAF rules

2. API Layer
   - Authentication (JWT + OTP)
   - Authorization (RBAC)
   - Rate limiting
   - Input validation

3. Database Layer
   - Row-level security
   - Encryption at rest
   - Audit logging
   - Backup & recovery

4. Application Layer
   - Secure password hashing (bcryptjs)
   - Input sanitization
   - CORS configuration
   - CSRF protection
```

---

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging
logger.log('User login successful', {
  userId: user.id,
  timestamp: new Date(),
  ipAddress: request.ip,
});

// Error logging with context
logger.error('Payment failed', {
  orderId: order.id,
  error: exception.message,
  stack: exception.stack,
});
```

### Metrics Collected

- API request count & latency
- Database query performance
- Cache hit/miss rates
- Payment success/failure rates
- Error rates by endpoint
- Active user sessions
- System resource usage (CPU, memory, disk)

---

## Testing Architecture

### Test Pyramid

```
        /\
       /  \ E2E Tests (5%)
      /    \ (Full user journeys)
     /──────\
    /        \ Integration Tests (20%)
   /          \ (Module interactions)
  /────────────\
 / Unit Tests  \ (75%)
/________________\ (Individual functions)
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All major workflows
- **E2E Tests**: Critical user paths

---

## Deployment Architecture

### Kubernetes Architecture

```
┌─────────────────────────────┐
│   Load Balancer (AWS ALB)   │
└──────────────┬──────────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
  Pod 1     Pod 2     Pod N
  (API)     (API)     (API)

  ConfigMap: Environment variables
  Secrets: Database credentials, API keys
  PVC: Persistent volume for logs
```

---

## Future Enhancements

- [ ] Event Sourcing for audit trails
- [ ] GraphQL API alongside REST
- [ ] Real-time updates with WebSockets
- [ ] AI/ML pipeline for recommendations
- [ ] Microservices migration (future)
- [ ] CQRS pattern for complex queries

---

**Architecture Last Updated**: 2026-07-14  
**Version**: 1.0.0
