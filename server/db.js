const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data.json');

// 读取数据库
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    return { users: [], dishes: [], orders: [], _nextId: { users: 1, dishes: 1, orders: 1 } };
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

// 写入数据库
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 初始化
let db = readDB();
if (!db._nextId) db._nextId = { users: 1, dishes: 1, orders: 1 };

// ============ 初始化菜品数据 ============

if (db.dishes.length === 0) {
  const dishes = [
    { name: '红烧肉', price: 38, category: '热菜' },
    { name: '宫保鸡丁', price: 32, category: '热菜' },
    { name: '鱼香肉丝', price: 30, category: '热菜' },
    { name: '麻婆豆腐', price: 22, category: '热菜' },
    { name: '清蒸鲈鱼', price: 58, category: '热菜' },
    { name: '糖醋排骨', price: 42, category: '热菜' },
    { name: '干煸四季豆', price: 20, category: '热菜' },
    { name: '蒜蓉西兰花', price: 18, category: '素菜' },
    { name: '凉拌黄瓜', price: 12, category: '凉菜' },
    { name: '皮蛋豆腐', price: 16, category: '凉菜' },
    { name: '番茄蛋汤', price: 15, category: '汤类' },
    { name: '紫菜蛋花汤', price: 12, category: '汤类' },
    { name: '米饭', price: 3, category: '主食' },
    { name: '炒面', price: 15, category: '主食' },
    { name: '饺子（10个）', price: 20, category: '主食' },
    { name: '可乐', price: 5, category: '饮品' },
    { name: '雪碧', price: 5, category: '饮品' },
    { name: '橙汁', price: 8, category: '饮品' },
  ];
  db.dishes = dishes.map((d, i) => ({
    id: i + 1,
    ...d,
    image: '',
    available: 1,
    created_at: new Date().toISOString()
  }));
  db._nextId.dishes = dishes.length + 1;
  writeDB(db);
  console.log('✅ 已初始化菜品数据');
}

// ============ 初始化厨师和管理员账号 ============

if (!db.users.find(u => u.role === 'chef')) {
  const hash = bcrypt.hashSync('chef123', 10);
  db.users.push({
    id: db._nextId.users++,
    username: 'chef',
    password: hash,
    role: 'chef',
    created_at: new Date().toISOString()
  });
  writeDB(db);
  console.log('✅ 已创建厨师账号: chef / chef123');
}

if (!db.users.find(u => u.role === 'admin')) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.users.push({
    id: db._nextId.users++,
    username: 'admin',
    password: hash,
    role: 'admin',
    created_at: new Date().toISOString()
  });
  writeDB(db);
  console.log('✅ 已创建管理员账号: admin / admin123');
}

// ============ 查询方法 ============

const dbAPI = {
  // 用户
  findUserByUsername(username) {
    return db.users.find(u => u.username === username);
  },
  findUserById(id) {
    return db.users.find(u => u.id === id);
  },
  createUser(username, password, role = 'customer') {
    const user = { id: db._nextId.users++, username, password, role, created_at: new Date().toISOString() };
    db.users.push(user);
    writeDB(db);
    return user;
  },

  // 菜品
  findAllDishes() {
    return db.dishes.filter(d => d.available === 1);
  },
  findAllDishesAdmin() {
    return db.dishes;
  },
  findDishById(id) {
    return db.dishes.find(d => d.id === id && d.available === 1);
  },
  findDishByIdAll(id) {
    return db.dishes.find(d => d.id === id);
  },
  createDish(name, price, category) {
    const dish = { id: db._nextId.dishes++, name, price: Number(price), category, image: '', available: 1, created_at: new Date().toISOString() };
    db.dishes.push(dish);
    writeDB(db);
    return dish;
  },
  updateDish(id, fields) {
    const dish = db.dishes.find(d => d.id === id);
    if (!dish) return null;
    if (fields.name !== undefined) dish.name = fields.name;
    if (fields.price !== undefined) dish.price = Number(fields.price);
    if (fields.category !== undefined) dish.category = fields.category;
    if (fields.available !== undefined) dish.available = fields.available;
    writeDB(db);
    return dish;
  },
  deleteDish(id) {
    const idx = db.dishes.findIndex(d => d.id === id);
    if (idx === -1) return false;
    db.dishes.splice(idx, 1);
    writeDB(db);
    return true;
  },

  // 订单
  createOrder(userId, dishId, note = '') {
    const now = new Date().toISOString();
    const order = { id: db._nextId.orders++, user_id: userId, dish_id: dishId, status: 'pending', note, created_at: now, updated_at: now };
    db.orders.push(order);
    writeDB(db);
    return order;
  },
  findOrderById(id) {
    return db.orders.find(o => o.id === id);
  },
  updateOrderStatus(id, status) {
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updated_at = new Date().toISOString();
      writeDB(db);
    }
    return order;
  },
  getUserOrdersToday(userId) {
    const today = new Date().toISOString().split('T')[0];
    return db.orders
      .filter(o => o.user_id === userId && o.created_at.startsWith(today))
      .map(o => this._enrichOrder(o))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  getUserOrdersHistory(userId) {
    return db.orders
      .filter(o => o.user_id === userId)
      .map(o => this._enrichOrder(o))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  getKitchenOrdersToday() {
    const today = new Date().toISOString().split('T')[0];
    const statusOrder = { pending: 0, cooking: 1, done: 2 };
    return db.orders
      .filter(o => o.created_at.startsWith(today))
      .map(o => this._enrichOrder(o))
      .sort((a, b) => (statusOrder[a.status] - statusOrder[b.status]) || a.created_at.localeCompare(b.created_at));
  },
  getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = db.orders.filter(o => o.created_at.startsWith(today));
    const total = todayOrders.length;
    const pending = todayOrders.filter(o => o.status === 'pending').length;
    const cooking = todayOrders.filter(o => o.status === 'cooking').length;
    const done = todayOrders.filter(o => o.status === 'done').length;

    // 热门菜品
    const countMap = {};
    todayOrders.forEach(o => {
      const dish = db.dishes.find(d => d.id === o.dish_id);
      if (dish) {
        countMap[dish.name] = (countMap[dish.name] || 0) + 1;
      }
    });
    const popular = Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 总金额
    const totalAmount = todayOrders.reduce((sum, o) => {
      const dish = db.dishes.find(d => d.id === o.dish_id);
      return sum + (dish ? dish.price : 0);
    }, 0);

    return { total, pending, cooking, done, popular, totalAmount };
  },
  _enrichOrder(order) {
    const dish = db.dishes.find(d => d.id === order.dish_id);
    const user = db.users.find(u => u.id === order.user_id);
    return {
      ...order,
      dish_name: dish?.name || '未知菜品',
      price: dish?.price || 0,
      category: dish?.category || '',
      username: user?.username || '未知用户'
    };
  }
};

module.exports = dbAPI;
