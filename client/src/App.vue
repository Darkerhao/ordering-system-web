<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <AppLayout />
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider, NMessageProvider, NNotificationProvider, NDialogProvider } from 'naive-ui'
import AppLayout from './components/AppLayout.vue'

const themeOverrides = {
  common: {
    primaryColor: '#ff6b35',
    primaryColorHover: '#ff8c5a',
    primaryColorPressed: '#e55a28',
    primaryColorSuppl: '#ff6b35',
    borderRadius: '12px',
    borderRadiusSmall: '8px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  },
  Card: {
    borderRadius: '16px',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  Button: {
    borderRadius: '10px',
  },
  Input: {
    borderRadius: '10px',
  },
  Tag: {
    borderRadius: '8px',
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: linear-gradient(135deg, #fff5f0 0%, #fef0e6 30%, #f5f0ff 70%, #f0f5ff 100%);
  min-height: 100vh;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

html { overflow-x: hidden; }

/* 全局滚动条美化 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #ccc; }

/* 全局卡片悬浮效果 */
.n-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: 1px solid rgba(0,0,0,0.04) !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04) !important;
}
.n-card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.08) !important;
  transform: translateY(-2px);
}

/* 按钮动效 */
.n-button {
  transition: all 0.25s ease !important;
}
.n-button:active {
  transform: scale(0.96);
}

/* 手机适配 */
@media (max-width: 600px) {
  .n-card { border-radius: 12px !important; }
  .n-card-header__main { font-size: 15px !important; }
  .n-divider { margin: 8px 0 !important; }
}
</style>
