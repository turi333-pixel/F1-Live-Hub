# ── Stage 1: Build the Vite frontend ─────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Production image ────────────────────────
FROM node:20-alpine
WORKDIR /app

# Copy package files and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy server code
COPY server/ ./server/

# Copy built frontend from Stage 1
COPY --from=build /app/dist ./dist

# Cloud Run injects PORT; default to 8080
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/index.js"]
