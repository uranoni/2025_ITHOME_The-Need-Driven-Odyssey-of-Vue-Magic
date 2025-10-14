<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '../stores/toastStore'
import { http } from '../services/http'
import DrinkShareChart from '../components/charts/DrinkShareChart.vue'
import AgeDistributionChart from '../components/charts/AgeDistributionChart.vue'
import TimeSeriesChart from '../components/charts/TimeSeriesChart.vue'
import AgeVsCupsScatter from '../components/charts/AgeVsCupsScatter.vue'

const { t } = useI18n()
const toast = useToastStore()

// 狀態管理
const loading = ref(true)
const error = ref('')

// 圖表資料
const drinkShareData = ref({ labels: [], data: [] })
const shopShareData = ref({ labels: [], data: [] })
const ageDistributionData = ref({ labels: [], data: [] })
const timeSeriesData = ref({ labels: [], data: [] })
const scatterData = ref([])

// 載入分析資料
async function loadAnalyticsData() {
  try {
    loading.value = true
    error.value = ''
    
    // 載入訂單和使用者資料
    const [ordersResponse, usersResponse] = await Promise.all([
      http.get('/api/orders'),
      http.get('/api/users')
    ])
    
    const orders = ordersResponse.data
    const users = usersResponse.data
    
    // 處理飲品佔比資料
    processDrinkShareData(orders)
    processShopShareData(orders)
    
    // 處理年齡分布資料
    processAgeDistributionData(users)
    
    // 處理時間序列資料
    processTimeSeriesData(orders)
    
    // 處理散點圖資料
    processScatterData(orders, users)
    
  } catch (err) {
    error.value = '載入分析資料失敗'
    toast.error('載入分析資料失敗')
    console.error('Analytics error:', err)
  } finally {
    loading.value = false
  }
}

// 處理飲品佔比資料
function processDrinkShareData(orders) {
  const drinkCounts = {}
  
  orders.forEach(order => {
    const drink = order.drink
    drinkCounts[drink] = (drinkCounts[drink] || 0) + 1
  })
  
  drinkShareData.value = {
    labels: Object.keys(drinkCounts),
    data: Object.values(drinkCounts)
  }
}

// 店家熱度（各店杯數）
function processShopShareData(orders) {
  const shopCounts = {}
  orders.forEach(o => {
    const shop = o.shop || '未指定'
    shopCounts[shop] = (shopCounts[shop] || 0) + 1
  })
  shopShareData.value = { labels: Object.keys(shopCounts), data: Object.values(shopCounts) }
}

// 處理年齡分布資料
function processAgeDistributionData(users) {
  const ageBuckets = {
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45+': 0
  }
  
  users.forEach(user => {
    if (user.age) {
      if (user.age >= 18 && user.age <= 24) {
        ageBuckets['18-24']++
      } else if (user.age >= 25 && user.age <= 34) {
        ageBuckets['25-34']++
      } else if (user.age >= 35 && user.age <= 44) {
        ageBuckets['35-44']++
      } else if (user.age >= 45) {
        ageBuckets['45+']++
      }
    }
  })
  
  ageDistributionData.value = {
    labels: Object.keys(ageBuckets),
    data: Object.values(ageBuckets)
  }
}

// 處理時間序列資料
function processTimeSeriesData(orders) {
  const dailyCounts = {}
  
  orders.forEach(order => {
    const date = new Date(order.createdAt).toISOString().split('T')[0]
    dailyCounts[date] = (dailyCounts[date] || 0) + 1
  })
  
  // 按日期排序
  const sortedDates = Object.keys(dailyCounts).sort()
  
  timeSeriesData.value = {
    labels: sortedDates,
    data: sortedDates.map(date => dailyCounts[date])
  }
}

// 處理散點圖資料
function processScatterData(orders, users) {
  const userCupCounts = {}
  
  // 計算每個使用者的總杯數
  orders.forEach(order => {
    const username = order.name
    userCupCounts[username] = (userCupCounts[username] || 0) + 1
  })
  
  // 建立散點圖資料
  const scatterPoints = []
  
  users.forEach(user => {
    if (user.age && userCupCounts[user.username]) {
      scatterPoints.push({
        x: user.age,
        y: userCupCounts[user.username]
      })
    }
  })
  
  scatterData.value = scatterPoints
}

onMounted(() => {
  loadAnalyticsData()
})
</script>

<template>
  <section class="analytics-page">
    <h2>{{ t('pages.analytics') }}</h2>
    
    <div v-if="loading" class="loading-message">
      🔄 {{ t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error-message">
      ⚠️ {{ error }}
      <button @click="loadAnalyticsData" class="btn btn-sm">{{ t('actions.reload') }}</button>
    </div>
    
    <div v-else class="analytics-grid">
      <!-- 飲品佔比圖表 -->
      <div class="chart-card">
        <h3>飲品佔比分析</h3>
        <DrinkShareChart 
          :labels="drinkShareData.labels" 
          :data="drinkShareData.data" 
        />
      </div>

      <!-- 店家熱度圖表 -->
      <div class="chart-card">
        <h3>店家熱度（下單杯數）</h3>
        <DrinkShareChart 
          :labels="shopShareData.labels" 
          :data="shopShareData.data" 
        />
      </div>
      
      <!-- 年齡分布圖表 -->
      <div class="chart-card">
        <h3>年齡分布分析</h3>
        <AgeDistributionChart 
          :labels="ageDistributionData.labels" 
          :data="ageDistributionData.data" 
        />
      </div>
      
      <!-- 時間趨勢圖表 -->
      <div class="chart-card">
        <h3>時間趨勢分析</h3>
        <TimeSeriesChart 
          :labels="timeSeriesData.labels" 
          :data="timeSeriesData.data"
          title="每日訂單趨勢"
        />
      </div>
      
      <!-- 年齡 vs 消費量散點圖 -->
      <div class="chart-card">
        <h3>年齡與消費量關聯</h3>
        <AgeVsCupsScatter :data="scatterData" />
      </div>
    </div>
    
    <div class="analytics-actions" style="margin-top: 24px;">
      <button @click="loadAnalyticsData" class="btn primary">
        {{ t('actions.refreshData') }}
      </button>
      <router-link to="/order" class="btn">
        {{ t('actions.backToOrder') }}
      </router-link>
    </div>
  </section>
</template>

<style scoped>
.analytics-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.chart-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.analytics-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.loading-message, .error-message {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .chart-card {
    padding: 16px;
  }
}
</style>
