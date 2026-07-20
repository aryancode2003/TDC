# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm ci --workspaces

# Copy source code
COPY apps/backend ./apps/backend
COPY tsconfig.json ./
COPY .eslintrc.json ./

# Build backend
RUN npm run build --workspace=@tdc/backend

# Production stage
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install production dependencies only
RUN npm ci --omit=dev --workspaces

# Copy built application
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

CMD ["node", "apps/backend/dist/main"]
