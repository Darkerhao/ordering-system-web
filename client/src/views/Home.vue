<template>
  <div class="home-page">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-text">
        <h2>👋 你好，{{ userStore.username }}！</h2>
        <p>今天想吃点什么？</p>
      </div>
      <div class="welcome-emoji">🍜</div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row" v-if="orderStore.stats">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-value">{{ orderStore.stats.total }}</div>
        <div class="stat-label">今日总单</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-value">{{ orderStore.stats.pending }}</div>
        <div class="stat-label">待处理</div>
      </div>
      <div class="stat-card cooking">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">{{ orderStore.stats.cooking }}</div>
        <div class="stat-label">制作中</div>
      </div>
      <div class="stat-card done">
        <div class="stat-icon">✅</div>
        <div class="stat-value">{{ orderStore.stats.done }}</div>
        <div class="stat-label">已完成</div>
      </div>
    </div>

    <!-- 菜品列表 -->
    <div class="section-header">
      <span class="section-icon">🍛</span>
      <span class="section-title">菜品列表</span>
    </div>
    <div class="dish-section">
      <n-spin :show="loading">
        <div v-for="(items, category) in groupedDishes" :key="category" class="category-group">
          <div class="category-tag">{{ category }}</div>
          <div class="dish-grid">
            <div v-for="dish in items" :key="dish.id" class="dish-card" @click="toggleNote(dish.id)">
              <div class="dish-top">
                <div class="dish-name">{{ dish.name }}</div>
                <div class="dish-price">¥{{ dish.price }}</div>
              </div>
              <div class="dish-bottom" v-if="expandedDish === dish.id" @click.stop>
                <n-input
                  v-model:value="dishNotes[dish.id]"
                  placeholder="写点备注..."
                  size="small"
                  class="note-input"
                />
                <button class="order-btn" @click.stop="handleOrder(dish)">
                  点这道
                </button>
              </div>
              <div class="dish-hint" v-else>点击点菜</div>
            </div>
          </div>
        </div>
      </n-spin>
    </div>

    <!-- 我的今日订单 -->
    <div class="section-header" v-if="orderStore.orders.length">
      <span class="section-icon">📋</span>
      <span class="section-title">我的今日订单</span>
      <span class="section-badge">{{ orderStore.orders.length }}</span>
    </div>
    <div class="order-list" v-if="orderStore.orders.length">
      <div v-for="order in orderStore.orders" :key="order.id" class="order-item">
        <div class="order-left">
          <div class="order-name">{{ order.dish_name }}</div>
          <div class="order-meta">
            <span>{{ order.category }}</span>
            <span v-if="order.note">· {{ order.note }}</span>
          </div>
        </div>
        <div class="order-right">
          <span class="order-price">¥{{ order.price }}</span>
          <span class="order-status" :class="order.status">{{ statusText(order.status) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useUserStore } from '../stores/user'
import { useOrderStore } from '../stores/order'
import { useSocketStore } from '../stores/socket'
import { NSpin, NInput } from 'naive-ui'

const message = useMessage()
const userStore = useUserStore()
const orderStore = useOrderStore()
const socketStore = useSocketStore()

const loading = ref(false)
const dishNotes = ref({})
const expandedDish = ref(null)

const groupedDishes = computed(() => {
  const groups = {}
  orderStore.dishes.forEach(dish => {
    if (!groups[dish.category]) groups[dish.category] = []
    groups[dish.category].push(dish)
  })
  return groups
})

function statusText(status) {
  return { pending: '待处理', cooking: '制作中', done: '已完成' }[status] || status
}

function toggleNote(id) {
  expandedDish.value = expandedDish.value === id ? null : id
}

async function handleOrder(dish) {
  try {
    const order = await orderStore.placeOrder(userStore.userId, dish.id, dishNotes[dish.id] || '')
    socketStore.emitNewOrder(order)
    message.success(`已点：${dish.name} 🎉`)
    dishNotes.value[dish.id] = ''
    expandedDish.value = null
    await orderStore.fetchUserOrders(userStore.userId)
    await orderStore.fetchStats()
  } catch (err) {
    message.error(err.response?.data?.error || '下单失败')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      orderStore.fetchDishes(),
      orderStore.fetchUserOrders(userStore.userId),
      orderStore.fetchStats()
    ])
  } finally {
    loading.value = false
  }

  socketStore.onMyOrderUpdate((order) => {
    orderStore.updateLocalOrder(order)
    socketStore.addNotification({
      type: order.status === 'done' ? 'success' : 'info',
      title: '订单状态更新',
      message: `${order.dish_name} → ${statusText(order.status)}`
    })
    orderStore.fetchStats()
  })
})
</script>

<style scoped>
.home-page { display: flex; flex-direction: column; gap: 16px; }

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 50%, #ffad80 100%);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 8px 30px rgba(255, 107, 53, 0.25);
  animation: fadeInUp 0.5s ease;
}
.welcome-text h2 { font-size: 20px; font-weight: 700; }
.welcome-text p { font-size: 14px; opacity: 0.9; margin-top: 4px; }
.welcome-emoji { font-size: 48px; animation: bounce 2s ease infinite; }

/* 统计 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  animation: fadeInUp 0.6s ease;
}
.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px 12px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.stat-card.pending { border-bottom: 3px solid #f0a020; }
.stat-card.cooking { border-bottom: 3px solid #2080f0; }
.stat-card.done { border-bottom: 3px solid #18a058; }
.stat-icon { font-size: 22px; margin-bottom: 6px; }
.stat-value { font-size: 24px; font-weight: 800; color: #333; }
.stat-label { font-size: 11px; color: #999; margin-top: 2px; }

/* 区块标题 */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.section-icon { font-size: 20px; }
.section-title { font-size: 18px; font-weight: 700; color: #333; }
.section-badge {
  background: #ff6b35;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 菜品 */
.dish-section {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  animation: fadeInUp 0.7s ease;
}
.category-group { margin-bottom: 16px; }
.category-group:last-child { margin-bottom: 0; }
.category-tag {
  display: inline-block;
  background: linear-gradient(135deg, #fff5f0, #ffe8db);
  color: #ff6b35;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  margin-bottom: 12px;
}
.dish-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.dish-card {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dish-card:hover {
  border-color: #ffccaa;
  background: #fff8f4;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.1);
}
.dish-card.expanded { border-color: #ff6b35; background: #fff; }
.dish-top { display: flex; justify-content: space-between; align-items: center; }
.dish-name { font-size: 15px; font-weight: 600; color: #333; }
.dish-price { font-size: 16px; font-weight: 800; color: #ff6b35; }
.dish-bottom { display: flex; gap: 6px; }
.note-input { flex: 1; }
.order-btn {
  background: linear-gradient(135deg, #ff6b35, #ff8c5a);
  color: #fff;
  border: none;
  padding: 4px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.order-btn:hover { box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); }
.order-btn:active { transform: scale(0.95); }
.dish-hint {
  font-size: 11px;
  color: #ccc;
  text-align: center;
}

/* 订单列表 */
.order-list {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  animation: fadeInUp 0.8s ease;
}
.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}
.order-item:last-child { border-bottom: none; }
.order-item:hover { background: #fafafa; }
.order-name { font-weight: 600; font-size: 15px; color: #333; }
.order-meta { font-size: 12px; color: #999; margin-top: 2px; }
.order-right { text-align: right; }
.order-price { font-weight: 700; color: #ff6b35; font-size: 15px; display: block; }
.order-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
  display: inline-block;
  margin-top: 4px;
}
.order-status.pending { background: #fff7e6; color: #f0a020; }
.order-status.cooking { background: #e6f4ff; color: #2080f0; }
.order-status.done { background: #e8f8e8; color: #18a058; }

@keyframes fadeInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* 手机适配 */
@media (max-width: 600px) {
  .welcome-banner { padding: 18px; border-radius: 16px; }
  .welcome-text h2 { font-size: 17px; }
  .welcome-emoji { font-size: 36px; }
  .stats-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .stat-card { padding: 12px 8px; border-radius: 12px; }
  .stat-value { font-size: 20px; }
  .dish-section { padding: 14px; border-radius: 16px; }
  .dish-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .dish-card { padding: 12px; border-radius: 12px; }
  .dish-name { font-size: 14px; }
  .dish-price { font-size: 14px; }
  .order-item { padding: 12px 16px; }
}
</style>
