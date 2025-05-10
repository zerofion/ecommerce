FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]
