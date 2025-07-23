# Use lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose API port
EXPOSE 3000

# Start the API server
CMD ["npm", "start"]