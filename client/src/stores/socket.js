import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io } from 'socket.io-client'

export const useSocketStore = defineStore('socket', () => {
  const socket = ref(null)
  const connected = ref(false)
  const notifications = ref([])

  function connect(userId, role) {
    if (socket.value?.connected) {
      // 已连接，直接加入房间
      socket.value.emit('join', { userId, role })
      return
    }

    socket.value = io(window.location.origin, { transports: ['websocket', 'polling'] })

    socket.value.on('connect', () => {
      connected.value = true
      console.log('✅ WebSocket 已连接')
      // 连接成功后自动加入房间
      if (userId && role) {
        socket.value.emit('join', { userId, role })
        console.log(`👤 已加入房间: userId=${userId}, role=${role}`)
      }
    })

    socket.value.on('disconnect', () => {
      connected.value = false
      console.log('❌ WebSocket 已断开')
    })

    return socket.value
  }

  function join(userId, role) {
    if (socket.value?.connected) {
      socket.value.emit('join', { userId, role })
    }
  }

  function emitNewOrder(order) {
    socket.value?.emit('new_order', order)
  }

  function emitStatusUpdate(order, userId) {
    socket.value?.emit('status_update', { order, userId })
  }

  function onKitchenNewOrder(callback) {
    socket.value?.on('kitchen_new_order', callback)
  }

  function onMyOrderUpdate(callback) {
    socket.value?.on('my_order_update', callback)
  }

  function onOrderUpdate(callback) {
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
