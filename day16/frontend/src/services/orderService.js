import { http } from './http'

export const OrderService = {
  /**
   * 取得所有訂單
   * @returns {Promise<Array>} 訂單陣列
   */
  async list() {
    const { data } = await http.get('/api/orders')
    return data
  },

  /**
   * 取得單筆訂單
   * @param {string} id
   */
  async getById(id, token) {
    const { data } = await http.get(`/api/orders/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    return data
  },

  /**
   * 新增訂單
   * @param {Object} payload - 訂單資料
   * @param {string} payload.name - 姓名
   * @param {string} payload.note - 備註
   * @param {string} payload.drink - 飲料
   * @param {string} payload.sweetness - 甜度
   * @param {string} payload.ice - 冰量
   * @returns {Promise<Object>} 新建的訂單
   */
  async create(payload) {
    const { data } = await http.post('/api/orders', payload)
    return data
  },

  /**
   * 更新訂單
   * @param {string} id - 訂單 ID
   * @param {Object} patch - 要更新的欄位
   * @returns {Promise<Object>} 更新後的訂單
   */
  async update(id, patch) {
    const { data } = await http.put(`/api/orders/${id}`, patch)
    return data
  },

  /**
   * 刪除訂單
   * @param {string} id - 訂單 ID
   * @returns {Promise<Object>} 刪除結果
   */
  async remove(id) {
    const { data } = await http.delete(`/api/orders/${id}`)
    return data
  },

  /**
   * 批次覆蓋整份訂單（祕書匯入情境）
   * @param {Array} orders - 訂單陣列
   * @returns {Promise<Array>} 覆蓋後的訂單陣列
   */
  async replaceAll(orders) {
    const { data } = await http.put('/api/orders/bulk', orders)
    return data
  },
}
