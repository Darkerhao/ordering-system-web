import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const kitchenOrders = ref([])
  const history = ref({})
  const stats = ref(null)
  const dishes = ref([])

  async function fetchDishes() {
    const { data } = await axios.get('/api/dishes')
    dishes.value = data
  }

  async function fetchUserOrders(userId) {
    const { data } = await axios.get(`/api/orders/user/${userId}`)
    orders.value = data
  }

  async function fetchKitchenOrders() {
    const { data } = await axios.get('/api/orders/kitchen')
    kitchenOrders.value = data
  }

  async function fetchHistory(userId) {
    const { data } = await axios.get(`/api/orders/user/${userId}/history`)
    history.value = data
  }

  async function fetchStats() {
    const { data } = await axios.get('/api/orders/stats/today')
    stats.value = data
  }

  async function placeOrder(userId, dishId, note = '') {
    const { data } = await axios.post('/api/orders', { userId, dishId, note })
    return data.order
  }

  async function updateOrderStatus(orderId, status) {
    const { data } = await axios.patch(`/api/orders/${orderId}/status`, { status })
    return data.order
  }

  // 本地更新订单状态（避免重复请求）
  function updateLocalOrder(order) {
    const idx = orders.value.findIndex(o => o.id === order.id)
    if (idx !== -1) orders.value[idx] = { ...orders.value[idx], ...order }

    const kIdx = kitchenOrders.value.findIndex(o => o.id === order.id)
    if (kIdx !== -1) kitchenOrders.value[kIdx] = { ...kitchenOrders.value[kIdx], ...order }
  }

  function addKitchenOrder(order) {
    kitchenOrders.value.unshift(order)
  }

  return {
    orders, kitchenOrders, history, stats, dishes,
    fetchDishes, fetchUserOrders, fetchKitchenOrders,
    fetchHistory, fetchStats, placeOrder,
    updateOrderStatus, updateLocalOrder, addKitchenOrder
  }
})
