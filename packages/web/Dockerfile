# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Development stage
FROM base AS development
COPY package*.json ./
COPY packages/web/package*.json ./packages/web/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace=@perseo/web"]

# Builder stage
FROM base AS builder
COPY package*.json ./
COPY packages/web/package*.json ./packages/web/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci
COPY . .
RUN npm run build --workspace=@perseo/shared
RUN npm run build --workspace=@perseo/web

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
COPY packages/web/package*.json ./packages/web/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci --omit=dev
COPY --from=builder /app/packages/web/.next ./packages/web/.next
COPY --from=builder /app/packages/web/public ./packages/web/public
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=@perseo/web"]