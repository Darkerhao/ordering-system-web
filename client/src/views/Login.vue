<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">🍽️</div>
        <h1 class="auth-title">欢迎回来</h1>
        <p class="auth-subtitle">登录你的账号，开始点菜吧</p>
      </div>

      <n-form ref="formRef" :model="form" :rules="rules" class="auth-form">
        <n-form-item path="username">
          <n-input v-model:value="form.username" placeholder="请输入用户名" size="large" @keyup.enter="handleLogin">
            <template #prefix>👤</template>
          </n-input>
        </n-form-item>
        <n-form-item path="password">
          <n-input v-model:value="form.password" type="password" placeholder="请输入密码" size="large" show-password-on="click" @keyup.enter="handleLogin">
            <template #prefix>🔒</template>
          </n-input>
        </n-form-item>
        <n-button type="primary" block size="large" :loading="loading" class="submit-btn" @click="handleLogin">
          登 录
        </n-button>
      </n-form>

      <div class="auth-footer">
        还没有账号？
        <span class="link" @click="router.push('/register')">立即注册</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import axios from 'axios'
import { useUserStore } from '../stores/user'
import { NForm, NFormItem, NInput, NButton } from 'naive-ui'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = ref({ username: '', password: '' })
const rules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' }
}

async function handleLogin() {
  try { await formRef.value?.validate() } catch { return }
  loading.value = true
  try {
    const { data } = await axios.post('/api/auth/login', form.value)
    userStore.setUser(data.user)
    message.success('登录成功')
    router.push('/')
  } catch (err) {
    message.error(err.response?.data?.error || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 82px);
  padding: 20px;
}
.auth-card {
  max-width: 420px;
  width: 100%;
  background: #fff;
  border-radius: 24px;
  padding: 40px 32px 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 4px 20px rgba(255, 107, 53, 0.1);
  text-align: center;
  animation: fadeInUp 0.5s ease;
}
.auth-header { margin-bottom: 32px; }
.auth-logo {
  font-size: 56px;
  margin-bottom: 16px;
  animation: bounce 2s ease infinite;
}
.auth-title {
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6b35, #ff8c5a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.auth-subtitle { color: #999; font-size: 14px; margin-top: 8px; }
.auth-form { text-align: left; }
.submit-btn {
  margin-top: 8px;
  height: 46px !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #ff6b35, #ff8c5a) !important;
  border: none !important;
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.35) !important;
}
.submit-btn:hover {
  box-shadow: 0 8px 30px rgba(255, 107, 53, 0.5) !important;
  transform: translateY(-2px);
}
.auth-footer { margin-top: 24px; color: #999; font-size: 14px; }
.link {
  color: #ff6b35;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}
.link:hover { color: #ff8c5a; }

@keyframes fadeInUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 600px) {
  .auth-card { padding: 28px 20px 24px; border-radius: 20px; }
  .auth-logo { font-size: 44px; }
  .auth-title { font-size: 22px; }
}
</style>
