import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!user.value)
  const isChef = computed(() => user.value?.role === 'chef')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userId = computed(() => user.value?.id)
  const username = computed(() => user.value?.username)

  function setUser(userData) {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    user.value = null
    localStorage.removeItem('user')
  }

  return { user, isLoggedIn, isChef, isAdmin, userId, username, setUser, logout }
})
