# 🍽️ 点菜系统

一个基于 Vue 3 + Node.js + Socket.IO 的实时点菜系统，支持 Docker 一键部署。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Naive UI + Pinia + Vue Router |
| 后端 | Node.js + Express |
| 数据存储 | JSON 文件 |
| 实时通信 | Socket.IO |
| 部署 | Docker |

## 功能特性

- ✅ 用户注册/登录（密码 bcrypt 加密）
- ✅ 管理员菜品管理（增删改、上下架）
- ✅ 菜品列表展示（按分类分组）
- ✅ 用户点菜下单（支持备注）
- ✅ 实时 WebSocket 通知
- ✅ 厨师端订单管理（待处理 → 制作中 → 已完成）
- ✅ 订单状态实时同步（仅厨师可修改状态）
- ✅ 历史订单查看（按日期分组）
- ✅ 今日统计（订单量、营收、热门菜品）
- ✅ 手机端自适应

## 预置账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 管理菜品 |
| 厨师 | chef | chef123 | 修改订单状态 |
| 顾客 | 注册新账号 | - | 点菜、查看订单 |

---

## 方式一：本地开发

```bash
# 安装后端依赖
cd server && npm install

# 安装前端依赖
cd ../client && npm install

# 启动后端（端口 3000）
cd ../server && npm run dev

# 启动前端（端口 5173，另一个终端）
cd client && npm run dev
```

访问 http://localhost:5173

---

## 方式二：Docker 部署（推荐）

### 1. 上传代码到服务器

```bash
# 在本地打包
tar -czf ordering-system.tar.gz --exclude=node_modules --exclude=.git --exclude=data .

# 上传到服务器
scp ordering-system.tar.gz root@你的服务器IP:/opt/

# 登录服务器
ssh root@你的服务器IP

# 解压
cd /opt
mkdir ordering-system && cd ordering-system
tar -xzf ../ordering-system.tar.gz
```

### 2. 构建并启动

```bash
# 构建镜像并启动
docker-compose up -d --build

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. 访问

```
http://你的服务器IP:3000
```

### 4. 常用命令

```bash
# 停止
docker-compose down

# 重启
docker-compose restart

# 查看日志
docker-compose logs -f

# 更新后重新部署
docker-compose down
docker-compose up -d --build
```

### 5. 数据持久化

数据库文件存储在 `./data/data.json`，容器重建不会丢失。

---

## Nginx 反向代理（可选）

如果需要域名 + HTTPS，可以用 Nginx 反代：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录

### 菜品（需管理员权限）
- `GET /api/dishes` - 获取可用菜品
- `GET /api/dishes/all` - 获取所有菜品
- `POST /api/dishes` - 新增菜品
- `PUT /api/dishes/:id` - 编辑菜品
- `DELETE /api/dishes/:id` - 删除菜品

### 订单
- `POST /api/orders` - 下单
- `GET /api/orders/user/:id` - 用户今日订单
- `GET /api/orders/user/:id/history` - 用户历史订单
- `GET /api/orders/kitchen` - 厨房今日订单
- `PATCH /api/orders/:id/status` - 更新订单状态（仅厨师）
- `GET /api/orders/stats/today` - 今日统计

---

## 项目结构

```
ordering-system-web/
├── Dockerfile              # Docker 构建文件
├── docker-compose.yml      # Docker 编排
├── .dockerignore
├── .gitignore
├── README.md
├── server/                 # 后端
│   ├── index.js           # 入口（Express + Socket.IO）
│   ├── db.js              # 数据层（JSON 文件存储）
│   ├── middleware/
│   │   └── auth.js        # 权限中间件
│   └── routes/
│       ├── auth.js        # 认证路由
│       ├── dishes.js      # 菜品路由
│       └── orders.js      # 订单路由
├── client/                 # 前端
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── utils/         # axios 拦截器
│       ├── router/
│       ├── stores/        # Pinia 状态管理
│       ├── views/         # 页面
│       └── components/    # 组件
└── data/                   # 数据目录（Docker 持久化）
```
