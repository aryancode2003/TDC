# 🍛 The DABBA Company (TDC)

**India's Smart Subscription Platform for Home-Cooked Tiffin Services**

A production-ready, enterprise-grade, multi-tenant SaaS platform that connects customers with verified local tiffin providers through flexible subscription-based meal plans.

---

## 🎯 Project Vision

The DABBA Company revolutionizes how Indians access home-cooked meals by creating a trustworthy marketplace for subscription-based tiffin services. Unlike food delivery platforms, we focus entirely on recurring subscriptions—bringing convenience, affordability, and authenticity to millions.

**Target Scale**: 100,000+ tiffin providers, millions of customers across India

---

## 📱 Platform Architecture

### Three Separate Applications, One Backend

1. **Customer Mobile App** (Flutter)
   - iOS & Android native apps
   - Web version for browsers
   - Location-based provider discovery
   - Subscription management
   - Real-time delivery tracking

2. **Partner Dashboard** (React/Next.js)
   - Responsive web application
   - Menu & pricing management
   - Customer & order management
   - Revenue & analytics
   - Delivery operations

3. **Super Admin Dashboard** (React/Next.js)
   - Desktop-first platform
   - Provider verification & management
   - Global analytics
   - Financial controls
   - System configuration

### Shared Backend (NestJS + PostgreSQL)
- RESTful APIs with OpenAPI documentation
- Multi-tenant architecture with strict data isolation
- Event-driven notifications
- Payment processing and settlement engine
- Role-based access control (RBAC)

---

## 🏗️ Technology Stack

### Backend
- **Framework**: NestJS with TypeScript (strict mode)
- **Database**: PostgreSQL 16 with TypeORM
- **Cache**: Redis for sessions and real-time data
- **Search**: Meilisearch for full-text search
- **Authentication**: JWT + OTP + OAuth 2.0
- **Payments**: Razorpay integration
- **Notifications**: Firebase Cloud Messaging, SMS (Twilio), WhatsApp, Email

### Frontend
- **Admin & Partner Dashboards**: Next.js 14 + React 18 + TailwindCSS
- **State Management**: Zustand, React Query
- **Mobile App**: Flutter (cross-platform)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (AWS ECS/EKS)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana, Sentry
- **Cloud Storage**: AWS S3

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/yourorg/tdc-platform.git
cd tdc-platform

# Install dependencies (monorepo setup)
npm install

# Start services (PostgreSQL, Redis, Meilisearch)
npm run docker:up

# Run backend in development mode
npm run dev --workspace=@tdc/backend

# Run admin dashboard
npm run dev --workspace=@tdc/admin-dashboard

# Run partner dashboard
npm run dev --workspace=@tdc/partner-dashboard
```

### Access Points
- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api/docs
- **Admin Dashboard**: http://localhost:3001
- **Partner Dashboard**: http://localhost:3002
- **Database (Adminer)**: http://localhost:8080
- **Redis Commander**: http://localhost:8081

---

## 📁 Project Structure

```
tdc-platform/
├── apps/
│   ├── backend/                 # NestJS Backend API
│   │   ├── src/
│   │   │   ├── auth/           # Authentication & JWT
│   │   │   ├── users/          # User management & RBAC
│   │   │   ├── providers/      # Tiffin provider APIs
│   │   │   ├── customers/      # Customer endpoints
│   │   │   ├── orders/         # Subscription & order management
│   │   │   ├── payments/       # Razorpay & wallet
│   │   │   ├── notifications/  # Multi-channel notifications
│   │   │   ├── admin/          # Admin operations
│   │   │   ├── database/       # TypeORM entities & migrations
│   │   │   └── common/         # Shared utilities & middleware
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── admin-dashboard/        # React/Next.js Admin Portal
│   ├── partner-dashboard/      # React/Next.js Partner Portal
│   └── mobile-app/             # Flutter Customer App
├── packages/                   # Shared libraries
│   ├── shared-types/          # Shared TypeScript types
│   ├── shared-utils/          # Common utilities
│   └── api-client/            # Generated API client
├── kubernetes/                 # K8s manifests
├── .github/workflows/          # CI/CD pipelines
├── docker-compose.yml          # Local development setup
├── package.json               # Root workspace config
├── tsconfig.json              # TypeScript base config
└── docs/                      # Documentation
```

---

## 🔐 Security Features

- **Multi-Tenant Isolation**: Row-level security at database level
- **Authentication**: JWT + OTP + OAuth 2.0 (Google, Apple)
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encryption at rest & in transit
- **Audit Logs**: Complete action trail for compliance
- **API Security**: Rate limiting, DDoS protection
- **Admin 2FA**: Two-factor authentication for super admins
- **GDPR Ready**: Data privacy by design

---

## 📊 Core Features

### Customer-Facing Features
- 🔍 Location-based provider discovery
- 🍽️ Browse weekly/monthly menus
- 📋 Flexible subscription management (breakfast, lunch, dinner, combos)
- 💳 Secure payments via Razorpay
- 🎟️ Wallet, coupons, and referral rewards
- 📍 Delivery tracking in real-time
- ⭐ Ratings and reviews with photos
- 🏝️ Vacation mode and meal confirmation
- 💬 AI-powered customer support

### Provider-Facing Features
- 📊 Comprehensive dashboard with real-time analytics
- 🍴 Complete menu builder (unlimited categories, meals, pricing)
- 👥 Customer management with communication
- 💰 Revenue tracking and settlements
- 🚚 Delivery slot & area management
- 👨‍💼 Kitchen capacity management
- 📈 Growth analytics and insights
- 🔔 Bulk notifications to customers
- 📋 Reports (revenue, renewals, repeat customers)

### Admin Features
- ✅ Provider verification workflow
- 📈 Platform-wide analytics (GMV, revenue, churn)
- 💳 Financial controls and commission management
- 🌍 Area and region management
- 📰 CMS for FAQs, terms, blogs
- 🚀 Feature flags for gradual rollout
- 🔧 Complete system configuration
- 🤖 AI features (demand forecast, churn prediction)

---

## 🔄 Development Workflow

### Git Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches

### Commit Convention
```bash
# Use conventional commits
git commit -m "feat(users): add phone OTP authentication"
git commit -m "fix(payments): resolve Razorpay settlement timing"
git commit -m "docs(api): update endpoint documentation"
```

### Code Quality
- **Linting**: ESLint with strict TypeScript rules
- **Formatting**: Prettier for consistent style
- **Testing**: Jest with 80%+ coverage target
- **Type Safety**: TypeScript with `strict: true`

---

## 🧪 Testing

```bash
# Run all tests
npm run test --workspaces

# Run tests with coverage
npm run test:cov --workspace=@tdc/backend

# Watch mode during development
npm run test:watch --workspace=@tdc/backend
```

---

## 📚 API Documentation

Complete OpenAPI/Swagger documentation is available at:
```
http://localhost:3000/api/docs
```

### Key Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/providers` - Discover providers
- `POST /api/v1/subscriptions` - Create subscription
- `GET /api/v1/orders` - View orders

---

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t tdc-backend:latest apps/backend/
```

### Run with Docker Compose
```bash
docker-compose up -d
```

### View Logs
```bash
npm run docker:logs
```

### Stop Services
```bash
npm run docker:down
```

---

## 🚢 Production Deployment

### Kubernetes Deployment
```bash
kubectl apply -f kubernetes/backend/
kubectl apply -f kubernetes/postgres/
kubectl apply -f kubernetes/redis/
```

### Environment Configuration
Update production environment variables:
```bash
.env.production
# Database credentials
# API keys (Razorpay, Firebase, AWS)
# JWT secrets
# Service endpoints
```

---

## 📊 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| API Response Time (p95) | < 200ms | 🔄 In Progress |
| Page Load Time | < 2s | 🔄 In Progress |
| Database Query Time (p95) | < 100ms | 🔄 In Progress |
| Uptime | 99.9% | 🔄 Planned |
| Test Coverage | 80%+ | 🔄 In Progress |

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open Pull Request
5. Ensure CI/CD passes
6. Get code review approval
7. Merge to develop

---

## 📝 License

**PROPRIETARY** - All rights reserved to The DABBA Company

---

## 📞 Support

For issues and questions:
- 📧 Email: support@thedabbacompany.com
- 🐛 GitHub Issues: https://github.com/yourorg/tdc-platform/issues
- 💬 Slack: #tdc-platform-support

---

## 🎉 Acknowledgments

Built with ❤️ for India's entrepreneurial tiffin service providers.

**Version**: 1.0.0  
**Last Updated**: 2026-07-17  
**Status**: Active Development - Phase 11 Complete ✅
