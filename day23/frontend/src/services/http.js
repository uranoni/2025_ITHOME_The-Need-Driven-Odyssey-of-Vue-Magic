import axios from 'axios'

// 建立 axios 實例
export const http = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
})

// 請求攔截器
http.interceptors.request.use(
  (config) => {
    // 若送的是 FormData，讓瀏覽器自動帶 boundary，不要手動指定 Content-Type
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type']
      }
    } else {
      // 預設 JSON
      config.headers = { ...(config.headers || {}), 'Content-Type': 'application/json' }
    }
    // 自動加入認證 token
    try {
      const authState = localStorage.getItem('authState')
      if (authState) {
        const { token } = JSON.parse(authState)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch (error) {
      console.warn('無法讀取認證狀態:', error)
    }
    
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
  async (error) => {
    console.error('回應錯誤:', error.response?.status, error.message)
    
    // 統一處理錯誤並顯示 Toast
    const msg = error?.response?.data?.error || error.message || '發生錯誤'
    // 動態 import 避免循環依賴（在 SSR/測試也安全）
    const { useToastStore } = await import('../stores/toastStore')
    useToastStore().error(msg)
    
    return Promise.reject(error)
  }
)
