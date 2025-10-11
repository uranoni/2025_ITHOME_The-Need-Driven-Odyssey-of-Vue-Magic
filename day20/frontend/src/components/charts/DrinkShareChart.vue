<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  labels: { type: Array, required: true },
  data: { type: Array, required: true }
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    data: props.data,
    backgroundColor: [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40'
    ],
    borderColor: [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40'
    ],
    borderWidth: 2
  }]
}))

const chartOptions = computed(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} 杯 (${percentage}%)`
          }
        }
      }
    },
    animation: {
      duration: prefersReducedMotion ? 0 : 800
    }
  }
})
</script>

<template>
  <figure role="img" :aria-label="`飲品佔比圖表，顯示 ${labels.join('、')} 等飲料的銷售比例`">
    <div class="chart-container">
      <Pie :data="chartData" :options="chartOptions" />
    </div>
    <figcaption class="chart-caption">
      飲品佔比分析 - 總計 {{ data.reduce((a, b) => a + b, 0) }} 杯
    </figcaption>
  </figure>
</template>

<style scoped>
.chart-container {
  height: 300px;
  position: relative;
}

.chart-caption {
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}
</style>
