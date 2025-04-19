# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY package.json package-lock.json ./

# Install pnpms
RUN npm install -f

# Copy source code
COPY . .

# Build the application
RUN npm run build && \
    # 清理旧版本文件
    find /app/dist -name "*.html" -exec sed -i '/\.js\|\.css/s/?v=.*"/?v='$(date +%s)'"/g' {} \; 

# Production stage
FROM nginx:alpine

# Copy the built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]