const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dishes', require('./routes/dishes'));
app.use('/api/orders', require('./routes/orders'));

// 静态文件（生产模式）
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ============ WebSocket ============

io.on('connection', (socket) => {
  console.log(`🔌 用户连接: ${socket.id}`);

  // 加入用户房间（用于定向通知）
  socket.on('join', (data) => {
    if (data.userId) {
      socket.join(`user_${data.userId}`);
      console.log(`👤 用户 ${data.userId} 加入房间`);
    }
    if (data.role === 'chef') {
      socket.join('kitchen');
      console.log(`👨‍🍳 厨师加入厨房房间`);
    }
  });

  // 新订单通知
  socket.on('new_order', (order) => {
    // 通知厨房
    io.to('kitchen').emit('kitchen_new_order', order);
    // 广播给所有人
    io.emit('order_update', { type: 'new', order });
    console.log(`📝 新订单: ${order.username} 点了 ${order.dish_name}`);
  });

  // 订单状态更新
  socket.on('status_update', (data) => {
    const { order, userId } = data;
    // 通知对应用户
    io.to(`user_${userId}`).emit('my_order_update', order);
    // 广播给所有人
    io.emit('order_update', { type: 'status', order });
    console.log(`🔄 订单状态: ${order.dish_name} -> ${order.status}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 用户断开: ${socket.id}`);
  });
});

// 把 io 实例挂到 app 上，方便路由中使用
app.set('io', io);

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('');
  console.log('🍽️  =============================');
  console.log('🍽️  点菜系统后端已启动');
  console.log(`🍽️  地址: http://localhost:${PORT}`);
  console.log('🍽️  =============================');
  console.log('');
});
