<script setup>
import { computed } from 'vue'
import { Scatter } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

const props = defineProps({
  data: { type: Array, required: true }
})

const chartData = computed(() => ({
  datasets: [{
    label: '年齡 vs 總杯數',
    data: props.data,
    backgroundColor: 'rgba(255, 99, 132, 0.6)',
    borderColor: 'rgba(255, 99, 132, 1)',
    pointRadius: 8,
    pointHoverRadius: 10
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
          title: function(context) {
            const point = context[0]
            return `年齡: ${point.parsed.x} 歲`
          },
          label: function(context) {
            const point = context.parsed
            return `總杯數: ${point.y} 杯`
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: '年齡'
        },
        min: 15,
        max: 40
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '總杯數'
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
  <figure role="img" aria-label="年齡與消費量關聯分析散點圖">
    <div class="chart-container">
      <Scatter :data="chartData" :options="chartOptions" />
    </div>
    <figcaption class="chart-caption">
      年齡 vs 消費量關聯分析 - 共 {{ data.length }} 個資料點
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
