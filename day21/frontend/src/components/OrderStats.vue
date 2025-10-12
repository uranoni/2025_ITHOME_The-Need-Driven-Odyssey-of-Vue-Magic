<script setup>
const props = defineProps({
  orders:  { type: Array, required: true },
  summary: { type: Array, required: true }
})
</script>

<template>
  <section v-if="props.orders.length" class="stats">
    <h3>{{$t('pages.stats')}}</h3>
    <table class="table">
      <thead>
        <tr>
          <th>{{$t('fields.drink')}}</th><th>{{$t('fields.sweetness')}}</th><th>{{$t('fields.ice')}}</th><th>{{$t('fields.count')}}</th>
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
          <td colspan="3">{{$t('fields.totalCups')}}</td>
          <td class="qty">{{ props.orders.length }}</td>
        </tr>
      </tfoot>
    </table>
  </section>
</template>
