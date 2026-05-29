<template>
  <div class="history-page">
    <!-- 标题横幅 -->
    <div class="history-banner">
      <div class="banner-text">
        <h2>📋 历史订单</h2>
        <p>查看你的点餐记录</p>
      </div>
      <div class="banner-emoji">📜</div>
    </div>

    <!-- 订单列表 -->
    <div class="history-content">
      <n-spin :show="loading">
        <div class="empty-state" v-if="!Object.keys(orderStore.history).length">
          <div class="empty-icon">📭</div>
          <div class="empty-text">暂无历史订单</div>
          <div class="empty-hint">快去点几道菜吧~</div>
        </div>

        <div v-for="(orders, date) in orderStore.history" :key="date" class="date-group">
          <div class="date-header" @click="toggleDate(date)">
            <div class="date-left">
              <span class="date-icon">📅</span>
              <span class="date-title">{{ date }}</span>
            </div>
            <div class="date-right">
              <span class="date-count">{{ orders.length }} 单</span>
              <span class="date-amount">¥{{ orders.reduce((sum, o) => sum + o.price, 0).toFixed(2) }}</span>
              <span class="date-arrow">{{ expandedDates.has(date) ? '▼' : '▶' }}</span>
            </div>
          </div>

          <div class="date-orders" v-if="expandedDates.has(date)">
            <div v-for="order in orders" :key="order.id" class="order-item">
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
      </n-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useOrderStore } from '../stores/order'
import { useUserStore } from '../stores/user'
import { NSpin } from 'naive-ui'

const orderStore = useOrderStore()
const userStore = useUserStore()
const loading = ref(false)
const expandedDates = ref(new Set())

function statusText(status) {
  return { pending: '待处理', cooking: '制作中', done: '已完成' }[status] || status
}

function toggleDate(date) {
  if (expandedDates.value.has(date)) {
    expandedDates.value.delete(date)
  } else {
    expandedDates.value.add(date)
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await orderStore.fetchHistory(userStore.userId)
    // 默认展开第一天
    const dates = Object.keys(orderStore.history)
    if (dates.length) expandedDates.value.add(dates[0])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.history-page { display: flex; flex-direction: column; gap: 16px; max-width: 800px; margin: 0 auto; }

/* 横幅 */
.history-banner {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 8px 30px rgba(67, 233, 123, 0.25);
  animation: fadeInUp 0.5s ease;
}
.banner-text h2 { font-size: 20px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.banner-text p { font-size: 14px; opacity: 0.9; margin-top: 4px; }
.banner-emoji { font-size: 48px; }

/* 内容 */
.history-content {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  animation: fadeInUp 0.6s ease;
}

/* 日期分组 */
.date-group {
  margin-bottom: 12px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}
.date-group:last-child { margin-bottom: 0; }
.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
  cursor: pointer;
  transition: background 0.2s;
}
.date-header:hover { background: #f0f0f0; }
.date-left { display: flex; align-items: center; gap: 8px; }
.date-icon { font-size: 18px; }
.date-title { font-size: 15px; font-weight: 700; color: #333; }
.date-right { display: flex; align-items: center; gap: 10px; }
.date-count {
  font-size: 12px;
  background: #ff6b35;
  color: #fff;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
}
.date-amount { font-size: 14px; font-weight: 700; color: #ff6b35; }
.date-arrow { font-size: 10px; color: #999; transition: transform 0.2s; }

/* 订单项 */
.date-orders { border-top: 1px solid #f0f0f0; }
.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid #f8f8f8;
  transition: background 0.2s;
}
.order-item:last-child { border-bottom: none; }
.order-item:hover { background: #fafafa; }
.order-name { font-weight: 600; font-size: 14px; color: #333; }
.order-meta { font-size: 12px; color: #999; margin-top: 2px; }
.order-right { text-align: right; }
.order-price { font-weight: 700; color: #ff6b35; font-size: 14px; display: block; }
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

/* 空状态 */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 18px; font-weight: 600; color: #999; }
.empty-hint { font-size: 14px; color: #ccc; margin-top: 8px; }

@keyframes fadeInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 手机适配 */
@media (max-width: 600px) {
  .history-banner { padding: 18px; border-radius: 16px; }
  .banner-text h2 { font-size: 17px; }
  .banner-emoji { font-size: 36px; }
  .history-content { padding: 14px; border-radius: 16px; }
  .date-header { padding: 12px 14px; }
  .date-title { font-size: 14px; }
  .order-item { padding: 10px 14px; }
}
</style>
