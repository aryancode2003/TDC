# 🛠️ Development Guide

Complete guide for developers working on The DABBA Company platform.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Project Structure](#project-structure)
3. [Development Standards](#development-standards)
4. [Running Services](#running-services)
5. [Database Management](#database-management)
6. [Testing](#testing)
7. [Git Workflow](#git-workflow)
8. [Troubleshooting](#troubleshooting)

---

## Setup

### System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Docker**: Latest version
- **Docker Compose**: 2.0+
- **Git**: 2.30+
- **VS Code** (recommended) or any TypeScript-compatible editor

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/yourorg/tdc-platform.git
cd tdc-platform

# 2. Install dependencies
npm install

# 3. Copy environment files
cp apps/backend/.env.example apps/backend/.env

# 4. Start Docker services
npm run docker:up

# 5. Run database migrations
npm run db:migrate --workspace=@tdc/backend

# 6. Seed sample data
npm run db:seed --workspace=@tdc/backend

# 7. Start development servers
npm run dev
```

---

## Project Structure

### Backend (`apps/backend/`)

```
src/
├── auth/              # Authentication logic
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── strategies/    # Passport strategies
│   └── dto/          # Data transfer objects
├── users/            # User management
├── providers/        # Tiffin provider APIs
├── customers/        # Customer endpoints
├── orders/           # Order management
├── payments/         # Payment processing
├── notifications/    # Notification service
├── admin/            # Admin operations
├── database/         # Database entities & migrations
│   ├── entities/
│   └── migrations/
├── common/           # Shared utilities
│   ├── decorators/
│   ├── pipes/
│   ├── guards/
│   ├── interceptors/
│   └── exceptions/
├── main.ts          # Application entry point
└── app.module.ts    # Root module
```

### Frontend Dashboards

```
src/
├── components/      # Reusable components
├── pages/          # Next.js pages/routes
├── layouts/        # Layout components
├── services/       # API calls
├── hooks/          # Custom React hooks
├── store/          # State management (Zustand)
├── types/          # TypeScript interfaces
└── utils/          # Helper functions
```

---

## Development Standards

### TypeScript Guidelines

```typescript
// ✅ DO: Use strict typing
interface CreateUserDto {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

// ✅ DO: Use clear variable names
const activeSubscriptions = subscriptions.filter(
  (sub) => sub.status === 'active'
);

// ❌ DON'T: Use `any`
const data: any = response.data; // Avoid!

// ❌ DON'T: Implicit return types
function getUser(id) { // Missing return type!
  return users[id];
}
```

### NestJS Guidelines

```typescript
// ✅ DO: Use DTOs for request validation
@Post('create')
create(@Body() createUserDto: CreateUserDto): Promise<User> {
  return this.userService.create(createUserDto);
}

// ✅ DO: Use dependency injection
constructor(private readonly userService: UserService) {}

// ✅ DO: Add decorators for documentation
@ApiOperation({ summary: 'Create new user' })
@ApiResponse({ status: 201, description: 'User created' })
@Post()
create(@Body() createDto: CreateUserDto): Promise<User> {
  return this.userService.create(createDto);
}
```

### Code Style

```bash
# Format code with Prettier
npm run format

# Check linting
npm run lint

# Fix linting issues
npm run lint -- --fix
```

---

## Running Services

### Start All Services

```bash
# Start everything (backend, dashboards, databases)
npm run dev
```

### Individual Services

```bash
# Backend API (NestJS)
npm run dev --workspace=@tdc/backend

# Admin Dashboard
npm run dev --workspace=@tdc/admin-dashboard

# Partner Dashboard
npm run dev --workspace=@tdc/partner-dashboard
```

### Docker Services

```bash
# Start databases
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

---

## Database Management

### Migrations

```bash
# Generate migration
npm run typeorm -- migration:generate -n MigrationName

# Run migrations
npm run db:migrate

# Revert last migration
npm run db:revert

# Show migration status
npm run db:migration:show
```

### Seeding Data

```bash
# Run seeders
npm run db:seed

# Clear database
npm run db:reset

# Import CSV data
npm run db:import --file=data.csv --table=providers
```

### Database Tools

Access databases via:
- **Adminer** (PostgreSQL): http://localhost:8080
- **Redis Commander**: http://localhost:8081

---

## Testing

### Unit Tests

```bash
# Run all tests
npm run test --workspaces

# Run specific module tests
npm run test --workspace=@tdc/backend -- auth.service.spec

# Watch mode
npm run test:watch --workspace=@tdc/backend

# Generate coverage report
npm run test:cov --workspace=@tdc/backend
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration --workspace=@tdc/backend
```

### E2E Tests

```bash
# Run E2E tests (future)
npm run test:e2e --workspace=@tdc/backend
```

### Writing Tests

```typescript
// ✅ Good test example
describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    const createUserDto = { email: 'test@example.com' };
    jest.spyOn(repository, 'save').mockResolvedValue(expectedUser);

    const result = await service.create(createUserDto);

    expect(result).toEqual(expectedUser);
    expect(repository.save).toHaveBeenCalledWith(createUserDto);
  });
});
```

---

## Git Workflow

### Branch Naming

```
feature/user-authentication
feature/payment-integration
bugfix/email-validation
docs/api-endpoints
```

### Commit Messages

```bash
# Features
git commit -m "feat(auth): implement phone OTP authentication"

# Bug fixes
git commit -m "fix(payments): resolve Razorpay webhook handling"

# Documentation
git commit -m "docs(api): update endpoint responses"

# Performance
git commit -m "perf(search): optimize provider query with indexing"

# Refactoring
git commit -m "refactor(users): simplify user service logic"

# Tests
git commit -m "test(auth): add OTP generation tests"
```

### Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat(module): description"
   ```

3. **Push to remote**
   ```bash
   git push origin feature/your-feature
   ```

4. **Open Pull Request**
   - Add clear description
   - Link relevant issues
   - Request reviewers

5. **Address Review Comments**
   ```bash
   git add .
   git commit -m "refactor: address review comments"
   git push
   ```

6. **Merge to develop**
   - Ensure CI/CD passes
   - Get approval from 2+ reviewers
   - Squash commits for clean history

---

## Troubleshooting

### Cannot Connect to Database

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs tdc_postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
npm run db:migrate
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear TypeScript cache
rm -rf dist
npm run build
```

### Tests Failing

```bash
# Ensure test database is running
docker-compose up -d postgres

# Clear test cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose
```

### Redis Connection Issues

```bash
# Check Redis status
docker logs tdc_redis

# Clear Redis data
docker exec tdc_redis redis-cli FLUSHALL

# Restart Redis
docker-compose restart redis
```

---

## IDE Setup

### VS Code Extensions

- **ESLint** - `dbaeumer.vscode-eslint`
- **Prettier** - `esbenp.prettier-vscode`
- **TypeScript** - Built-in
- **Thunder Client** - `rangav.vscode-thunder-client` (API testing)
- **REST Client** - `humao.rest-client`
- **GitLens** - `eamodio.gitlens`

### Recommended Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## Performance Optimization Tips

1. **Use pagination** for large datasets
2. **Add database indexes** on frequently queried columns
3. **Implement caching** with Redis
4. **Use lazy loading** for relationships
5. **Optimize queries** with SELECT specific columns
6. **Enable compression** in responses

---

## Next Steps

- 📚 Read [Architecture Documentation](./ARCHITECTURE.md)
- 🔐 Review [Security Guidelines](./SECURITY.md)
- 🚀 Check [Deployment Guide](./DEPLOYMENT.md)

---

**Happy coding! 🚀**
