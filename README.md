# 🍽️ 点菜系统

一个基于 Vue 3 + Node.js + Socket.IO 的实时点菜系统。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Naive UI + Pinia + Vue Router |
| 后端 | Node.js + Express |
| 数据库 | SQLite (better-sqlite3) |
| 实时通信 | Socket.IO |
| 认证 | bcryptjs 密码哈希 |

## 功能特性

- ✅ 用户注册/登录（密码 bcrypt 加密）
- ✅ 菜品列表展示（按分类分组）
- ✅ 用户点菜下单（支持备注）
- ✅ 实时 WebSocket 通知
- ✅ 厨师端订单管理（待处理 → 制作中 → 已完成）
- ✅ 订单状态实时同步
- ✅ 历史订单查看（按日期分组）
- ✅ 今日统计（订单量、营收、热门菜品）

## 快速开始

### 1. 安装后端依赖

```bash
cd server
npm install
```

### 2. 安装前端依赖

```bash
cd client
npm install
```

### 3. 启动项目

**启动后端（端口 3000）：**
```bash
cd server
npm run dev
```

**启动前端（端口 5173）：**
```bash
cd client
npm run dev
```

### 4. 访问系统

- 前端地址：http://localhost:5173
- 后端 API：http://localhost:3000/api

## 预置账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 厨师 | chef | chef123 |
| 顾客 | 注册新账号 | - |

## 数据库结构

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| username | TEXT | 用户名（唯一） |
| password | TEXT | 密码（bcrypt 哈希） |
| role | TEXT | 角色：customer / chef |
| created_at | DATETIME | 创建时间 |

### dishes 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 菜品名称 |
| price | REAL | 价格 |
| category | TEXT | 分类 |
| image | TEXT | 图片 |
| available | INTEGER | 是否可用 |

### orders 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| user_id | INTEGER | 用户 ID |
| dish_id | INTEGER | 菜品 ID |
| status | TEXT | 状态：pending/cooking/done |
| note | TEXT | 备注 |
| created_at | DATETIME | 下单时间 |
| updated_at | DATETIME | 更新时间 |

## API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录

### 菜品
- `GET /api/dishes` - 获取可用菜品

### 订单
- `POST /api/orders` - 下单
- `GET /api/orders/user/:id` - 用户今日订单
- `GET /api/orders/user/:id/history` - 用户历史订单
- `GET /api/orders/kitchen` - 厨房今日订单
- `PATCH /api/orders/:id/status` - 更新订单状态
- `GET /api/orders/stats/today` - 今日统计

## 项目结构

```
ordering-system-web/
├── server/                 # 后端
│   ├── index.js           # 入口（Express + Socket.IO）
│   ├── db.js              # 数据库初始化
│   ├── routes/
│   │   ├── auth.js        # 认证路由
│   │   ├── dishes.js      # 菜品路由
│   │   └── orders.js      # 订单路由
│   └── package.json
├── client/                 # 前端
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── router/
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── views/         # 页面组件
│   │   └── components/    # 公共组件
│   └── package.json
└── README.md
```
