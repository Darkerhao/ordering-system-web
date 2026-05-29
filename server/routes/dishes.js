const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// 获取所有可用菜品（顾客用）
router.get('/', (req, res) => {
  const dishes = db.findAllDishes();
  res.json(dishes);
});

// 获取所有菜品（管理员用）
router.get('/all', requireRole('admin'), (_req, res) => {
  const dishes = db.findAllDishesAdmin();
  res.json(dishes);
});

// 新增菜品（管理员）
router.post('/', requireRole('admin'), (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: '菜品名称和价格不能为空' });
  }
  if (Number(price) <= 0) {
    return res.status(400).json({ error: '价格必须大于0' });
  }
  const dish = db.createDish(name, price, category || '默认');
  res.json({ message: '菜品添加成功', dish });
});

// 编辑菜品（管理员）
router.put('/:id', requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { name, price, category, available } = req.body;

  const existing = db.findDishByIdAll(Number(id));
  if (!existing) {
    return res.status(404).json({ error: '菜品不存在' });
  }

  const fields = {};
  if (name !== undefined) fields.name = name;
  if (price !== undefined) {
    if (Number(price) <= 0) return res.status(400).json({ error: '价格必须大于0' });
    fields.price = price;
  }
  if (category !== undefined) fields.category = category;
  if (available !== undefined) fields.available = available;

  const dish = db.updateDish(Number(id), fields);
  res.json({ message: '菜品更新成功', dish });
});

// 删除菜品（管理员）
router.delete('/:id', requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const existing = db.findDishByIdAll(Number(id));
  if (!existing) {
    return res.status(404).json({ error: '菜品不存在' });
  }
  db.deleteDish(Number(id));
  res.json({ message: '菜品删除成功' });
});

module.exports = router;
