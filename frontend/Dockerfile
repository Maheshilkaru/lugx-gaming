# Use Nginx as base image
FROM nginx:alpine

# Copy all frontend files to Nginx directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

