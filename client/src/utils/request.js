import axios from 'axios'

// 请求拦截器：自动注入用户信息到请求头
axios.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (user) {
    config.headers['x-user-id'] = user.id
    config.headers['x-user-role'] = user.role
  }
  return config
})

export default axios
