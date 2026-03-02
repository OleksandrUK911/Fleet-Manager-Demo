# frontend/Dockerfile — Fleet Manager React frontend
# Stage 1: build the React app
# Stage 2: serve with nginx

# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (separate layer for caching)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copy the React production build
COPY --from=builder /app/build /usr/share/nginx/html

# Replace default nginx config with our custom one
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
