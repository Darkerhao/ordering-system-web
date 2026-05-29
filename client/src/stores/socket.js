import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io } from 'socket.io-client'

export const useSocketStore = defineStore('socket', () => {
  const socket = ref(null)
  const connected = ref(false)
  const notifications = ref([])

  // 保存用户信息和事件回调，断线重连时恢复
  let savedUserId = null
  let savedRole = null
  const eventCallbacks = {
    kitchen_new_order: [],
    my_order_update: [],
    order_update: [],
  }

  function connect(userId, role) {
    savedUserId = userId
    savedRole = role

    // 已有连接，直接加入房间
    if (socket.value?.connected) {
      socket.value.emit('join', { userId, role })
      return
    }

    // 已有 socket 实例但断开了，先销毁
    if (socket.value) {
      socket.value.removeAllListeners()
      socket.value = null
    }

    socket.value = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    })

    // 连接成功
    socket.value.on('connect', () => {
      connected.value = true
      console.log('✅ WebSocket 已连接，socket id:', socket.value.id)
      // 加入房间
      if (savedUserId && savedRole) {
        socket.value.emit('join', { userId: savedUserId, role: savedRole })
        console.log(`👤 已加入房间: userId=${savedUserId}, role=${savedRole}`)
      }
    })

    // 断线
    socket.value.on('disconnect', (reason) => {
      connected.value = false
      console.log('❌ WebSocket 断开:', reason)
    })

    // 重连成功
    socket.value.on('reconnect', () => {
      console.log('🔄 WebSocket 重连成功')
    })

    // 重新注册所有事件回调
    _reattachCallbacks()
  }

  // 将回调绑定到当前 socket 实例
  function _reattachCallbacks() {
    if (!socket.value) return
    for (const [event, callbacks] of Object.entries(eventCallbacks)) {
      // 先移除旧监听，再重新绑定
      socket.value.removeAllListeners(event)
      for (const cb of callbacks) {
        socket.value.on(event, cb)
      }
    }
  }

  function join(userId, role) {
    savedUserId = userId
    savedRole = role
    if (socket.value?.connected) {
      socket.value.emit('join', { userId, role })
    }
  }

  function emitNewOrder(order) {
    if (socket.value?.connected) {
      socket.value.emit('new_order', order)
    } else {
      console.warn('⚠️ Socket 未连接，无法发送新订单通知')
    }
  }

  function emitStatusUpdate(order, userId) {
    if (socket.value?.connected) {
      socket.value.emit('status_update', { order, userId })
    } else {
      console.warn('⚠️ Socket 未连接，无法发送状态更新通知')
    }
  }

  // 注册事件（持久化存储回调，断线重连时自动恢复）
  function onKitchenNewOrder(callback) {
    eventCallbacks.kitchen_new_order.push(callback)
    socket.value?.on('kitchen_new_order', callback)
  }

  function onMyOrderUpdate(callback) {
    eventCallbacks.my_order_update.push(callback)
    socket.value?.on('my_order_update', callback)
  }

  function onOrderUpdate(callback) {
    eventCallbacks.order_update.push(callback)
    socket.value?.on('order_update', callback)
  }

  function addNotification(msg) {
    const id = Date.now()
    notifications.value.push({ id, ...msg })
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }, 5000)
  }

  function disconnect() {
    savedUserId = null
    savedRole = null
    // 清空回调
    Object.keys(eventCallbacks).forEach(k => { eventCallbacks[k] = [] })
    socket.value?.removeAllListeners()
    socket.value?.disconnect()
    socket.value = null
    connected.value = false
  }

  return {
    socket, connected, notifications,
    connect, join, emitNewOrder, emitStatusUpdate,
    onKitchenNewOrder, onMyOrderUpdate, onOrderUpdate,
    addNotification, disconnect
  }
})
