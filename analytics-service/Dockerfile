# Use lightweight Node.js image
FROM node:18-alpine

# Install CA certs (and curl for quick checks)
RUN apk add --no-cache ca-certificates curl && update-ca-certificates

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy the rest of the service files
COPY . .

# Expose service port
EXPOSE 3000

# Start the service
CMD ["npm", "start"]
