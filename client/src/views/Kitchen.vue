<template>
  <div class="kitchen-page">
    <!-- 厨房横幅 -->
    <div class="kitchen-banner">
      <div class="banner-text">
        <h2>👨‍🍳 厨房看板</h2>
        <p>管理今日所有订单</p>
      </div>
      <div class="banner-emoji">🍳</div>
    </div>

    <!-- 统计 -->
    <div class="stats-row" v-if="orderStore.stats">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-value">{{ orderStore.stats.total }}</div>
        <div class="stat-label">总单数</div>
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
      <div class="stat-card money">
        <div class="stat-icon">💰</div>
        <div class="stat-value">¥{{ orderStore.stats.totalAmount }}</div>
        <div class="stat-label">今日营收</div>
      </div>
    </div>

    <!-- 热门菜品 -->
    <div class="popular-section" v-if="orderStore.stats?.popular?.length">
      <div class="section-header">
        <span class="section-icon">🔥</span>
        <span class="section-title">今日热门</span>
      </div>
      <div class="popular-tags">
        <span v-for="(item, i) in orderStore.stats.popular" :key="i" class="popular-tag" :class="`rank-${i+1}`">
          {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅' }}
          {{ item.name }} × {{ item.count }}
        </span>
      </div>
    </div>

    <!-- 订单看板 -->
    <n-spin :show="loading">
      <!-- 待处理 -->
      <div class="order-section" v-if="pendingOrders.length">
        <div class="section-header">
          <span class="section-icon">🔔</span>
          <span class="section-title">待处理</span>
          <span class="count-badge pending">{{ pendingOrders.length }}</span>
        </div>
        <div class="order-grid">
          <div v-for="order in pendingOrders" :key="order.id" class="order-card pending">
            <div class="card-top">
              <span class="card-dish">{{ order.dish_name }}</span>
              <span class="card-price">¥{{ order.price }}</span>
            </div>
            <div class="card-user">👤 {{ order.username }}</div>
            <div class="card-note" v-if="order.note">📝 {{ order.note }}</div>
            <div class="card-time">{{ formatTime(order.created_at) }}</div>
            <div class="card-actions" v-if="userStore.isChef">
              <button class="action-btn cook" @click="updateStatus(order, 'cooking')">🔥 开始做</button>
              <button class="action-btn done" @click="updateStatus(order, 'done')">✅ 完成</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 制作中 -->
      <div class="order-section" v-if="cookingOrders.length">
        <div class="section-header">
          <span class="section-icon">🔥</span>
          <span class="section-title">制作中</span>
          <span class="count-badge cooking">{{ cookingOrders.length }}</span>
        </div>
        <div class="order-grid">
          <div v-for="order in cookingOrders" :key="order.id" class="order-card cooking">
            <div class="card-top">
              <span class="card-dish">{{ order.dish_name }}</span>
              <span class="card-price">¥{{ order.price }}</span>
            </div>
            <div class="card-user">👤 {{ order.username }}</div>
            <div class="card-time">{{ formatTime(order.created_at) }}</div>
            <div class="card-actions" v-if="userStore.isChef">
              <button class="action-btn done" @click="updateStatus(order, 'done')">✅ 完成制作</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 已完成 -->
      <div class="order-section" v-if="doneOrders.length">
        <div class="section-header">
          <span class="section-icon">✅</span>
          <span class="section-title">已完成</span>
          <span class="count-badge done">{{ doneOrders.length }}</span>
        </div>
        <div class="order-grid">
          <div v-for="order in doneOrders" :key="order.id" class="order-card done-card">
            <div class="card-top">
              <span class="card-dish">{{ order.dish_name }}</span>
              <span class="card-price">¥{{ order.price }}</span>
            </div>
            <div class="card-user">👤 {{ order.username }}</div>
            <div class="card-time">{{ formatTime(order.created_at) }}</div>
          </div>
        </div>
      </div>

      <div class="empty-state" v-if="!orderStore.kitchenOrders.length">
        <div class="empty-icon">📭</div>
        <div class="empty-text">今日暂无订单</div>
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useUserStore } from '../stores/user'
import { useOrderStore } from '../stores/order'
import { useSocketStore } from '../stores/socket'
import { NSpin } from 'naive-ui'

const message = useMessage()
const userStore = useUserStore()
const orderStore = useOrderStore()
const socketStore = useSocketStore()
const loading = ref(false)

const pendingOrders = computed(() => orderStore.kitchenOrders.filter(o => o.status === 'pending'))
const cookingOrders = computed(() => orderStore.kitchenOrders.filter(o => o.status === 'cooking'))
const doneOrders = computed(() => orderStore.kitchenOrders.filter(o => o.status === 'done'))

function formatTime(t) {
  if (!t) return ''
  return t.split('T')[1]?.substring(0, 5) || t.split(' ')[1]?.substring(0, 5) || t
}

async function updateStatus(order, status) {
  try {
    const updated = await orderStore.updateOrderStatus(order.id, status)
    socketStore.emitStatusUpdate(updated, order.user_id)
    message.success(`${order.dish_name} → ${status === 'cooking' ? '制作中' : '已完成'}`)
    await orderStore.fetchStats()
  } catch (err) {
    message.error(err.response?.data?.error || '操作失败，请稍后重试')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([orderStore.fetchKitchenOrders(), orderStore.fetchStats()])
  } finally {
    loading.value = false
  }

  socketStore.onKitchenNewOrder((order) => {
    orderStore.addKitchenOrder(order)
    socketStore.addNotification({
      type: 'warning',
      title: '🆕 新订单',
      message: `${order.username} 点了 ${order.dish_name}`
    })
    orderStore.fetchStats()
  })

  socketStore.onOrderUpdate(() => {
    orderStore.fetchKitchenOrders()
    orderStore.fetchStats()
  })
})
</script>

<style scoped>
.kitchen-page { display: flex; flex-direction: column; gap: 16px; }

/* 横幅 */
.kitchen-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
  animation: fadeInUp 0.5s ease;
}
.banner-text h2 { font-size: 20px; font-weight: 700; }
.banner-text p { font-size: 14px; opacity: 0.9; margin-top: 4px; }
.banner-emoji { font-size: 48px; }

/* 统计 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  animation: fadeInUp 0.6s ease;
}
.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 14px 8px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
}
.stat-card:hover { transform: translateY(-3px); }
.stat-card.pending { border-bottom: 3px solid #f0a020; }
.stat-card.cooking { border-bottom: 3px solid #667eea; }
.stat-card.done { border-bottom: 3px solid #18a058; }
.stat-card.money { border-bottom: 3px solid #ff6b35; }
.stat-icon { font-size: 20px; margin-bottom: 4px; }
.stat-value { font-size: 22px; font-weight: 800; color: #333; }
.stat-label { font-size: 11px; color: #999; margin-top: 2px; }

/* 区块标题 */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.section-icon { font-size: 18px; }
.section-title { font-size: 17px; font-weight: 700; color: #333; }
.count-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 10px;
  color: #fff;
}
.count-badge.pending { background: #f0a020; }
.count-badge.cooking { background: #667eea; }
.count-badge.done { background: #18a058; }

/* 热门 */
.popular-section {
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  animation: fadeInUp 0.65s ease;
}
.popular-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.popular-tag {
  background: #f5f5f5;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}
.popular-tag.rank-1 { background: #fff1e6; color: #e8800c; }
.popular-tag.rank-2 { background: #fff7e6; color: #f0a020; }
.popular-tag.rank-3 { background: #e6f4ff; color: #2080f0; }

/* 订单区块 */
.order-section { margin-bottom: 8px; animation: fadeInUp 0.7s ease; }
.order-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

/* 订单卡片 */
.order-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.order-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.order-card.pending { border-left: 4px solid #f0a020; }
.order-card.cooking { border-left: 4px solid #667eea; }
.order-card.done-card { border-left: 4px solid #18a058; opacity: 0.75; }
.card-top { display: flex; justify-content: space-between; align-items: center; }
.card-dish { font-size: 16px; font-weight: 700; color: #333; }
.card-price { font-size: 15px; font-weight: 800; color: #ff6b35; }
.card-user { font-size: 13px; color: #666; }
.card-note { font-size: 12px; color: #e8800c; background: #fff7e6; padding: 4px 10px; border-radius: 8px; }
.card-time { font-size: 11px; color: #bbb; }
.card-actions { display: flex; gap: 8px; margin-top: 4px; }
.action-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:active { transform: scale(0.95); }
.action-btn.cook {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}
.action-btn.done {
  background: linear-gradient(135deg, #18a058, #36ad6a);
  color: #fff;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #ccc;
}
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 16px; }

@keyframes fadeInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 手机适配 */
@media (max-width: 600px) {
  .kitchen-banner { padding: 18px; border-radius: 16px; }
  .banner-text h2 { font-size: 17px; }
  .banner-emoji { font-size: 36px; }
  .stats-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .stat-card { padding: 10px 6px; border-radius: 12px; }
  .stat-value { font-size: 18px; }
  .order-grid { grid-template-columns: 1fr; }
  .popular-section { padding: 12px 16px; border-radius: 12px; }
}
</style>
