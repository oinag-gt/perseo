# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Development stage
FROM base AS development
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev", "--workspace=@perseo/api"]

# Builder stage
FROM base AS builder
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci
COPY . .
RUN npm run build --workspace=@perseo/shared
RUN npm run build --workspace=@perseo/api

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci --omit=dev
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/api/dist ./packages/api/dist
EXPOSE 3001
CMD ["node", "packages/api/dist/main.js"]