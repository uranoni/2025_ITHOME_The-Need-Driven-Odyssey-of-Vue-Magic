<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  labels: { type: Array, required: true },
  data: { type: Array, required: true },
  title: { type: String, default: '時間趨勢' }
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    label: '訂單數量',
    data: props.data,
    borderColor: 'rgb(75, 192, 192)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    tension: 0.4,
    fill: true,
    pointBackgroundColor: 'rgb(75, 192, 192)',
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    pointRadius: 5,
    pointHoverRadius: 7
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
            return `${context.label}: ${context.parsed.y} 筆訂單`
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
          text: '訂單數量'
        }
      },
      x: {
        title: {
          display: true,
          text: '日期'
        }
      }
    },
    animation: {
      duration: prefersReducedMotion ? 0 : 1000
    }
  }
})
</script>

<template>
  <figure role="img" :aria-label="`${title}圖表，顯示時間序列的訂單趨勢`">
    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <figcaption class="chart-caption">
      {{ title }} - 總計 {{ data.reduce((a, b) => a + b, 0) }} 筆訂單
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
