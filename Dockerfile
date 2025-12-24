# Use Node.js slim image for smaller footprint
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies needed for wrangler)
RUN npm ci

# Copy application code
COPY . .

# Expose port for wrangler dev
EXPOSE 8787

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]
