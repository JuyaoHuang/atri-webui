import axios, { AxiosError } from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8430',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器：统一错误处理
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // 服务器返回错误
      const status = error.response.status
      const message = (error.response.data as { detail?: string })?.detail || '请求失败'

      console.error(`API Error [${status}]:`, message)

      switch (status) {
        case 400:
          console.error('请求错误:', message)
          break
        case 404:
          console.error('资源不存在')
          break
        case 500:
          console.error('服务器错误，请稍后重试')
          break
        default:
          console.error(message)
      }
    } else if (error.request) {
      // 请求发送但无响应
      console.error('网络连接失败，请检查网络')
    } else {
      // 其他错误
      console.error('请求失败，请重试')
    }

    return Promise.reject(error)
  }
)

export default client
