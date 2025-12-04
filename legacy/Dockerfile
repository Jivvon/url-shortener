# Development Dockerfile for Snip (Legacy Project)
FROM node:24-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose ports
# 5173: Vite dev server
# 8787: API Worker
# 8788: Redirect Worker
EXPOSE 5173 8787 8788

# Start all services (Vite + Wrangler workers)
CMD ["npm", "run", "dev:all"]
