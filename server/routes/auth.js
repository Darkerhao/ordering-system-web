const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// 注册
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: '用户名长度为 2-20 个字符' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: '密码长度至少 4 个字符' });
  }

  const existing = db.findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ error: '用户名已存在' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const user = db.createUser(username, hash, 'customer');

  res.json({
    message: '注册成功',
    user: { id: user.id, username: user.username, role: user.role }
  });
});

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const user = db.findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  res.json({
    message: '登录成功',
    user: { id: user.id, username: user.username, role: user.role }
  });
});

module.exports = router;
