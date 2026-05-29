const express = require('express');
const db = require('../db');

const router = express.Router();

// 用户下单
router.post('/', (req, res) => {
  const { userId, dishId, note } = req.body;

  if (!userId || !dishId) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  const dish = db.findDishById(dishId);
  if (!dish) {
    return res.status(404).json({ error: '菜品不存在或已下架' });
  }

  const order = db.createOrder(userId, dishId, note || '');
  const enriched = db._enrichOrder(order);

  res.json({ message: '下单成功', order: enriched });
});

// 获取用户订单（今日）
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const orders = db.getUserOrdersToday(parseInt(userId));
  res.json(orders);
});

// 获取用户历史订单（按日期分组）
router.get('/user/:userId/history', (req, res) => {
  const { userId } = req.params;
  const orders = db.getUserOrdersHistory(parseInt(userId));

  const grouped = {};
  orders.forEach(order => {
    const date = order.created_at.split('T')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(order);
  });

  res.json(grouped);
});

// 获取所有订单（厨师端 - 今日）
router.get('/kitchen', (req, res) => {
  const orders = db.getKitchenOrdersToday();
  res.json(orders);
});

// 更新订单状态（厨师端）
router.patch('/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!['pending', 'cooking', 'done'].includes(status)) {
    return res.status(400).json({ error: '无效的状态' });
  }

  const existing = db.findOrderById(parseInt(orderId));
  if (!existing) {
    return res.status(404).json({ error: '订单不存在' });
  }

  const updated = db.updateOrderStatus(parseInt(orderId), status);
  const enriched = db._enrichOrder(updated);

  res.json({ message: '状态更新成功', order: enriched });
});

// 今日统计
router.get('/stats/today', (req, res) => {
  const stats = db.getTodayStats();
  res.json(stats);
});

module.exports = router;
