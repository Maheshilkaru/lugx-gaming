# Use a lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy all application files
COPY . .

# Expose API port
EXPOSE 3000

# Start the service
CMD ["npm", "start"]