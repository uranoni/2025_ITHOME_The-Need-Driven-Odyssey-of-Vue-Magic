import axios from 'axios'

// 建立 axios 實例
export const http = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 請求攔截器
http.interceptors.request.use(
  (config) => {
    // 可以在這裡加入 loading 狀態或 token
    console.log('發送請求:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('請求錯誤:', error)
    return Promise.reject(error)
  }
)

// 回應攔截器
http.interceptors.response.use(
  (response) => {
    console.log('收到回應:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('回應錯誤:', error.response?.status, error.message)
    
    // 統一處理錯誤
    if (error.response) {
      // 伺服器回應了錯誤狀態碼
      const { status, data } = error.response
      switch (status) {
        case 404:
          console.error('資源不存在:', data.error)
          break
        case 500:
          console.error('伺服器錯誤:', data.error)
          break
        default:
          console.error('API 錯誤:', data.error || error.message)
      }
    } else if (error.request) {
      // 請求已發送但沒有收到回應
      console.error('網路錯誤: 無法連接到伺服器')
    } else {
      // 其他錯誤
      console.error('未知錯誤:', error.message)
    }
    
    return Promise.reject(error)
  }
)
