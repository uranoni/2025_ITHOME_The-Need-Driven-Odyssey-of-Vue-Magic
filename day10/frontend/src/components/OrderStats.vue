<script setup>
const props = defineProps({
  orders:  { type: Array, required: true },
  summary: { type: Array, required: true }
})
</script>

<template>
  <section v-if="props.orders.length" class="stats">
    <h3>統計結果</h3>
    <table class="table">
      <thead>
        <tr>
          <th>飲料</th><th>甜度</th><th>冰量</th><th>數量</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in props.summary" :key="row.key">
          <td>{{ row.drink }}</td>
          <td>{{ row.sweetness }}</td>
          <td>{{ row.ice }}</td>
          <td class="qty">{{ row.count }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">總杯數</td>
          <td class="qty">{{ props.orders.length }}</td>
        </tr>
      </tfoot>
    </table>
  </section>
</template>
