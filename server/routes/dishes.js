const express = require('express');
const db = require('../db');

const router = express.Router();

// 获取所有可用菜品
router.get('/', (req, res) => {
  const dishes = db.findAllDishes();
  res.json(dishes);
});

// 获取所有菜品（管理员用）
router.get('/all', (req, res) => {
  const dishes = db.findAllDishesAdmin();
  res.json(dishes);
});

module.exports = router;
