<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  labels: { type: Array, required: true },
  data: { type: Array, required: true }
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    label: '使用者數量',
    data: props.data,
    backgroundColor: 'rgba(54, 162, 235, 0.6)',
    borderColor: 'rgba(54, 162, 235, 1)',
    borderWidth: 2,
    borderRadius: 4,
    borderSkipped: false
  }]
}))

const chartOptions = computed(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.y} 人`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: '使用者數量'
        }
      },
      x: {
        title: {
          display: true,
          text: '年齡區間'
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
  <figure role="img" :aria-label="`年齡分布圖表，顯示 ${labels.join('、')} 等年齡區間的使用者分布`">
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <figcaption class="chart-caption">
      年齡分布分析 - 總計 {{ data.reduce((a, b) => a + b, 0) }} 人
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
