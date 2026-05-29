<template>
  <div class="app-layout">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="router.push('/')">
          <span class="logo-icon">🍽️</span>
          <span class="logo-text">点菜系统</span>
        </div>
        <nav class="nav-links" v-if="userStore.isLoggedIn">
          <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
            <span class="nav-icon">🍜</span>
            <span class="nav-label">点菜</span>
          </router-link>
          <router-link to="/kitchen" class="nav-item" :class="{ active: route.path === '/kitchen' }" v-if="userStore.isChef">
            <span class="nav-icon">👨‍🍳</span>
            <span class="nav-label">厨房</span>
          </router-link>
          <router-link to="/history" class="nav-item" :class="{ active: route.path === '/history' }">
            <span class="nav-icon">📋</span>
            <span class="nav-label">历史</span>
          </router-link>
          <router-link to="/admin" class="nav-item" :class="{ active: route.path === '/admin' }" v-if="userStore.isAdmin">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">管理</span>
          </router-link>
        </nav>
        <div class="user-info" v-if="userStore.isLoggedIn">
          <div class="user-badge">
            <span class="user-avatar">{{ userStore.isChef ? '👨‍🍳' : userStore.isAdmin ? '👑' : '😊' }}</span>
            <span class="username">{{ userStore.username }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout">退出</button>
        </div>
      </div>
    </header>

    <!-- 实时通知弹窗 -->
    <div class="notifications">
      <transition-group name="notify">
        <div
          v-for="n in socketStore.notifications"
          :key="n.id"
          class="notify-card"
          :class="n.type || 'info'"
        >
          <span class="notify-icon">{{ n.type === 'success' ? '✅' : n.type === 'warning' ? '🔔' : 'ℹ️' }}</span>
          <div class="notify-body">
            <div class="notify-title">{{ n.title }}</div>
            <div class="notify-msg">{{ n.message }}</div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- 主内容 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useSocketStore } from '../stores/socket'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const socketStore = useSocketStore()

onMounted(() => {
  if (userStore.isLoggedIn) {
    socketStore.connect(userStore.userId, userStore.user?.role)
  }
})

onUnmounted(() => {
  socketStore.disconnect()
})

function handleLogout() {
  socketStore.disconnect()
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-layout { min-height: 100vh; }

/* 头部导航 */
.header {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 50%, #ffad80 100%);
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.logo-icon { font-size: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
.logo-text {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  letter-spacing: 1px;
}

/* 导航链接 */
.nav-links { display: flex; gap: 4px; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
}
.nav-item:hover, .nav-item.active {
  background: rgba(255,255,255,0.25);
  color: #fff;
  transform: translateY(-1px);
}
.nav-icon { font-size: 16px; }

/* 用户信息 */
.user-info { display: flex; align-items: center; gap: 10px; }
.user-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.2);
  padding: 4px 12px 4px 6px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}
.user-avatar { font-size: 20px; }
.username { color: #fff; font-weight: 600; font-size: 13px; }
.logout-btn {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  padding: 5px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.25s ease;
  backdrop-filter: blur(10px);
}
.logout-btn:hover {
  background: rgba(255,255,255,0.3);
}

/* 通知 */
.notifications {
  position: fixed;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 90%;
  max-width: 360px;
}
.notify-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  animation: slideDown 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.notify-card.warning { border-left: 4px solid #f0a020; }
.notify-card.success { border-left: 4px solid #18a058; }
.notify-card.info { border-left: 4px solid #2080f0; }
.notify-icon { font-size: 20px; margin-top: 2px; }
.notify-title { font-weight: 700; font-size: 14px; }
.notify-msg { font-size: 12px; color: #666; margin-top: 2px; }

/* 通知动画 */
.notify-enter-active { animation: slideDown 0.35s ease; }
.notify-leave-active { animation: slideUp 0.25s ease; }

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-20px); opacity: 0; }
}

/* 主内容 */
.main-content { max-width: 1200px; margin: 0 auto; padding: 16px; }

/* 手机适配 */
@media (max-width: 600px) {
  .header { padding: 0 10px; height: 50px; }
  .logo-text { display: none; }
  .nav-label { display: none; }
  .nav-item { padding: 6px 10px; }
  .username { display: none; }
  .user-badge { padding: 4px 8px 4px 4px; }
  .main-content { padding: 10px; }
}
</style>
