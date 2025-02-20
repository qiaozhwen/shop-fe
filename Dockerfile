# 第一阶段：构建静态文件
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件并安装（利用Docker缓存层）
COPY package*.json ./
RUN npm install -f

# 复制源码并构建
COPY . .
RUN npm run build

# 第二阶段：部署到Nginx
FROM nginx:1.25-alpine

# 复制自定义Nginx配置
COPY nginx.conf /etc/nginx/conf.d/

# 从构建阶段复制产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动Nginx（使用非daemon模式运行）
CMD ["nginx", "-g", "daemon off;"]