# ============ 第一阶段：构建前端 ============
FROM node:20-alpine AS frontend-build

WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm install
COPY client/ ./
RUN npm run build

# ============ 第二阶段：运行后端 ============
FROM node:20-alpine

WORKDIR /app

# 安装后端依赖
COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev

# 拷贝后端代码
COPY server/ ./

# 拷贝前端构建产物
COPY --from=frontend-build /app/client/dist ./../client/dist

# 创建数据目录
RUN mkdir -p /app/data

# 环境变量
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV DB_FILE=/app/data/data.json

# 暴露端口
EXPOSE 3000

# 启动
CMD ["node", "index.js"]
